import { prisma } from './db'

/**
 * Simple DB-backed sliding-window rate limiter. Serverless-safe (no in-memory
 * state shared across function instances). Not designed for high-volume APIs —
 * intended for low-frequency, high-sensitivity endpoints like login/register.
 *
 * Returns true if the request should be BLOCKED (limit exceeded).
 */
export async function isRateLimited(key: string, maxAttempts: number, windowMs: number): Promise<boolean> {
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
