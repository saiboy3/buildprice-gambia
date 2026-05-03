'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react'

type LabourRate = {
  id:         string
  trade:      string
  ratePerDay: number
  unit:       string
  region:     string
}

const TRADES = ['Mason', 'Plasterer', 'Carpenter', 'Labourer', 'Electrician', 'Plumber', 'Painter', 'Steel Fixer', 'Tiler']
const REGIONS = ['Greater Banjul', 'West Coast', 'North Bank', 'Lower River', 'Central River', 'Upper River', 'All Regions']

const EMPTY: Omit<LabourRate, 'id'> = { trade: '', ratePerDay: 0, unit: 'man-day', region: 'All Regions' }

export default function AdminLabourRatesPage() {
  const { isAdmin, token } = useAuth()
  const router = useRouter()

  const [rates,       setRates]       = useState<LabourRate[]>([])
  const [loading,     setLoading]     = useState(true)
  const [showAdd,     setShowAdd]     = useState(false)
  const [form,        setForm]        = useState({ ...EMPTY })
  const [editId,      setEditId]      = useState<string | null>(null)
  const [editForm,    setEditForm]    = useState<Partial<LabourRate>>({})
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  useEffect(() => {
    if (!isAdmin) { router.push('/login'); return }
    load()
  }, [isAdmin])

  const load = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/labour-rates', { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      if (json.ok) setRates(json.data)
    } finally { setLoading(false) }
  }

  const addRate = async () => {
    if (!form.trade || !form.ratePerDay) { setError('Trade and rate are required.'); return }
    setSaving(true); setError('')
    try {
      const res  = await fetch('/api/admin/labour-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error ?? 'Failed to add.'); return }
      setShowAdd(false); setForm({ ...EMPTY }); load()
    } finally { setSaving(false) }
  }

  const saveEdit = async (id: string) => {
    setSaving(true); setError('')
    try {
      const res  = await fetch(`/api/admin/labour-rates?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error ?? 'Failed to update.'); return }
      setEditId(null); load()
    } finally { setSaving(false) }
  }

  const deleteRate = async (id: string) => {
    if (!confirm('Delete this labour rate?')) return
    await fetch(`/api/admin/labour-rates?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Labour Rates</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage daily labour rates used in the cost estimator.</p>
        </div>
        <button onClick={() => setShowAdd(s => !s)} className="btn-primary">
          <Plus size={16} /> Add Rate
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl mb-4">{error}</p>}

      {/* Add form */}
      {showAdd && (
        <div className="card mb-6 border-primary-200">
          <h2 className="font-semibold text-gray-900 mb-4">New Labour Rate</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Trade *</label>
              <select className="input" value={form.trade} onChange={e => setForm(f => ({ ...f, trade: e.target.value }))}>
                <option value="">Select trade…</option>
                {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Rate per Day (D) *</label>
              <input type="number" className="input" min={0} placeholder="e.g. 500"
                value={form.ratePerDay || ''}
                onChange={e => setForm(f => ({ ...f, ratePerDay: parseFloat(e.target.value) }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Unit</label>
              <input type="text" className="input" placeholder="man-day"
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Region</label>
              <select className="input" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addRate} disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
            </button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {rates.length === 0 ? (
          <p className="text-gray-400 text-center py-12 text-sm">No labour rates defined yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2.5">Trade</th>
                  <th className="text-right px-4 py-2.5">Rate / Day</th>
                  <th className="text-left px-4 py-2.5">Unit</th>
                  <th className="text-left px-4 py-2.5">Region</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rates.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    {editId === r.id ? (
                      <>
                        <td className="px-4 py-2">
                          <select className="input text-sm py-1" value={editForm.trade ?? r.trade}
                            onChange={e => setEditForm(f => ({ ...f, trade: e.target.value }))}>
                            {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input type="number" className="input text-sm py-1 text-right" value={editForm.ratePerDay ?? r.ratePerDay}
                            onChange={e => setEditForm(f => ({ ...f, ratePerDay: parseFloat(e.target.value) }))} />
                        </td>
                        <td className="px-4 py-2">
                          <input type="text" className="input text-sm py-1" value={editForm.unit ?? r.unit}
                            onChange={e => setEditForm(f => ({ ...f, unit: e.target.value }))} />
                        </td>
                        <td className="px-4 py-2">
                          <select className="input text-sm py-1" value={editForm.region ?? r.region}
                            onChange={e => setEditForm(f => ({ ...f, region: e.target.value }))}>
                            {REGIONS.map(reg => <option key={reg} value={reg}>{reg}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button onClick={() => saveEdit(r.id)} disabled={saving} className="text-green-600 hover:text-green-700 mr-2">
                            <Check size={15} />
                          </button>
                          <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600">
                            <X size={15} />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium text-gray-900">{r.trade}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">D{r.ratePerDay.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-500">{r.unit}</td>
                        <td className="px-4 py-3 text-gray-500">{r.region}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => { setEditId(r.id); setEditForm({ ...r }) }}
                            className="text-gray-400 hover:text-primary-500 mr-2 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => deleteRate(r.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
