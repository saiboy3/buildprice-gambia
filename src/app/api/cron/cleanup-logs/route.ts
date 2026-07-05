import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { ok, err, handleError, log } from '@/lib/api'
import { ACTIVITY_LOG_RETENTION_DAYS, RATE_LIMIT_EVENT_RETENTION_DAYS, daysAgo } from '@/lib/retention'

// Purges operational data past its retention window — the admin audit trail
// (ActivityLog) and rate-limit counters (RateLimitEvent), neither of which
// has a business reason to be kept indefinitely. Triggered daily by Vercel
// Cron (see vercel.json), or manually by an admin from /admin/logs.
async function runCleanup() {
  const [deletedLogs, deletedRateLimitEvents] = await Promise.all([
    prisma.activityLog.deleteMany({ where: { createdAt: { lt: daysAgo(ACTIVITY_LOG_RETENTION_DAYS) } } }),
    prisma.rateLimitEvent.deleteMany({ where: { createdAt: { lt: daysAgo(RATE_LIMIT_EVENT_RETENTION_DAYS) } } }),
  ])
  return {
    activityLogsDeleted: deletedLogs.count,
    rateLimitEventsDeleted: deletedRateLimitEvents.count,
    activityLogRetentionDays: ACTIVITY_LOG_RETENTION_DAYS,
    rateLimitEventRetentionDays: RATE_LIMIT_EVENT_RETENTION_DAYS,
  }
}

export async function GET(req: NextRequest) {
  try {
    // Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically
    // when a secret is configured — see https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
    const authHeader = req.headers.get('authorization')
    const isCron = !!process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`
    const isAdmin = getTokenFromRequest(req)?.role === 'ADMIN'
    if (!isCron && !isAdmin) return err('Forbidden', 403)

    const result = await runCleanup()
    await log('RETENTION_CLEANUP', undefined, JSON.stringify(result))
    return ok(result)
  } catch (e) {
    return handleError(e)
  }
}
