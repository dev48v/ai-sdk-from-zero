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

// App Router auto-detects this as POST /api/chat. The body shape comes from
// `useChat`: `{ messages: UIMessage[], id?: string }`. We pass the messages
// through convertToModelMessages() to drop client-only metadata (timestamps,
// pending state) before sending to the model.
export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model,
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
