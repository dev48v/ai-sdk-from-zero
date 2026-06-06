// STEP 4 — Client-side chat UI built on the `useChat` hook.
//
// `useChat` is the killer feature of @ai-sdk/react: a single hook that
// manages messages state, fetches POST /api/chat, decodes the SSE stream
// frame by frame, and incrementally appends tokens to the latest assistant
// message. We supply a transport (the HTTP endpoint) and write the input form.
// That's it. No websockets, no event-source plumbing, no JSON parsing.
'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useEffect, useRef, useState } from 'react'
import { modelLabel } from '@/lib/ai-meta'

const SUGGESTIONS = [
  'Explain WebAssembly in one paragraph.',
  'What time is it in Tokyo? Use a tool.',
  'Count the words in "The quick brown fox jumps over the lazy dog".',
  'Recommend a beginner project for learning Rust.'
]

export default function Page() {
  const [input, setInput] = useState('')
  // `useChat` returns messages + a sendMessage helper. The hook handles
  // streaming decoding internally — every render we see the partial
  // assistant message as it grows token by token.
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' })
  })

  const isStreaming = status === 'streaming' || status === 'submitted'

  // STEP 5 — Auto-scroll to bottom whenever a new chunk lands. We watch
  // the last assistant message's text length so we re-scroll on EVERY
  // streamed token, not just on message-count changes.
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const lastText = messages[messages.length - 1]?.parts
    .map(p => (p.type === 'text' ? p.text : ''))
    .join('') ?? ''
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, lastText.length])

  function send(text: string) {
    if (!text.trim() || isStreaming) return
    sendMessage({ text })
    setInput('')
  }

  return (
    <main className="app">
      <header className="hero">
        <span className="badge">Day 41 · TechFromZero</span>
        <h1>
          <span className="grad">AI SDK</span> From Zero
        </h1>
        <p className="sub">
          Streaming chat UI with {modelLabel} (swap providers in one line)
          using the Vercel AI SDK + Next.js App Router. No WebSocket setup,
          no token wrangling.
        </p>
      </header>

      <section className="card">
        <div className="messages" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="empty">
              <p>Say hello. Or try one of these:</p>
              <div className="suggestions">
                {SUGGESTIONS.map(s => (
                  <button key={s} className="suggestion" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map(m => (
            <div key={m.id} className={`msg msg-${m.role}`}>
              <span className="msg-role">{m.role === 'user' ? 'you' : modelLabel}</span>
              <div className="msg-body">
                {m.parts.map((part, i) => {
                  if (part.type === 'text') return <span key={i}>{part.text}</span>
                  // STEP 7 — tool-call markers. Each tool invocation arrives
                  // as its own part on the assistant message. Show a small
                  // pill so the user knows the model called a real function.
                  if (part.type?.startsWith?.('tool-')) {
                    const name = part.type.replace(/^tool-/, '')
                    return <div key={i} className="tool-pill">🔧 {name}</div>
                  }
                  return null
                })}
                {/* Streaming caret on the last assistant message while tokens arrive. */}
                {m.role === 'assistant' && isStreaming && m === messages[messages.length - 1] && (
                  <span className="caret" />
                )}
              </div>
            </div>
          ))}
        </div>

        <form
          className="composer"
          onSubmit={e => {
            e.preventDefault()
            send(input)
          }}
        >
          <input
            className="composer-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isStreaming ? 'Generating…' : 'Type a message…'}
            disabled={isStreaming}
          />
          <button className="composer-send" disabled={!input.trim() || isStreaming}>
            {isStreaming ? '…' : 'Send'}
          </button>
        </form>
      </section>
    </main>
  )
}
