'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import PriceCard from '@/components/PriceCard'
import CompareTable from '@/components/CompareTable'
import { SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react'
import clsx from 'clsx'
import { useT } from '@/lib/LanguageContext'

type Price = {
  id: string
  price: number
  unit: string
  stockStatus: string
  updatedAt: string
  material: { id: string; name: string; category: { name: string } }
  supplier: { id: string; name: string; location: string; contact: string; verified: boolean }
}

const LOCATIONS = ['Banjul', 'Serrekunda', 'Bakau', 'Brikama', 'Farafenni', 'Basse']

export default function SearchClient() {
  const tr = useT()
  const params   = useSearchParams()
  const q        = params.get('q') ?? ''
  const locParam = params.get('location') ?? ''

  const [prices,     setPrices]     = useState<Price[]>([])
  const [loading,    setLoading]    = useState(false)
  const [view,       setView]       = useState<'grid' | 'table'>('grid')
  const [location,   setLocation]   = useState(locParam)
  const [minPrice,   setMinPrice]   = useState('')
  const [maxPrice,   setMaxPrice]   = useState('')
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    if (!q) { setPrices([]); return }
    setLoading(true)
    fetch('/api/prices')
      .then(r => r.json())
      .then(json => {
        if (!json.ok) return
        let data: Price[] = json.data
        data = data.filter(p => p.material.name.toLowerCase().includes(q.toLowerCase()))
        if (location) data = data.filter(p => p.supplier.location.toLowerCase().includes(location.toLowerCase()))
        if (minPrice) data = data.filter(p => p.price >= parseFloat(minPrice))
        if (maxPrice) data = data.filter(p => p.price <= parseFloat(maxPrice))
        setPrices(data)
      })
      .finally(() => setLoading(false))
  }, [q, location, minPrice, maxPrice])

  const grouped = prices.reduce<Record<string, Price[]>>((acc, p) => {
    const key = p.material.id
    acc[key] = acc[key] ?? []
    acc[key].push(p)
    return acc
  }, {})

  const clearFilters = () => { setLocation(''); setMinPrice(''); setMaxPrice('') }
  const hasFilters   = location || minPrice || maxPrice

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <SearchBar defaultValue={q} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <p className="text-sm text-gray-500">
          {q
            ? loading
              ? 'Searching…'
              : `${prices.length} ${tr('search.results')} for "${q}"`
            : 'Enter a material to search'}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilter(s => !s)}
            className={clsx('btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5', hasFilters && 'border-primary-400 text-primary-600')}
          >
            <SlidersHorizontal size={13} />
            Filters
            {hasFilters && (
              <span className="bg-primary-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">!</span>
            )}
          </button>
          <button onClick={() => setView('grid')}  className={clsx('p-1.5 rounded', view === 'grid'  ? 'bg-primary-100 text-primary-700' : 'text-gray-400')}><LayoutGrid size={16} /></button>
          <button onClick={() => setView('table')} className={clsx('p-1.5 rounded', view === 'table' ? 'bg-primary-100 text-primary-700' : 'text-gray-400')}><List size={16} /></button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="card mb-5 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Location</label>
            <select className="input" value={location} onChange={e => setLocation(e.target.value)}>
              <option value="">All locations</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="w-28">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Min price (D)</label>
            <input type="number" className="input" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          </div>
          <div className="w-28">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Max price (D)</label>
            <input type="number" className="input" placeholder="∞" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
              <X size={14} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Skeleton loading */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="card">
              <div className="skeleton h-4 w-1/3 rounded mb-2" />
              <div className="skeleton h-6 w-3/4 rounded mb-3" />
              <div className="skeleton h-8 w-1/2 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!q && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium text-gray-600 mb-1">Search for construction materials</p>
          <p className="text-sm">Try: cement, rebar, sand, timber, zinc sheet</p>
        </div>
      )}

      {q && !loading && prices.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700">{tr('search.empty.title')}</h3>
          <p className="text-gray-400 mt-1">{tr('search.empty.desc')}</p>
          <Link href="/" className="btn-primary mt-4 inline-flex">{tr('search.empty.btn')}</Link>
        </div>
      )}

      {Object.entries(grouped).map(([matId, matPrices]) => {
        const material = matPrices[0].material
        const sorted   = [...matPrices].sort((a, b) => a.price - b.price)
        return (
          <section key={matId} className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-bold text-gray-900">{material.name}</h2>
              <span className="badge badge-blue">{material.category.name}</span>
              <span className="text-sm text-gray-400">{matPrices.length} supplier{matPrices.length !== 1 ? 's' : ''}</span>
            </div>

            {view === 'table' ? (
              <CompareTable prices={matPrices as any} />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sorted.map((p, i) => (
                  <PriceCard key={p.id} price={p as any} rank={i + 1} />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
