'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin, Star, ShieldCheck, Search, SlidersHorizontal, UserPlus, HardHat,
} from 'lucide-react'
import clsx from 'clsx'
import { avatarColor, initials, SPECIALTY_META } from '@/lib/visual'

const SPECIALTIES = [
  'All', 'General Contractor', 'Masonry & Blockwork', 'Roofing',
  'Plumbing', 'Electrical', 'Carpentry & Joinery', 'Tiling & Finishing', 'Painting',
]

type Contractor = {
  id: string; name: string; specialty: string; location: string
  contact: string; bio: string; yearsExp: number
  verified: boolean; avgRating: number; reviewCount: number
}

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={size}
          className={rating >= n ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
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
    <div>
      {/* ── Hero banner ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gray-900 h-52 md:h-64 flex items-end">
        <Image
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1920&q=75"
          alt="Construction contractors at work"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-gray-900/10" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 pb-8 w-full flex flex-wrap items-end justify-between gap-4">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-1">
              <HardHat size={18} className="text-primary-400" />
              <span className="text-xs font-semibold text-primary-400 uppercase tracking-widest">Professionals</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">Find a Contractor</h1>
            <p className="text-gray-300 text-sm mt-1">Vetted, rated professionals across The Gambia</p>
          </div>
          <Link href="/contractors/register"
            className="btn-primary text-sm px-4 py-2 shrink-0">
            <UserPlus size={15} /> Register as Contractor
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-6">
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
                <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} className="rounded" />
                Verified contractors only
              </label>
            </div>
          </div>
        )}

        {/* Specialty pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {SPECIALTIES.map(s => {
            const meta = SPECIALTY_META[s]
            return (
              <button key={s} onClick={() => setSpecialty(s)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors flex items-center gap-1',
                  specialty === s
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                )}>
                {meta && <span>{meta.emoji}</span>}
                {s}
              </button>
            )
          })}
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
            <p className="text-sm mt-1">
              Try adjusting your filters or{' '}
              <Link href="/contractors/register" className="text-primary-600 hover:underline">register your business</Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map(c => {
              const ini   = initials(c.name)
              const bg    = avatarColor(c.name)
              const smeta = SPECIALTY_META[c.specialty] ?? { color: 'bg-gray-50', text: 'text-gray-700', emoji: '🏗️' }
              return (
                <Link key={c.id} href={`/contractors/${c.id}`}
                  className="card hover:shadow-md hover:border-primary-200 transition-all group overflow-hidden p-0">

                  {/* Coloured header */}
                  <div className={`${bg} px-4 py-3 flex items-center gap-3`}>
                    <div className="w-11 h-11 rounded-full bg-white/25 flex items-center justify-center text-white font-extrabold text-sm shadow-inner shrink-0">
                      {ini}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-white text-sm leading-tight group-hover:underline truncate">{c.name}</h2>
                      <span className="text-white/80 text-xs flex items-center gap-1">
                        <MapPin size={10} /> {c.location}
                      </span>
                    </div>
                    {c.verified && (
                      <span title="Verified" className="flex items-center gap-1 text-xs text-white bg-white/20 border border-white/30 px-2 py-0.5 rounded-full shrink-0">
                        <ShieldCheck size={11} /> Verified
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${smeta.color} ${smeta.text}`}>
                      {smeta.emoji} {c.specialty}
                    </span>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {c.bio || 'No bio provided.'}
                    </p>
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-gray-400 border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2">
                        <Stars rating={c.avgRating} />
                        <span className="font-semibold text-gray-800">
                          {c.avgRating > 0 ? c.avgRating.toFixed(1) : '—'}
                        </span>
                        <span>
                          {c.reviewCount > 0 ? `(${c.reviewCount})` : 'No reviews'}
                        </span>
                      </div>
                      {c.yearsExp > 0 && (
                        <span>{c.yearsExp} yrs exp.</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
