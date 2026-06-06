Day 41 - Today I built a ChatGPT-clone in 100 lines of Next.js with streaming, tool calls, and one-line provider swap.


🚀TechFromZero Series - AISDKFromZero


🌐 Try it live: https://ai-sdk-from-zero.vercel.app


This isn't a Hello World. It's a real streaming chat UI with a tutor persona, two demo tools the model can call mid-conversation, and a provider abstraction that lets you swap Gemini → Claude → GPT-4 → Mistral with ONE LINE of code:
📐 React useChat ↔ SSE /api/chat ↔ Vercel AI SDK streamText ↔ Gemini 2.5 Flash


🔗 The full code (with step-by-step commits you can follow):
https://github.com/dev48v/ai-sdk-from-zero


🧱 What I built (step by step):
1️⃣ Next.js 15 + App Router + TypeScript scaffold

2️⃣ @ai-sdk/google provider with one-line abstraction over Gemini 2.5 Flash (free tier — no credit card)

3️⃣ POST /api/chat with streamText() + toUIMessageStreamResponse() — 15-line streaming backend

4️⃣ useChat hook + chat UI — manages messages, decodes SSE frame-by-frame, appends tokens with streaming caret

5️⃣ Auto-scroll on every streamed token + 4 suggestion chips for empty state

6️⃣ System prompt + tutor persona — conditions the model without consuming a user turn

7️⃣ Tool calling with get_current_time + word_count — model emits call, SDK runs handler, model sees result, composes reply ALL on the same stream

8️⃣ README + provider-swap notes (Gemini → Claude → GPT-4 → Ollama, one line)


💡 Every file has detailed comments explaining WHY, not just what. Written for any beginner who wants to learn the Vercel AI SDK by reading real code — with full clarity on each step.


👉 Three years ago "stream LLM tokens to a browser" meant WebSocket plumbing + hand-decoded SSE + careful React refs. Today it's useChat(). One hook. If you've been holding off on building a real AI chat product because "the plumbing looks scary" — that excuse is gone.


🔥 This is Day 41 of a 50-day series. A new technology every day. Follow along!


🌐 See all days: https://dev48v.infy.uk/techfromzero.php


#TechFromZero #Day41 #VercelAISDK #NextJS #LearnByDoing #OpenSource #BeginnerGuide #100DaysOfCode
