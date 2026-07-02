'use client'
import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { GAMBIA_LOCATIONS, getUserLocation, setUserLocation } from '@/lib/location'

export default function LocationPicker() {
  const [location, setLocation] = useState<string | null>(null)

  useEffect(() => {
    setLocation(getUserLocation())
  }, [])

  const handleSelect = (loc: string) => {
    setUserLocation(loc)
    setLocation(loc)
  }

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-primary-400 bg-white transition-colors"
        title="Set your location"
        aria-label="Select location"
      >
        <MapPin size={13} className={location ? 'text-primary-500' : 'text-gray-400'} />
        <span className="hidden sm:inline">{location ?? 'Set location'}</span>
        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <p className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-gray-400 font-semibold">See prices near you</p>
        {GAMBIA_LOCATIONS.map(loc => (
          <button
            key={loc}
            onClick={() => handleSelect(loc)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
              location === loc ? 'text-primary-600 font-semibold bg-primary-50' : 'text-gray-700'
            }`}
          >
            <MapPin size={13} />
            <span>{loc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
