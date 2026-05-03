'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { MapPin, Plus, Trash2, Loader2, Info } from 'lucide-react'

type DeliveryArea = {
  id: string
  regionName: string
  radiusKm: number | null
  createdAt: string
}

export default function DeliveryAreasPage() {
  const { isSupplier, token } = useAuth()
  const router = useRouter()

  const [areas,       setAreas]       = useState<DeliveryArea[]>([])
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [regionName,  setRegionName]  = useState('')
  const [radiusKm,    setRadiusKm]    = useState('')

  useEffect(() => {
    if (!isSupplier) { router.push('/login'); return }
    loadAreas()
  }, [isSupplier])

  async function loadAreas() {
    setLoading(true)
    try {
      const res  = await fetch('/api/supplier/delivery-areas', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.ok) setAreas(json.data)
    } finally {
      setLoading(false)
    }
  }

  async function addArea() {
    setError('')
    if (!regionName.trim()) { setError('Region name is required'); return }
    setSaving(true)
    try {
      const res  = await fetch('/api/supplier/delivery-areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          regionName: regionName.trim(),
          radiusKm:   radiusKm ? parseFloat(radiusKm) : null,
        }),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error ?? 'Failed to add area'); return }
      setRegionName('')
      setRadiusKm('')
      loadAreas()
    } finally {
      setSaving(false)
    }
  }

  async function deleteArea(id: string) {
    if (!confirm('Remove this delivery area?')) return
    await fetch(`/api/supplier/delivery-areas?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    loadAreas()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <MapPin size={24} className="text-primary-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Areas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the regions you can deliver to</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-sm text-blue-800">
        <Info size={16} className="mt-0.5 shrink-0 text-blue-500" />
        <p>This helps customers know if you can deliver to their location. Add regions by name (e.g. "Banjul", "Kanifing") and an optional delivery radius.</p>
      </div>

      {/* Add form */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Plus size={16} /> Add Delivery Area</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Region / Area Name *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Banjul, Kanifing, Brikama"
              value={regionName}
              onChange={e => setRegionName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addArea()}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Radius (km) — optional</label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 10"
              value={radiusKm}
              onChange={e => setRadiusKm(e.target.value)}
              min="0"
              step="0.5"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        <div className="mt-4">
          <button onClick={addArea} disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add Area
          </button>
        </div>
      </div>

      {/* Area list */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Current Delivery Areas</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-primary-400" />
          </div>
        ) : areas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            No delivery areas added yet. Add your first area above.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {areas.map(area => (
              <div key={area.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2.5">
                  <MapPin size={16} className="text-primary-400 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{area.regionName}</p>
                    {area.radiusKm !== null && (
                      <p className="text-xs text-gray-400">within {area.radiusKm} km</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteArea(area.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="Remove area"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
