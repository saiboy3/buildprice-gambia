// Retention windows for operational/security data that has no business reason
// to be kept indefinitely. See the Data retention section of /privacy.
export const ACTIVITY_LOG_RETENTION_DAYS = 180 // admin audit trail
export const RATE_LIMIT_EVENT_RETENTION_DAYS = 7 // only used for short sliding-window counts

export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}
