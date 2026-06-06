// STEP 1 — Hero shell. STEPS 4-7 turn this into a live streaming chat UI.
export default function Page() {
  return (
    <main className="app">
      <header className="hero">
        <span className="badge">Day 41 · TechFromZero</span>
        <h1>
          <span className="grad">AI SDK</span> From Zero
        </h1>
        <p className="sub">
          Streaming chat UI with Claude (or Gemini, or GPT-4 — one-line swap)
          using the Vercel AI SDK + Next.js App Router. No WebSocket setup, no
          token wrangling.
        </p>
      </header>
      <section className="card">
        <p className="coming-soon">Streaming endpoint + chat UI land in STEPS 3-5.</p>
      </section>
    </main>
  )
}
