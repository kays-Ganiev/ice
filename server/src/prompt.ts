// ice/server/src/prompt.ts
//
// This file takes a short “basic prompt” from the UI and expands it into a
// detailed, high-quality website spec before sending it to the LLM.
// It also keeps the output contract strict: JSON only.

function env(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

function looksLikeAlreadyDetailed(prompt: string) {
  const p = prompt.trim();
  // If user already provided a long spec, don't over-expand
  return (
    p.length > 350 ||
    /requirements\s*:|sections\s*:|tech\s*stack\s*:|must include\s*:/i.test(p)
  );
}

function guessSiteType(prompt: string) {
  const p = prompt.toLowerCase();
  if (p.includes("portfolio")) return "portfolio";
  if (p.includes("saas") || p.includes("startup")) return "saas landing";
  if (p.includes("restaurant") || p.includes("coffee") || p.includes("cafe")) return "restaurant";
  if (p.includes("ecommerce") || p.includes("shop") || p.includes("store")) return "ecommerce";
  if (p.includes("blog")) return "blog";
  if (p.includes("agency") || p.includes("studio")) return "agency";
  if (p.includes("event") || p.includes("conference")) return "event";
  return "modern marketing site";
}

function expandPrompt(userPrompt: string) {
  const siteType = guessSiteType(userPrompt);

  const pricingLine =
    siteType === "saas landing"
      ? `- Pricing section: 3 tiers (Starter / Pro / Business), clearly designed cards, feature bullets, and one "Most Popular" highlight.`
      : `- Replace Pricing with a section appropriate to the idea (e.g., Services / Menu / Packages / Plans), still using 3–6 cards with strong visual design.`;

  return `
You are generating a polished, production-quality website.

USER'S BASIC IDEA (keep the intent, improve everything):
"${userPrompt.trim()}"

GOAL
Turn that into a premium ${siteType} that looks like a real high-end product — not a demo.

STYLE & QUALITY BAR (must follow)
- Modern UI with strong visual hierarchy, consistent spacing (8px grid), premium typography.
- Use believable copy (NO "lorem ipsum"). Create a brand name + tagline that fits.
- Responsive mobile-first layout; great desktop layout; no broken overflow.
- Add real UI polish: hover states, focus rings, active states, nice section transitions.
- Accessibility: semantic HTML, labels for inputs, aria where needed.

PAGE STRUCTURE (must include)
- Sticky navbar with brand + 4–6 links + primary CTA button
- Hero: headline, subheadline, CTA(s), plus a visual (mock cards / illustration layout / dashboard preview)
- Features: 6 items with icons
- Social proof: logos or metrics
- Testimonials: 3 (realistic names + roles)
${pricingLine}
- FAQ: 6 questions
- Final CTA section
- Footer: multi-column links + legal links

CONTENT REQUIREMENTS
- Invent consistent brand voice, product/service names, and supporting details.
- Provide realistic numbers (stats, pricing, metrics) that fit the concept.
- Keep text concise, punchy, and consistent in tone.

TECHNICAL REQUIREMENTS
- Use the project's existing stack and conventions (React + Tailwind, shadcn/ui if present).
- Clean component structure: create reusable section components (Hero, Features, SocialProof, Testimonials, Pricing/Services, FAQ, Footer).
- Use local arrays/objects for repeated UI (features, testimonials, FAQs, tiers).
- No external network calls required. Avoid remote images; use simple inline SVG or placeholder blocks.

OUTPUT FORMAT (STRICT)
Return ONLY valid JSON (no markdown, no extra commentary, no code fences).
JSON shape MUST be:
{
  "files": [
    { "filename": "path/from/project/root", "language": "tsx|ts|css|json|md", "content": "..." }
  ]
}

VERY IMPORTANT JSON RULES
- Every "content" must be a valid JSON string:
  - escape newlines as \\n
  - escape tabs as \\t
  - escape quotes as \\\"
  - escape backslashes as \\\\
- Do not include raw newlines inside JSON strings.

Deliver the full set of files needed for the website to run in this project.
`.trim();
}

export function buildSystemPrompt() {
  // Keep the system prompt strict and short so the model follows the JSON contract.
  return `
You are a website generator.
You must output ONLY valid JSON with the exact schema requested by the user prompt.
No markdown. No explanations. No code fences.
All file contents must be JSON-escaped strings (use \\n, \\t, \\\", \\\\).
`.trim();
}

export function buildUserPrompt(userPrompt: string) {
  const enhance = env("PROMPT_ENHANCE", "true").toLowerCase() !== "false";

  if (!enhance) return userPrompt;
  if (looksLikeAlreadyDetailed(userPrompt)) return userPrompt;

  return expandPrompt(userPrompt);
}
