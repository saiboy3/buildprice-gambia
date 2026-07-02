'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getUserLocation } from '@/lib/location'

type SponsoredAd = {
  id: string
  headline: string | null
  description: string | null
  supplier: { id: string; name: string; location: string; verified?: boolean }
}

function getSessionId(): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    let sid = sessionStorage.getItem('_bpg_sid')
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem('_bpg_sid', sid)
    }
    return sid
  } catch { return undefined }
}

export default function SponsoredBanner({
  placement,
  page,
  className = 'mb-4 space-y-2',
}: {
  placement: 'SEARCH' | 'HOMEPAGE' | 'CATEGORY'
  page?: string
  className?: string
}) {
  const [ads, setAds] = useState<SponsoredAd[]>([])
  const tracked = useRef<Set<string>>(new Set())

  useEffect(() => {
    const fetchAds = () => {
      const loc = getUserLocation()
      const url = `/api/promoted-listings?placement=${placement}${loc ? `&location=${encodeURIComponent(loc)}` : ''}`
      fetch(url)
        .then(r => r.json())
        .then(j => { if (j.ok) setAds(j.data) })
        .catch(() => {})
    }
    fetchAds()
    window.addEventListener('bpg:location-changed', fetchAds)
    return () => window.removeEventListener('bpg:location-changed', fetchAds)
  }, [placement])

  // Fire one impression per ad per mount
  useEffect(() => {
    const sessionId = getSessionId()
    ads.forEach(ad => {
      if (tracked.current.has(ad.id)) return
      tracked.current.add(ad.id)
      fetch('/api/analytics/ad-impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promotedListingId: ad.id, sessionId, page }),
      }).catch(() => {})
    })
  }, [ads, page])

  if (ads.length === 0) return null

  const handleClick = (adId: string) => {
    const sessionId = getSessionId()
    fetch('/api/analytics/ad-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promotedListingId: adId, sessionId }),
    }).catch(() => {})
  }

  return (
    <div className={className}>
      {ads.map(ad => (
        <div
          key={ad.id}
          className="border-2 border-primary-200 bg-primary-50 rounded-xl p-4 flex items-start justify-between gap-3"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded font-bold">Sponsored</span>
              <Link href={`/suppliers/${ad.supplier.id}`} className="font-bold text-gray-900 hover:text-primary-600">
                {ad.supplier.name}
              </Link>
              {ad.supplier.verified && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">Verified</span>
              )}
            </div>
            {ad.headline && <p className="text-sm font-semibold text-gray-700">{ad.headline}</p>}
            {ad.description && <p className="text-xs text-gray-500 mt-0.5">{ad.description}</p>}
            <p className="text-xs text-gray-400 mt-1">{ad.supplier.location}</p>
          </div>
          <Link
            href={`/suppliers/${ad.supplier.id}`}
            onClick={() => handleClick(ad.id)}
            className="btn-primary text-xs shrink-0"
          >
            View →
          </Link>
        </div>
      ))}
    </div>
  )
}
