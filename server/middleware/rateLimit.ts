// server/middleware/rateLimit.ts

import { NextRequest, NextResponse } from "next/server"

// ─── In-memory store (use Redis in production for multi-instance) ──────────────

interface RateLimitEntry {
  count:     number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  store.forEach((entry, key) => {
    if (entry.resetTime < now) store.delete(key)
  })
}, 5 * 60 * 1000)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RateLimitOptions {
  /** Max requests per window */
  limit:       number
  /** Window size in seconds */
  windowSecs:  number
  /** Key prefix for namespacing */
  prefix?:     string
}

export interface RateLimitResult {
  success:   boolean
  limit:     number
  remaining: number
  reset:     number  // Unix timestamp (seconds)
}

// ─── Core rate limiter ────────────────────────────────────────────────────────

export function rateLimit(options: RateLimitOptions) {
  const { limit, windowSecs, prefix = "rl" } = options

  return function check(identifier: string): RateLimitResult {
    const key     = `${prefix}:${identifier}`
    const now     = Date.now()
    const windowMs = windowSecs * 1000

    const entry = store.get(key)

    // First request or window expired
    if (!entry || entry.resetTime < now) {
      store.set(key, { count: 1, resetTime: now + windowMs })
      return {
        success:   true,
        limit,
        remaining: limit - 1,
        reset:     Math.floor((now + windowMs) / 1000),
      }
    }

    // Within window
    if (entry.count >= limit) {
      return {
        success:   false,
        limit,
        remaining: 0,
        reset:     Math.floor(entry.resetTime / 1000),
      }
    }

    entry.count++
    return {
      success:   true,
      limit,
      remaining: limit - entry.count,
      reset:     Math.floor(entry.resetTime / 1000),
    }
  }
}

// ─── Preset limiters ──────────────────────────────────────────────────────────

/** Strict: 5 requests per minute — for auth endpoints */
export const authLimiter = rateLimit({ limit: 5, windowSecs: 60, prefix: "auth" })

/** Standard: 60 requests per minute — for general API */
export const apiLimiter = rateLimit({ limit: 60, windowSecs: 60, prefix: "api" })

/** Upload: 10 requests per minute — for file uploads */
export const uploadLimiter = rateLimit({ limit: 10, windowSecs: 60, prefix: "upload" })

// ─── Middleware helper ────────────────────────────────────────────────────────

/**
 * Get the client IP from a request.
 */
export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

/**
 * Apply rate limiting to a route handler.
 *
 * Usage:
 *   export const POST = withRateLimit(authLimiter, async (req) => { ... })
 */
export function withRateLimit(
  limiter:  ReturnType<typeof rateLimit>,
  handler:  (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
    const ip     = getClientIP(req)
    const result = limiter(ip)

    if (!result.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later.", code: "RATE_LIMITED" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit":     String(result.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset":     String(result.reset),
            "Retry-After":           String(result.reset - Math.floor(Date.now() / 1000)),
          },
        }
      )
    }

    const response = await handler(req, ...args)

    // Add rate limit headers to successful responses
    response.headers.set("X-RateLimit-Limit",     String(result.limit))
    response.headers.set("X-RateLimit-Remaining", String(result.remaining))
    response.headers.set("X-RateLimit-Reset",     String(result.reset))

    return response
  }
}
