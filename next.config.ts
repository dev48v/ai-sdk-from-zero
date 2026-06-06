import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Keep the bundle tight — AI SDK pulls in provider packages dynamically.
  // No experimental flags needed for the chat demo.
}

export default nextConfig
