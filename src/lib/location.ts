export const GAMBIA_LOCATIONS = ['Banjul', 'Serrekunda', 'Bakau', 'Brikama', 'Farafenni', 'Basse'] as const
export type GambiaLocation = typeof GAMBIA_LOCATIONS[number]

const KEY = '_bpg_loc'

export function getUserLocation(): string | null {
  if (typeof window === 'undefined') return null
  try { return localStorage.getItem(KEY) } catch { return null }
}

export function setUserLocation(loc: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, loc)
    window.dispatchEvent(new CustomEvent('bpg:location-changed', { detail: loc }))
  } catch {}
}

export function clearUserLocation() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(KEY)
    window.dispatchEvent(new CustomEvent('bpg:location-changed', { detail: null }))
  } catch {}
}
