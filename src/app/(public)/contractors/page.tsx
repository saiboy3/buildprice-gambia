'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  HardHat, MapPin, Star, ShieldCheck, Search, SlidersHorizontal, UserPlus,
} from 'lucide-react'
import clsx from 'clsx'

const SPECIALTIES = [
  'All', 'General Contractor', 'Masonry & Blockwork', 'Roofing',
  'Plumbing', 'Electrical', 'Carpentry & Joinery', 'Tiling & Finishing', 'Painting',
]

type Contractor = {
  id: string; name: string; specialty: string; location: string
  contact: string; bio: string; yearsExp: number
  verified: boolean; avgRating: number; reviewCount: number
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={size}
          className={rating >= n ? 'text-amber-400 fill-amber-400' : rating >= n - 0.5 ? 'text-amber-400 fill-amber-200' : 'text-gray-300'} />
      ))}
    </span>
  )
}

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [specialty,   setSpecialty]   = useState('All')
  const [verifiedOnly,setVerifiedOnly]= useState(false)
  const [minRating,   setMinRating]   = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams()
    if (specialty !== 'All') params.set('specialty', specialty)
    if (verifiedOnly)        params.set('verified', 'true')
    if (minRating > 0)       params.set('min_rating', String(minRating))

    setLoading(true)
    fetch(`/api/contractors?${params}`)
      .then(r => r.json())
      .then(j => { if (j.ok) setContractors(j.data) })
      .finally(() => setLoading(false))
  }, [specialty, verifiedOnly, minRating])

  const filtered = contractors.filter(c =>
    !search.trim() ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <HardHat size={26} className="text-primary-500" /> Contractors
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Find vetted, rated construction professionals across The Gambia.
          </p>
        </div>
        <Link href="/contractors/register" className="btn-primary text-sm px-4 py-2">
          <UserPlus size={15} /> Register as Contractor
        </Link>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 w-full" placeholder="Search by name or location…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setShowFilters(f => !f)}
          className={clsx('btn-secondary text-sm px-3 gap-1.5', showFilters && 'bg-gray-100 border-gray-400')}>
          <SlidersHorizontal size={14} /> Filters
          {(specialty !== 'All' || verifiedOnly || minRating > 0) && (
            <span className="bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="card mb-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Specialty</label>
            <select className="input w-full" value={specialty} onChange={e => setSpecialty(e.target.value)}>
              {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Minimum Rating</label>
            <select className="input w-full" value={minRating} onChange={e => setMinRating(+e.target.value)}>
              <option value={0}>Any rating</option>
              <option value={3}>3+ stars</option>
              <option value={4}>4+ stars</option>
              <option value={4.5}>4.5+ stars</option>
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)}
                className="rounded" />
              Verified contractors only
            </label>
          </div>
        </div>
      )}

      {/* Specialty pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {SPECIALTIES.map(s => (
          <button key={s} onClick={() => setSpecialty(s)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors',
              specialty === s
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
            )}>
            {s}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-44 bg-gray-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <HardHat size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No contractors found</p>
          <p className="text-sm mt-1">Try adjusting your filters or{' '}
            <Link href="/contractors/register" className="text-primary-600 hover:underline">register your business</Link>
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(c => (
            <Link key={c.id} href={`/contractors/${c.id}`}
              className="card hover:border-primary-200 hover:shadow-md transition-all group p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {c.name}
                    </h2>
                    {c.verified && (
                      <span title="Verified by BuildPriceGambia"
                        className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                        <ShieldCheck size={11} /> Verified
                      </span>
                    )}
                  </div>
                  <span className="inline-block mt-1 text-xs font-medium bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                    {c.specialty}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{c.bio || 'No bio provided.'}</p>

              <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={11} /> {c.location}</span>
                <span>{c.yearsExp > 0 ? `${c.yearsExp} yrs experience` : ''}</span>
              </div>

              <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                <Stars rating={c.avgRating} />
                <span className="text-sm font-semibold text-gray-800">
                  {c.avgRating > 0 ? c.avgRating.toFixed(1) : '—'}
                </span>
                <span className="text-xs text-gray-400">
                  {c.reviewCount > 0 ? `(${c.reviewCount} review${c.reviewCount > 1 ? 's' : ''})` : 'No reviews yet'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
