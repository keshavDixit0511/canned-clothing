// server/redis/redis.ts

/**
 * Redis client using ioredis.
 * Falls back gracefully if Redis is not configured.
 *
 * Install: bun add ioredis
 * Env: REDIS_URL=redis://localhost:6379
 */

let redis: any = null
let isConnected = false

async function getRedis() {
  if (redis) return redis

  const url = process.env.REDIS_URL
  if (!url) {
    console.warn("[Redis] REDIS_URL not set — Redis disabled, falling back to in-memory")
    return null
  }

  try {
    const { default: Redis } = await import("ioredis")
    redis = new Redis(url, {
      maxRetriesPerRequest:    3,
      enableReadyCheck:        true,
      connectTimeout:          10_000,
      lazyConnect:             true,
      retryStrategy: (times) => {
        if (times > 3) return null  // Stop retrying after 3 attempts
        return Math.min(times * 200, 2000)
      },
    })

    redis.on("connect",   () => { isConnected = true;  console.log("[Redis] Connected") })
    redis.on("error",     (err: Error) => console.error("[Redis] Error:", err.message))
    redis.on("close",     () => { isConnected = false; console.warn("[Redis] Disconnected") })

    await redis.connect()
    return redis
  } catch (err) {
    console.error("[Redis] Failed to connect:", err)
    return null
  }
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

/**
 * Get a cached value by key.
 * Returns null if not found or Redis unavailable.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = await getRedis()
  if (!client) return null

  try {
    const value = await client.get(key)
    if (!value) return null
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

/**
 * Set a cache value with optional TTL in seconds.
 */
export async function cacheSet(
  key:        string,
  value:      unknown,
  ttlSeconds: number = 300
): Promise<void> {
  const client = await getRedis()
  if (!client) return

  try {
    await client.setex(key, ttlSeconds, JSON.stringify(value))
  } catch (err) {
    console.error("[Redis] cacheSet error:", err)
  }
}

/**
 * Delete a cache entry.
 */
export async function cacheDel(key: string): Promise<void> {
  const client = await getRedis()
  if (!client) return

  try {
    await client.del(key)
  } catch (err) {
    console.error("[Redis] cacheDel error:", err)
  }
}

/**
 * Delete all keys matching a pattern.
 * Example: invalidatePattern("products:*")
 */
export async function invalidatePattern(pattern: string): Promise<void> {
  const client = await getRedis()
  if (!client) return

  try {
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      await client.del(...keys)
    }
  } catch (err) {
    console.error("[Redis] invalidatePattern error:", err)
  }
}

/**
 * Increment a counter (for rate limiting, analytics).
 */
export async function cacheIncr(key: string, ttlSeconds?: number): Promise<number> {
  const client = await getRedis()
  if (!client) return 0

  try {
    const count = await client.incr(key)
    if (ttlSeconds && count === 1) {
      await client.expire(key, ttlSeconds)
    }
    return count
  } catch {
    return 0
  }
}

export { getRedis }
export default getRedis