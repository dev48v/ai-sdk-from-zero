// STEP 1 — Root layout. App Router file convention: every page below
// /app inherits this HTML/body wrapper. STEPS 3-7 add the chat route +
// streaming endpoint inside this layout.
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI SDK From Zero — Streaming chat with Claude in 100 lines',
  description:
    'Day 41 of TechFromZero. Build a ChatGPT-clone with the Vercel AI SDK + Next.js App Router. Server-sent streaming, useChat hook, provider-swap in one line.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
