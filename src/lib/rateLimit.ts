import { prisma } from './db'
import { redis } from './redis'

/**
 * Rate limiter. Uses Upstash Redis (INCR + EXPIRE, fixed-window) when
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are configured — fast,
 * no extra Postgres writes. Falls back to a DB-backed sliding-window count
 * (RateLimitEvent table) when Redis isn't set up, so this works with zero
 * configuration.
 *
 * Returns true if the request should be BLOCKED (limit exceeded).
 */
export async function isRateLimited(key: string, maxAttempts: number, windowMs: number): Promise<boolean> {
  if (redis) {
    const redisKey = `ratelimit:${key}`
    const count = await redis.incr(redisKey)
    if (count === 1) {
      await redis.expire(redisKey, Math.ceil(windowMs / 1000))
    }
    return count > maxAttempts
  }

  // Fallback: DB-backed sliding window
  const since = new Date(Date.now() - windowMs)
  const count = await prisma.rateLimitEvent.count({
    where: { key, createdAt: { gte: since } },
  })
  if (count >= maxAttempts) return true

  await prisma.rateLimitEvent.create({ data: { key } })
  return false
}

/** Best-effort client IP extraction for serverless/edge requests behind a proxy. */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
