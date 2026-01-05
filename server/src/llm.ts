// ice/server/src/llm.ts
//
// LLM provider wrapper with:
// - Ollama default (free/local)
// - Optional Groq fallback
// - Per-request model override
// - Ollama JSON forcing + keep_alive
// - FAST_MODE tuning (good for M1 16GB)

import { z } from "zod";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
type CallOptions = { model?: string };

const GroqResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string().optional().nullable(),
      }),
    })
  ),
});

const OllamaResponseSchema = z.object({
  message: z.object({
    content: z.string().optional().nullable(),
  }),
});

function env(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

function boolEnv(name: string, fallback = false) {
  const v = env(name, fallback ? "true" : "false").toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

export async function callLLM(messages: ChatMessage[], opts: CallOptions = {}): Promise<string> {
  const provider = env("LLM_PROVIDER", "ollama").toLowerCase();
  if (provider === "groq") return callGroq(messages);

  // Default: Ollama (free, local)
  return callOllama(messages, opts.model);
}

async function callGroq(messages: ChatMessage[]): Promise<string> {
  const apiKey = env("GROQ_API_KEY");
  if (!apiKey) {
    // If Groq isn't configured, fall back to Ollama
    return callOllama(messages);
  }

  const model = env("GROQ_MODEL", "llama-3.1-70b-versatile");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Groq error ${res.status}: ${text || res.statusText}`);
  }

  const parsed = GroqResponseSchema.safeParse(await res.json());
  if (!parsed.success) {
    throw new Error("Groq returned an unexpected response shape");
  }

  return parsed.data.choices?.[0]?.message?.content?.toString() ?? "";
}

async function callOllama(messages: ChatMessage[], modelOverride?: string): Promise<string> {
  const host = env("OLLAMA_HOST", "http://localhost:11434").replace(/\/$/, "");

  // Default model (recommended for M1 16GB: qwen2.5-coder:7b)
  const modelFromEnv = env("OLLAMA_MODEL", "qwen2.5-coder:7b");
  const model = (modelOverride?.trim() ? modelOverride.trim() : modelFromEnv).trim();

  // FAST_MODE tunes output length + context for ~1–2 minute generations on M1 16GB.
  const fast = boolEnv("FAST_MODE", true);

  const options = fast
    ? {
      temperature: 0.15,
      num_ctx: 8192,
      num_predict: 2600,
    }
    : {
      temperature: 0.15,
      num_ctx: 8192,
      num_predict: 4200,
    };

  const res = await fetch(`${host}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,

      // ✅ Forces JSON-only output in message.content (prevents JSON.parse crashes)
      format: "json",

      // ✅ Keep the model warm between requests (speeds up repeated generations)
      keep_alive: "10m",

      options,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ollama error ${res.status}: ${text || res.statusText}. (Is Ollama running at ${host}?)`);
  }

  const parsed = OllamaResponseSchema.safeParse(await res.json());
  if (!parsed.success) {
    throw new Error("Ollama returned an unexpected response shape");
  }

  return parsed.data.message?.content?.toString() ?? "";
}
