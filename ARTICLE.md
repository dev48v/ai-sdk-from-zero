---
title: "I Built a ChatGPT-Clone in 100 Lines of Next.js (Streaming + Tools + One-Line Provider Swap)"
published: true
description: "Day 41 of TechFromZero. The Vercel AI SDK is the abstraction that finally makes building a real chat UI a one-evening project. Streaming tokens, system prompt, tool calls — 100 lines, every line explained."
tags: ai, nextjs, typescript, beginners
series: TechFromZero
---

Open [ai-sdk-from-zero.vercel.app](https://ai-sdk-from-zero.vercel.app). Type *"what time is it in Tokyo?"*

Watch the tokens stream in. A small `🔧 get_current_time` pill appears mid-message. Then the assistant tells you the actual time, in actual Tokyo, computed by an actual function I wrote — not made up from training data.

That's three years of "this is hard" disappearing in ~100 lines of Next.js.

## What the Vercel AI SDK fixes

Three years ago, "stream LLM tokens to a browser" meant standing up a WebSocket server, hand-decoding SSE frames, and writing a careful state machine to append text to a React ref without dropping frames or double-rendering on StrictMode.

Today it's `useChat`. One hook. The whole thing.

The Vercel AI SDK is the distribution-model fix for AI chat:

- **Provider-neutral.** Gemini, Claude, GPT-4, Mistral, Groq, Ollama. One line in `src/lib/ai.ts` swaps the entire backend.
- **Streaming by default.** Token-level visibility is a first-class feature, not a footnote.
- **Tool calls included.** Model emits a call, SDK runs your handler, model sees the result, composes the final reply — all on the same response stream.
- **TypeScript-first.** Schemas via Zod. Types flow end-to-end.

If you're building any kind of chat surface — support agent, internal Q&A, dev tool, AI tutor — this is the abstraction.

## Step 1: the server (15 lines)

```ts
// src/app/api/chat/route.ts
import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { model } from '@/lib/ai'

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()
  const result = streamText({
    model,
    system: 'You are a friendly coding tutor.',
    messages: await convertToModelMessages(messages)
  })
  return result.toUIMessageStreamResponse()
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
```

That's the streaming chat backend. `streamText()` returns an async stream of model chunks. `.toUIMessageStreamResponse()` wraps it in an HTTP response with the framing `useChat` expects. The system prompt conditions the model without consuming a user turn.

## Step 2: the provider (3 lines)

```ts
// src/lib/ai.ts
import { google } from '@ai-sdk/google'
export const model = google('gemini-2.5-flash')
```

To swap to Claude:

```ts
import { anthropic } from '@ai-sdk/anthropic'
export const model = anthropic('claude-sonnet-4-5')
```

The streaming endpoint and chat UI don't care. The SDK normalises every provider's wire format. **One line to swap.** That's not marketing — that's the architecture.

I default to Gemini 2.5 Flash because Google's free tier (15 req/min, 1M req/day) lets readers clone the repo and run it without paying. Anthropic dropped its free trial in 2024; new accounts need $5 paid credit.

## Step 3: the client (~50 lines)

```tsx
'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState } from 'react'

export default function Page() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' })
  })

  return (
    <main>
      {messages.map(m => (
        <div key={m.id} className={`msg-${m.role}`}>
          {m.parts.map((p, i) =>
            p.type === 'text' ? <span key={i}>{p.text}</span> : null
          )}
        </div>
      ))}

      <form onSubmit={e => {
        e.preventDefault()
        if (input.trim()) { sendMessage({ text: input }); setInput('') }
      }}>
        <input value={input} onChange={e => setInput(e.target.value)} />
        <button>Send</button>
      </form>
    </main>
  )
}
```

`useChat` is the killer feature. It collects input, fetches `/api/chat`, decodes the SSE stream frame by frame, and incrementally appends tokens to the latest assistant message. Every token arriving triggers a re-render. No WebSockets, no manual SSE parsing, no token batching logic, no double-render guards.

50 lines and you have a working chat UI.

## Step 4: tools (the real superpower)

A chatbot is fun. A chatbot that can call **functions you wrote** is a real product:

```ts
import { streamText, tool, stepCountIs } from 'ai'
import { z } from 'zod'

const tools = {
  get_current_time: tool({
    description: 'Get the current date and time.',
    inputSchema: z.object({
      timezone: z.string().optional().describe('IANA timezone, e.g. "Asia/Kolkata".')
    }),
    execute: async ({ timezone }) => ({
      human: new Date().toLocaleString('en-US', { timeZone: timezone ?? 'UTC' })
    })
  })
}

const result = streamText({
  model,
  messages: await convertToModelMessages(messages),
  tools,
  stopWhen: stepCountIs(3)   // allow up to 3 tool calls per user turn
})
```

The SDK handles the entire request/response loop:

1. The model decides it needs the current time.
2. Emits a tool call with `{ timezone: "Asia/Tokyo" }`.
3. The SDK runs your `execute` handler.
4. The SDK feeds the result back to the model.
5. The model writes the final reply incorporating the actual time.

All on the **same response stream**. The client sees it as one continuous assistant turn — with a small marker showing a tool was called.

`stopWhen: stepCountIs(3)` lets the model chain tool calls within a single user turn — useful for agents that compose multiple operations.

## What this changes

Three years ago you'd write a Slack bot wrapping the OpenAI API. Two years ago you'd write a ChatGPT plugin (deprecated 2024). A year ago you'd hand-roll an SSE decoder + a useEffect dance + a token batcher.

Today you write `useChat({ transport: ... })`, drop a `streamText()` route handler, optionally register a Zod-validated tool, and you ship.

The Vercel AI SDK isn't a clever wrapper. It's the **abstraction that should have existed three years ago** — the one that lets the streaming + tool-call + provider-swap complexity disappear into the framework so you can focus on what the bot actually does.

If you've been holding off on building a real AI chat product because "the plumbing looks scary" — that excuse is gone.

The code for this demo is on [GitHub](https://github.com/dev48v/ai-sdk-from-zero), with eight step-by-step commits you can follow. The live version is at [ai-sdk-from-zero.vercel.app](https://ai-sdk-from-zero.vercel.app). Open it. Ask it the time in Tokyo. Watch the tool fire.

That's the Vercel AI SDK.

---

🔗 Code: [github.com/dev48v/ai-sdk-from-zero](https://github.com/dev48v/ai-sdk-from-zero)
🌐 Live demo: [ai-sdk-from-zero.vercel.app](https://ai-sdk-from-zero.vercel.app)
📚 Series: [TechFromZero](https://dev48v.infy.uk/techfromzero.php) — a new technology every day, all free, all open source.
