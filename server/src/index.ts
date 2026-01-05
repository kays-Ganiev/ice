import "dotenv/config";
import express from "express";
import cors from "cors";
import { z } from "zod";
import { callLLM } from "./llm";
import { buildSystemPrompt, buildUserPrompt } from "./prompt";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const GenerateSchema = z.object({
  prompt: z.string().min(1),
  generateImages: z.boolean().optional(),
  model: z.string().min(1).optional(), // ✅ allow frontend to choose model
});

function stripCodeFences(s: string) {
  let t = s.trim();
  if (t.startsWith("```json")) t = t.slice(7);
  else if (t.startsWith("```")) t = t.slice(3);
  if (t.endsWith("```")) t = t.slice(0, -3);
  return t.trim();
}

function extractFirstJsonObject(s: string) {
  const t = s.trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) return t.slice(first, last + 1);
  return t;
}

// Escapes raw control chars (newline/tab/etc) *inside* JSON strings
function escapeControlCharsInsideJsonStrings(input: string) {
  let out = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (!inString) {
      if (ch === '"') inString = true;
      out += ch;
      continue;
    }

    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      out += ch;
      escaped = true;
      continue;
    }

    if (ch === '"') {
      out += ch;
      inString = false;
      continue;
    }

    const code = ch.charCodeAt(0);
    if (code < 0x20) {
      if (ch === "\n") out += "\\n";
      else if (ch === "\r") out += "\\r";
      else if (ch === "\t") out += "\\t";
      else out += `\\u${code.toString(16).padStart(4, "0")}`;
      continue;
    }

    out += ch;
  }

  return out;
}

app.post("/api/generate-website", async (req, res) => {
  const parsed = GenerateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  try {
    const system = buildSystemPrompt();
    const user = buildUserPrompt(parsed.data.prompt);

    const content = await callLLM(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { model: parsed.data.model }
    );

    let cleaned = extractFirstJsonObject(stripCodeFences(content));

    // Parse with fallback sanitizer
    let project: any;
    try {
      project = JSON.parse(cleaned);
    } catch {
      project = JSON.parse(escapeControlCharsInsideJsonStrings(cleaned));
    }

    res.json(project);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("/api/generate-website error:", err);
    res.status(500).json({ error: message });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Ice backend listening on http://localhost:${port}`);
});
