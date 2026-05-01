'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { Bell, Trash2, Loader2, Plus, CheckCircle } from 'lucide-react'

type Alert = {
  id: string; targetPrice: number; active: boolean; triggered: boolean; createdAt: string
  material: { id: string; name: string; category: { name: string } }
}
type Material = { id: string; name: string; category: { name: string } }

export default function AlertsPage() {
  const { user, token } = useAuth()
  const router = useRouter()

  const [alerts,    setAlerts]    = useState<Alert[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading,   setLoading]   = useState(true)
  const [selMat,    setSelMat]    = useState('')
  const [price,     setPrice]     = useState('')
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    load()
  }, [user])

  const load = async () => {
    setLoading(true)
    const [aRes, mRes] = await Promise.all([
      fetch('/api/alerts', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/materials'),
    ])
    const aJson = await aRes.json(); const mJson = await mRes.json()
    if (aJson.ok) setAlerts(aJson.data)
    if (mJson.ok) { setMaterials(mJson.data); if (mJson.data.length && !selMat) setSelMat(mJson.data[0].id) }
    setLoading(false)
  }

  const addAlert = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!selMat || !price) { setError('Select a material and enter a target price'); return }
    setSaving(true)
    const res  = await fetch('/api/alerts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ materialId: selMat, targetPrice: parseFloat(price) }),
    })
    const json = await res.json()
    if (!json.ok) setError(json.error)
    else { setPrice(''); load() }
    setSaving(false)
  }

  const deleteAlert = async (id: string) => {
    await fetch(`/api/alerts?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Bell size={24} className="text-primary-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Price Alerts</h1>
          <p className="text-gray-500 text-sm">Get notified on WhatsApp when a material drops to your target price</p>
        </div>
      </div>

      {/* Add alert */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Set a new alert</h2>
        <form onSubmit={addAlert} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Material</label>
            <select className="input" value={selMat} onChange={e => setSelMat(e.target.value)}>
              {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="w-40">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Target price (D)</label>
            <input
              type="number" className="input" placeholder="e.g. 700"
              value={price} onChange={e => setPrice(e.target.value)} min="1"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary shrink-0">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Set Alert</>}
          </button>
        </form>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {/* WhatsApp reminder */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-800">
        <p className="font-medium mb-1">💬 You can also set alerts via WhatsApp</p>
        <p className="text-green-600 text-xs">Send: <code className="bg-green-100 px-1 rounded">alert cement 700</code> to our WhatsApp number</p>
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {alerts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Bell size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium text-gray-600 mb-1">No alerts yet</p>
            <p className="text-sm">Set your first alert above to get notified</p>
          </div>
        )}

        {alerts.map(a => (
          <div key={a.id} className={`card flex items-center justify-between gap-4 ${a.triggered ? 'opacity-60' : ''}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-gray-900">{a.material.name}</span>
                {a.triggered ? (
                  <span className="badge badge-green flex items-center gap-1"><CheckCircle size={10} /> Triggered</span>
                ) : a.active ? (
                  <span className="badge badge-blue">Active</span>
                ) : (
                  <span className="badge badge-red">Inactive</span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Alert when price drops below <strong className="text-gray-800">D{a.targetPrice.toLocaleString()}</strong>
              </p>
              <p className="text-xs text-gray-400 mt-1">Set on {new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
            <button onClick={() => deleteAlert(a.id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors shrink-0">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
