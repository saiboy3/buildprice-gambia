/** Only allow well-formed http(s) URLs to be stored — blocks javascript:, data:, and malformed strings. */
export function isValidHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/** Filters an array down to only valid http(s) URL strings. */
export function sanitizeUrlList(value: unknown, maxItems = 20): string[] {
  if (!Array.isArray(value)) return []
  return value.filter(isValidHttpUrl).slice(0, maxItems)
}
