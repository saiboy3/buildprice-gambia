'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, MessageSquare, Package, TrendingUp, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
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

const STATUS_OPTIONS = ['AVAILABLE', 'LIMITED', 'OUT_OF_STOCK']

export default function SupplierDashboard() {
  const { user, token, isSupplier } = useAuth()
  const router = useRouter()

  const [prices,    setPrices]    = useState<Price[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [stats,     setStats]     = useState({ views: 0, inquiries: 0 })
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)

  // Form state
  const [selMat,      setSelMat]      = useState('')
  const [selPrice,    setSelPrice]    = useState('')
  const [selUnit,     setSelUnit]     = useState('bag (50kg)')
  const [selStatus,   setSelStatus]   = useState('AVAILABLE')
  const [formLoading, setFormLoading] = useState(false)
  const [formError,   setFormError]   = useState('')

  useEffect(() => {
    if (!isSupplier) { router.push('/login'); return }
    loadData()
  }, [isSupplier])

  const loadData = async () => {
    setLoading(true)
    try {
      const [pricesRes, matsRes] = await Promise.all([
        fetch('/api/supplier/prices', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/materials'),
      ])
      const pricesJson = await pricesRes.json()
      const matsJson   = await matsRes.json()
      if (pricesJson.ok) setPrices(pricesJson.data)
      if (matsJson.ok)   setMaterials(matsJson.data)

      // Fetch supplier stats
      if (user?.supplierId) {
        const suppRes = await fetch(`/api/suppliers/${user.supplierId}`)
        const suppJson = await suppRes.json()
        if (suppJson.ok) setStats({ views: suppJson.data.views, inquiries: suppJson.data.inquiries })
      }
    } finally {
      setLoading(false)
    }
  }

  const submitPrice = async () => {
    setFormError('')
    if (!selMat || !selPrice) { setFormError('Material and price are required'); return }
    setFormLoading(true)
    try {
      const res  = await fetch('/api/supplier/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ materialId: selMat, price: parseFloat(selPrice), unit: selUnit, stockStatus: selStatus }),
      })
      const json = await res.json()
      if (!json.ok) { setFormError(json.error); return }
      setShowForm(false); setSelMat(''); setSelPrice(''); setSelUnit('bag (50kg)'); setSelStatus('AVAILABLE')
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user?.name}</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary">
          <Plus size={16} /> Add / Update Price
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Package,     label: 'Listed materials', value: prices.length },
          { icon: Eye,         label: 'Profile views',    value: stats.views },
          { icon: MessageSquare, label: 'Inquiries',      value: stats.inquiries },
          { icon: TrendingUp,  label: 'In stock',         value: prices.filter(p => p.stockStatus === 'AVAILABLE').length },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card text-center">
            <Icon size={20} className="mx-auto text-primary-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Add price form */}
      {showForm && (
        <div className="card mb-6 border-primary-200">
          <h2 className="font-semibold text-gray-900 mb-4">Add / Update Price</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Material *</label>
              <select className="input" value={selMat} onChange={e => setSelMat(e.target.value)}>
                <option value="">Select material…</option>
                {materials.map((m: Material) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.category.name})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Price (Dalasi) *</label>
              <input type="number" className="input" placeholder="e.g. 750" value={selPrice} onChange={e => setSelPrice(e.target.value)} min="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Unit</label>
              <input type="text" className="input" placeholder="bag (50kg), ton, m³…" value={selUnit} onChange={e => setSelUnit(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Stock status</label>
              <select className="input" value={selStatus} onChange={e => setSelStatus(e.target.value)}>
                <option value="AVAILABLE">Available</option>
                <option value="LIMITED">Limited</option>
                <option value="OUT_OF_STOCK">Out of stock</option>
              </select>
            </div>
          </div>
          {formError && <p className="text-sm text-red-500 mt-3">{formError}</p>}
          <div className="flex gap-2 mt-4">
            <button onClick={submitPrice} disabled={formLoading} className="btn-primary">
              {formLoading ? <Loader2 size={14} className="animate-spin" /> : 'Save price'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Price list */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">My Listed Prices</h2>
        {prices.length === 0 ? (
          <p className="text-gray-400 text-center py-8 text-sm">No prices listed yet. Click "Add / Update Price" to get started.</p>
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
        <Link href={`/suppliers/${user?.supplierId}`} className="text-sm text-primary-600 hover:underline">
          View public profile →
        </Link>
      </div>
    </div>
  )
}
