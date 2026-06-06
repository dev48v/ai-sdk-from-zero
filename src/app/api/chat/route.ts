// STEP 3 — Streaming chat endpoint.
//
// The Vercel AI SDK's `streamText()` turns a model call into a stream of
// chunks (tokens, tool calls, finish events). `.toUIMessageStreamResponse()`
// wraps that stream in an HTTP response shaped exactly the way `useChat()`
// on the client expects — content-type, framing, error handling, all
// configured for you.
//
// The whole "ChatGPT-clone backend" is 15 lines.
import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { model } from '@/lib/ai'

// STEP 6 — System prompt. The system message conditions the model on
// persona, tone, and constraints WITHOUT consuming a user turn. It's
// sent on every request but invisible in the UI — exactly what you want
// for "this AI is a helpful coding tutor" framing.
//
// Keep it tight. Long system prompts eat your context budget on every
// request and slow first-token latency. ~3-5 short paragraphs is the
// sweet spot for chat assistants.
const SYSTEM_PROMPT = `You are TechFromZero Bot, a friendly coding tutor for beginners.

When asked a technical question:
- Lead with a one-sentence answer.
- Then expand with 2-4 short paragraphs.
- Use concrete, runnable code examples when relevant (always fenced).
- Avoid jargon you haven't defined first.

Keep responses focused. If the user wants more depth, they'll ask.`

// App Router auto-detects this as POST /api/chat. The body shape comes from
// `useChat`: `{ messages: UIMessage[], id?: string }`. We pass the messages
// through convertToModelMessages() to drop client-only metadata (timestamps,
// pending state) before sending to the model.
export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages)
  })

  // `toUIMessageStreamResponse` returns a Response with the framing
  // `useChat` expects (Server-Sent Events with AI SDK-specific event types).
  // The client decodes incrementally — first token visible in ~500 ms.
  return result.toUIMessageStreamResponse()
}

// Streaming responses are incompatible with Next.js's default static
// optimisation; mark this route as dynamic so it runs on every request.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
