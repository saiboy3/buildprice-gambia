'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

function getOrCreateSession(): string {
  let sid = sessionStorage.getItem('_bpg_sid')
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('_bpg_sid', sid)
  }
  return sid
}

function getDevice(): string {
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const lastPath = useRef<string>('')

  useEffect(() => {
    if (pathname === lastPath.current) return
    lastPath.current = pathname

    const sessionId = getOrCreateSession()
    const referrer = document.referrer || undefined
    const device = getDevice()

    // fire and forget — don't block rendering
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: pathname, referrer, sessionId, device }),
      keepalive: true,
    }).catch(() => {})
  }, [pathname])

  return null
}
