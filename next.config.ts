// next.config.ts

import type { NextConfig } from "next"

const nextConfig: NextConfig = {

  // ── Turbopack (Next.js 15+ default) ──────────────────────────────────────────
  turbopack: {
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },

  // ── Images ──────────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      // AWS S3
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      // Cloudflare R2
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      // Cloudflare CDN
      {
        protocol: "https",
        hostname: "**.cloudflare.com",
      },
      // Google OAuth avatars
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // GitHub avatars
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      // Unsplash (dev/seed images)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // ── Security Headers ─────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",  value: "nosniff"                        },
          { key: "X-Frame-Options",         value: "DENY"                           },
          { key: "X-XSS-Protection",        value: "1; mode=block"                  },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ]
  },

  // ── Redirects ────────────────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source:      "/shop",
        destination: "/products",
        permanent:   true,
      },
    ]
  },

  // ── TypeScript & ESLint ───────────────────────────────────────────────────────
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig