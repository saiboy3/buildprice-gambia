'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { Star, Plus, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react'

type PromotedListing = {
  id: string
  placement: string
  startsAt: string
  endsAt: string
  active: boolean
  createdAt: string
  supplier: { id: string; name: string }
}

const PLACEMENTS = ['SEARCH', 'HOMEPAGE', 'CATEGORY'] as const
type Placement = typeof PLACEMENTS[number]

export default function PromotedListingsPage() {
  const { isAdmin, token } = useAuth()
  const router = useRouter()

  const [listings,    setListings]    = useState<PromotedListing[]>([])
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [showForm,    setShowForm]    = useState(false)

  // Form state
  const [supplierId,  setSupplierId]  = useState('')
  const [placement,   setPlacement]   = useState<Placement>('SEARCH')
  const [startsAt,    setStartsAt]    = useState('')
  const [endsAt,      setEndsAt]      = useState('')

  useEffect(() => {
    if (!isAdmin) { router.push('/login'); return }
    loadListings()
  }, [isAdmin])

  async function loadListings() {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/promoted-listings', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.ok) setListings(json.data)
    } finally {
      setLoading(false)
    }
  }

  async function createListing() {
    setError('')
    if (!supplierId.trim()) { setError('Supplier ID is required'); return }
    if (!startsAt || !endsAt) { setError('Start and end dates are required'); return }
    if (new Date(endsAt) <= new Date(startsAt)) { setError('End date must be after start date'); return }

    setSaving(true)
    try {
      const res  = await fetch('/api/admin/promoted-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ supplierId: supplierId.trim(), placement, startsAt, endsAt }),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error ?? 'Failed to create listing'); return }
      setSupplierId(''); setStartsAt(''); setEndsAt(''); setPlacement('SEARCH')
      setShowForm(false)
      loadListings()
    } finally {
      setSaving(false)
    }
  }

  async function deleteListing(id: string) {
    if (!confirm('Delete this promoted listing?')) return
    await fetch(`/api/admin/promoted-listings?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    loadListings()
  }

  const placementBadge = (p: string) => {
    const map: Record<string, string> = {
      SEARCH:   'bg-blue-100 text-blue-700',
      HOMEPAGE: 'bg-purple-100 text-purple-700',
      CATEGORY: 'bg-green-100 text-green-700',
    }
    return map[p] ?? 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Star size={24} className="text-primary-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Promoted Listings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage supplier promotional placements</p>
          </div>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary">
          <Plus size={15} /> New Promotion
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card mb-6 border-primary-200">
          <h2 className="font-semibold text-gray-900 mb-4">Create Promoted Listing</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Supplier ID *</label>
              <input
                type="text"
                className="input"
                placeholder="Supplier cuid…"
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Placement *</label>
              <select className="input" value={placement} onChange={e => setPlacement(e.target.value as Placement)}>
                {PLACEMENTS.map(p => (
                  <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block" />
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Start Date *</label>
              <input type="date" className="input" value={startsAt} onChange={e => setStartsAt(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">End Date *</label>
              <input type="date" className="input" value={endsAt} onChange={e => setEndsAt(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
          <div className="flex gap-2 mt-4">
            <button onClick={createListing} disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create
            </button>
            <button onClick={() => { setShowForm(false); setError('') }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Listings table */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin text-primary-400" />
          </div>
        ) : listings.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">No promoted listings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2.5">Supplier</th>
                  <th className="text-left px-4 py-2.5">Placement</th>
                  <th className="text-left px-4 py-2.5">Start</th>
                  <th className="text-left px-4 py-2.5">End</th>
                  <th className="text-center px-4 py-2.5">Active</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map(listing => {
                  const now   = new Date()
                  const start = new Date(listing.startsAt)
                  const end   = new Date(listing.endsAt)
                  const live  = listing.active && start <= now && end >= now
                  return (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{listing.supplier.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{listing.supplier.id.slice(0, 8)}…</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${placementBadge(listing.placement)}`}>
                          {listing.placement}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{new Date(listing.startsAt).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(listing.endsAt).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-3 text-center">
                        {live
                          ? <CheckCircle size={16} className="inline text-green-500" />
                          : <XCircle    size={16} className="inline text-gray-300" />
                        }
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteListing(listing.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
