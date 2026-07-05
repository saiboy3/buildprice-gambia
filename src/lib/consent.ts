const KEY = 'bpg_consent' // 'granted' | 'denied'

export function getConsent(): 'granted' | 'denied' | null {
  if (typeof window === 'undefined') return null
  const v = localStorage.getItem(KEY)
  return v === 'granted' || v === 'denied' ? v : null
}

export function setConsent(value: 'granted' | 'denied') {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, value)
  window.dispatchEvent(new Event('bpg-consent-change'))
}

export function hasAnalyticsConsent(): boolean {
  return getConsent() === 'granted'
}
