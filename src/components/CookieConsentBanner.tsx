'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cookie } from 'lucide-react'
import { getConsent, setConsent } from '@/lib/consent'

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(getConsent() === null)
  }, [])

  const choose = (value: 'granted' | 'denied') => {
    setConsent(value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[70] bg-gray-900 text-gray-200 px-4 py-4 shadow-2xl">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Cookie size={20} className="text-primary-400 shrink-0" />
        <p className="text-sm flex-1">
          We use essential cookies to run this site, and optional analytics cookies to understand how it's used.
          You can accept or decline analytics — see our{' '}
          <Link href="/privacy" className="text-primary-400 hover:underline">Privacy Policy</Link>.
        </p>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => choose('denied')} className="btn-secondary text-xs px-3 py-1.5 bg-transparent border-gray-600 text-gray-200 hover:bg-gray-800">
            Decline analytics
          </button>
          <button onClick={() => choose('granted')} className="btn-primary text-xs px-3 py-1.5">
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
