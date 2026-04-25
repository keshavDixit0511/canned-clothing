// next.config.ts

import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    workerThreads: true,
  },

  // -- Images ------------------------------------------------------------------
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudflare.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // -- TypeScript & ESLint -----------------------------------------------------
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
