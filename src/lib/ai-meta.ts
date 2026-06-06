// Re-export of the model label only — `src/lib/ai.ts` pulls server-only
// provider code (the API key reads happen at module init), so client
// components must import the label from this client-safe file.
export const modelLabel = 'Gemini 2.5 Flash'
