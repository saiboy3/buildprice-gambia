'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { MapMarker } from '@/components/MapView'
import { Loader2, Map, Building2, HardHat } from 'lucide-react'
import clsx from 'clsx'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function MapPage() {
  const [suppliers,    setSuppliers]    = useState<MapMarker[]>([])
  const [contractors,  setContractors]  = useState<MapMarker[]>([])
  const [loading,      setLoading]      = useState(true)
  const [showSuppliers, setShowSuppliers] = useState(true)
  const [showContractors, setShowContractors] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/map/suppliers').then(r => r.json()),
      fetch('/api/map/contractors').then(r => r.json()),
    ]).then(([suppJson, conJson]) => {
      if (suppJson.ok) setSuppliers(suppJson.data)
      if (conJson.ok)  setContractors(conJson.data)
    }).finally(() => setLoading(false))
  }, [])

  const visibleMarkers: MapMarker[] = [
    ...(showSuppliers   ? suppliers   : []),
    ...(showContractors ? contractors : []),
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 size={28} className="animate-spin text-primary-500" />
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Map size={22} className="text-primary-500" />
            Supplier & Contractor Map
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {visibleMarkers.length} marker{visibleMarkers.length !== 1 ? 's' : ''} visible
          </p>
        </div>

        {/* Filter toggles */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowSuppliers(s => !s)}
            className={clsx('flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors', showSuppliers
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300')}
          >
            <Building2 size={14} />
            Suppliers ({suppliers.length})
          </button>
          <button
            onClick={() => setShowContractors(s => !s)}
            className={clsx('flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors', showContractors
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300')}
          >
            <HardHat size={14} />
            Contractors ({contractors.length})
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500" /> Supplier
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-amber-500" /> Contractor
        </span>
      </div>

      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        <MapView markers={visibleMarkers} height="560px" />
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Click a marker to view profile. Map data © OpenStreetMap contributors.
      </p>
    </div>
  )
}
