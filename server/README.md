# Backend (Website Generator API)

This folder contains a lightweight Node/Express backend used by the Ice frontend.

## Quick start

1) Copy env:

```bash
cp server/.env.example server/.env
```

2) Install + run from the repo root:

```bash
npm install
npm run dev:full
```

The frontend runs on Vite (port 8080) and proxies `/api/*` to the backend (port 8787).

## Free LLM options

The backend prefers **Ollama** (local, completely free), and can also use **Groq** if you set an API key.

### Ollama (default)

Install Ollama, then pull a model:

```bash
ollama pull llama3.1
```

Set in `server/.env`:

```bash
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3.1
```

### Groq (optional)

Set in `server/.env`:

```bash
LLM_PROVIDER=groq
GROQ_API_KEY=...your key...
GROQ_MODEL=llama-3.1-70b-versatile
```

## Endpoints

- `GET /api/health`
- `POST /api/generate-website` — returns a JSON "project" containing multiple files (index.html, styles.css, app.js, etc.)
