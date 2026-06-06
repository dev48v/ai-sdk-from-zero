# AI SDK From Zero

> A ChatGPT-clone — streaming chat UI with system prompt and tool calling — in ~100 lines of Next.js + Vercel AI SDK.

**Live demo:** [ai-sdk-from-zero.vercel.app](https://ai-sdk-from-zero.vercel.app)
**Series:** [TechFromZero](https://dev48v.infy.uk/techfromzero.php) — Day 41 of 50.

The Vercel AI SDK is the abstraction layer that finally makes "build a chat UI on top of any LLM" a one-evening project. You write a streaming endpoint with `streamText()`, a UI with `useChat()`, and the SDK handles SSE framing, token-by-token rendering, tool-call routing, and provider swaps.

## What's here

- Streaming chat backed by **Google Gemini 2.5 Flash** (free, no credit card)
- Provider-swap pattern — one line change to switch to Claude / GPT-4 / Mistral / Groq / Ollama
- System prompt with a tutor persona
- Two demo tools (`get_current_time`, `word_count`) that the model can call mid-conversation
- Auto-scroll, suggestion chips, tool-call indicators

## Quick start

```bash
git clone https://github.com/dev48v/ai-sdk-from-zero.git
cd ai-sdk-from-zero
npm install
cp .env.example .env.local
# add GOOGLE_GENERATIVE_AI_API_KEY from https://aistudio.google.com/app/apikey
npm run dev
```

Open http://localhost:3000. Type a message. Watch tokens stream in. Ask "what time is it in Tokyo?" to trigger the time tool.

## How it works

```
┌────────────────┐   POST /api/chat (messages)   ┌────────────────────┐
│  useChat hook  │ ────────────────────────────► │  streamText()      │
│   (client)     │                                │  + tools + system  │
│                │ ◄──── SSE stream of tokens ──── │   → Gemini API     │
└────────────────┘                                └────────────────────┘
```

1. `useChat` collects the input + assembles a `UIMessage[]`. POSTs to `/api/chat`.
2. The route runs `streamText({ model, system, messages, tools })`. Result is an async stream of model chunks (tokens, tool calls, tool results, finish events).
3. `.toUIMessageStreamResponse()` wraps the stream in an HTTP response with SSE framing.
4. `useChat` decodes the stream frame-by-frame. Each token landing triggers a re-render. The latest assistant message grows in place.
5. If the model calls a tool, the SDK runs the `execute` handler, feeds the result back in, and continues streaming the final reply — all on the same response.

## Provider swap

Change one file (`src/lib/ai.ts`):

```ts
// Default — Google Gemini (free tier)
import { google } from '@ai-sdk/google'
export const model = google('gemini-2.5-flash')

// Claude — set ANTHROPIC_API_KEY in .env.local
// import { anthropic } from '@ai-sdk/anthropic'
// export const model = anthropic('claude-sonnet-4-5')

// GPT-4o — set OPENAI_API_KEY in .env.local
// import { openai } from '@ai-sdk/openai'
// export const model = openai('gpt-4o')

// Ollama (local, no key) — set OLLAMA_HOST=http://localhost:11434
// import { ollama } from 'ollama-ai-provider'
// export const model = ollama('llama3.2')
```

The streaming endpoint and chat UI don't care. The SDK normalises every provider's wire format.

## Step-by-step commits

| Step | What lands |
|------|-----------|
| 1 | Next.js 15 + App Router + TS scaffold |
| 2 | `@ai-sdk/google` provider, `src/lib/ai.ts` |
| 3 | POST /api/chat with `streamText` + `toUIMessageStreamResponse` |
| 4 | `useChat` hook + chat UI + streaming caret |
| 5 | Auto-scroll + suggestion chips |
| 6 | System prompt + tutor persona |
| 7 | Tool calling (`get_current_time`, `word_count`) |
| 8 | README + provider-swap notes |

## Why this matters

Three years ago, "stream LLM output to a browser" meant standing up a WebSocket server, hand-decoding SSE, and writing a state machine to append tokens to a React ref without dropping frames. Today it's `useChat`. One hook.

The Vercel AI SDK is the **distribution model fix** for AI chat:

- **Provider-neutral.** Switch backends without touching UI code.
- **Streaming by default.** Token-level visibility is a first-class feature, not a footnote.
- **Tool calls included.** Model picks tools, SDK routes the loop, you write the handlers.
- **TypeScript-first.** Schemas via Zod. Types flow end-to-end.

If you're building any kind of chat surface — support agent, internal Q&A, dev tool — this is the abstraction.

## File map

```
src/
  app/
    layout.tsx         ← root layout + global styles
    page.tsx           ← chat UI (useChat hook + composer + tool pills)
    globals.css        ← dark theme + chat message bubbles
    api/chat/route.ts  ← POST /api/chat — streamText + tools + system prompt
  lib/
    ai.ts              ← model provider (server-only)
    ai-meta.ts         ← model label (client-safe)
```

## License

MIT. Use it, fork it, teach with it.
