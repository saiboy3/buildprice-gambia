'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, MessageSquare, Package, TrendingUp, Pencil, Trash2, Loader2, Store, Save, ListPlus, X } from 'lucide-react'
import clsx from 'clsx'

type Price = {
  id: string
  price: number
  unit: string
  stockStatus: string
  updatedAt: string
  material: { id: string; name: string; category: { name: string } }
}

type Material = { id: string; name: string; category: { name: string } }
type SupplierProfile = { id: string; name: string; location: string; contact: string; views: number; inquiries: number }

type RowState = { price: string; unit: string; stockStatus: string; dirty: boolean; existingId: string | null }

const STATUS_OPTIONS = ['AVAILABLE', 'LIMITED', 'OUT_OF_STOCK']
const DEFAULT_UNIT = 'bag (50kg)'

export default function SupplierDashboard() {
  const { user, token, isSupplier, ready } = useAuth()
  const router = useRouter()

  const [profile,   setProfile]   = useState<SupplierProfile | null>(null)
  const [prices,    setPrices]    = useState<Price[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)

  // Bulk price-list form state: one row per material, keyed by material id
  const [rows,        setRows]        = useState<Record<string, RowState>>({})
  const [formLoading, setFormLoading] = useState(false)
  const [formError,   setFormError]   = useState('')

  useEffect(() => {
    if (!ready) return
    if (!isSupplier) { router.push('/login'); return }
    loadData()
  }, [ready, isSupplier])

  const loadData = async () => {
    setLoading(true)
    try {
      const profRes  = await fetch('/api/supplier/profile', { headers: { Authorization: `Bearer ${token}` } })
      const profJson = await profRes.json()
      if (profJson.ok) setProfile(profJson.data)
      if (!profJson.ok || !profJson.data) { setLoading(false); return }

      const [pricesRes, matsRes] = await Promise.all([
        fetch('/api/supplier/prices', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/materials'),
      ])
      const pricesJson = await pricesRes.json()
      const matsJson   = await matsRes.json()
      if (pricesJson.ok) setPrices(pricesJson.data)
      if (matsJson.ok)   setMaterials(matsJson.data)
    } finally {
      setLoading(false)
    }
  }

  const openList = () => {
    // Seed one row per material, prefilled from any existing price
    const seeded: Record<string, RowState> = {}
    for (const m of materials) {
      const existing = prices.find(p => p.material.id === m.id)
      seeded[m.id] = existing
        ? { price: String(existing.price), unit: existing.unit, stockStatus: existing.stockStatus, dirty: false, existingId: existing.id }
        : { price: '', unit: DEFAULT_UNIT, stockStatus: 'AVAILABLE', dirty: false, existingId: null }
    }
    setRows(seeded)
    setFormError('')
    setShowForm(true)
  }

  const updateRow = (materialId: string, patch: Partial<RowState>) => {
    setRows(r => ({ ...r, [materialId]: { ...r[materialId], ...patch, dirty: true } }))
  }

  const dirtyCount = useMemo(
    () => Object.values(rows).filter(r => r.dirty && r.price.trim() !== '').length,
    [rows]
  )

  const saveAllPrices = async () => {
    setFormError('')
    const items = Object.entries(rows)
      .filter(([, r]) => r.dirty && r.price.trim() !== '')
      .map(([materialId, r]) => ({ materialId, price: parseFloat(r.price), unit: r.unit, stockStatus: r.stockStatus }))

    if (items.length === 0) { setFormError('Enter at least one price to save'); return }
    if (items.some(i => isNaN(i.price) || i.price < 0)) { setFormError('Prices must be valid, non-negative numbers'); return }

    setFormLoading(true)
    try {
      const res  = await fetch('/api/supplier/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items }),
      })
      const json = await res.json()
      if (!json.ok) { setFormError(json.error); return }
      setShowForm(false)
      loadData()
    } finally {
      setFormLoading(false)
    }
  }

  const deletePrice = async (id: string) => {
    if (!confirm('Delete this price?')) return
    await fetch(`/api/supplier/prices?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    loadData()
  }

  const updateStatus = async (price: Price, newStatus: string) => {
    await fetch('/api/supplier/prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ materialId: price.material.id, price: price.price, unit: price.unit, stockStatus: newStatus }),
    })
    loadData()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )

  // No supplier profile yet — this is the entry point into the guided setup wizard.
  if (!profile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="card">
          <Store size={32} className="mx-auto text-primary-500 mb-3" />
          <h2 className="font-bold text-gray-900 mb-1">Set up your business profile</h2>
          <p className="text-sm text-gray-500 mb-5">
            Buyers can't find your prices yet — it takes about a minute to get listed.
          </p>
          <Link href="/supplier/profile" className="btn-primary w-full justify-center py-3">
            Set Up My Profile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/supplier/profile" className="btn-secondary">
            <Pencil size={14} /> Edit Profile
          </Link>
          <button onClick={() => (showForm ? setShowForm(false) : openList())} className="btn-primary">
            <ListPlus size={16} /> Add / Update Prices
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Package,     label: 'Listed materials', value: prices.length },
          { icon: Eye,         label: 'Profile views',    value: profile.views },
          { icon: MessageSquare, label: 'Inquiries',      value: profile.inquiries },
          { icon: TrendingUp,  label: 'In stock',         value: prices.filter(p => p.stockStatus === 'AVAILABLE').length },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card text-center">
            <Icon size={20} className="mx-auto text-primary-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Bulk price-list form */}
      {showForm && (
        <div className="card mb-6 border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Add / Update Prices</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-4">Fill in a price for any material you sell, then save them all at once.</p>

          <div className="max-h-[28rem] overflow-y-auto -mx-2 px-2 space-y-6">
            {Object.entries(
              materials.reduce<Record<string, Material[]>>((acc, m) => {
                (acc[m.category.name] ??= []).push(m)
                return acc
              }, {})
            ).map(([catName, mats]) => (
              <div key={catName}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{catName}</p>
                <div className="space-y-2">
                  {mats.map(m => {
                    const row = rows[m.id]
                    if (!row) return null
                    return (
                      <div key={m.id} className="grid grid-cols-12 gap-2 items-center">
                        <p className="col-span-4 text-sm text-gray-700 truncate">{m.name}</p>
                        <input
                          type="number" min="0" placeholder="Price"
                          className="input col-span-3 py-1.5 text-sm"
                          value={row.price}
                          onChange={e => updateRow(m.id, { price: e.target.value })}
                        />
                        <input
                          type="text" placeholder="Unit"
                          className="input col-span-3 py-1.5 text-sm"
                          value={row.unit}
                          onChange={e => updateRow(m.id, { unit: e.target.value })}
                        />
                        <select
                          className="input col-span-2 py-1.5 text-xs"
                          value={row.stockStatus}
                          onChange={e => updateRow(m.id, { stockStatus: e.target.value })}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {formError && <p className="text-sm text-red-500 mt-3">{formError}</p>}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <button onClick={saveAllPrices} disabled={formLoading || dirtyCount === 0} className="btn-primary">
              {formLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Changes {dirtyCount > 0 && `(${dirtyCount})`}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Price list */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">My Listed Prices</h2>
        {prices.length === 0 ? (
          <p className="text-gray-400 text-center py-8 text-sm">No prices listed yet. Click "Add / Update Prices" to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2.5">Material</th>
                  <th className="text-right px-4 py-2.5">Price</th>
                  <th className="text-center px-4 py-2.5">Stock</th>
                  <th className="text-left px-4 py-2.5">Updated</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prices.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.material.name}</p>
                      <p className="text-xs text-gray-400">{p.material.category.name}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      D{p.price.toLocaleString()} <span className="font-normal text-gray-400 text-xs">/{p.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={p.stockStatus}
                        onChange={e => updateStatus(p, e.target.value)}
                        className={clsx('text-xs rounded-full px-2 py-0.5 border-0 font-medium cursor-pointer',
                          p.stockStatus === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                          p.stockStatus === 'LIMITED'   ? 'bg-yellow-100 text-yellow-700' :
                                                          'bg-red-100 text-red-700')}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(p.updatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => deletePrice(p.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <Link href={`/suppliers/${profile.id}`} className="text-sm text-primary-600 hover:underline">
          View public profile →
        </Link>
      </div>
    </div>
  )
}
