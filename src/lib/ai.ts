// STEP 2 — Provider boot.
//
// The Vercel AI SDK is provider-agnostic by design: streamText() takes a
// `model` field whose value comes from a provider package
// (@ai-sdk/google, @ai-sdk/anthropic, @ai-sdk/openai, @ai-sdk/mistral...).
// To swap from Gemini to Claude we change ONE line in this file — the
// streaming endpoint + chat UI don't know which model they're talking to.
//
// We default to Gemini 2.5 Flash because Google's free tier (15 req/min,
// 1M req/day) lets readers replicate without paying for credits. Anthropic
// dropped its free trial in 2024 — new accounts need $5 paid credit, which
// adds friction to "clone the repo and run it" learning.
import { google } from '@ai-sdk/google'

// `gemini-2.5-flash` = free tier, fast (~0.5 s first token), good enough for
// chat. `gemini-2.5-pro` requires billing — set up a paid GCP project before
// switching. `gemini-2.0-flash-exp` works too but is rate-limited harder.
//
// To swap to Claude: `npm i @ai-sdk/anthropic` then
//   import { anthropic } from '@ai-sdk/anthropic'
//   export const model = anthropic('claude-sonnet-4-5')
export const model = google('gemini-2.5-flash')

// The label is shown in the chat UI so users know which model answered.
// Update it together with `model` when swapping providers.
export const modelLabel = 'Gemini 2.5 Flash'
