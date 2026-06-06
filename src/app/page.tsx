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
import { useState } from 'react'
import { modelLabel } from '@/lib/ai-meta'

export default function Page() {
  const [input, setInput] = useState('')
  // `useChat` returns messages + a sendMessage helper. The hook handles
  // streaming decoding internally — every render we see the partial
  // assistant message as it grows token by token.
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' })
  })

  const isStreaming = status === 'streaming' || status === 'submitted'

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
        <div className="messages">
          {messages.length === 0 && (
            <div className="empty">Say hello. Press Enter to send.</div>
          )}
          {messages.map(m => (
            <div key={m.id} className={`msg msg-${m.role}`}>
              <span className="msg-role">{m.role === 'user' ? 'you' : modelLabel}</span>
              <div className="msg-body">
                {m.parts.map((part, i) =>
                  part.type === 'text' ? <span key={i}>{part.text}</span> : null
                )}
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
            if (!input.trim() || isStreaming) return
            sendMessage({ text: input })
            setInput('')
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
