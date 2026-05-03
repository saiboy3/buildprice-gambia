'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, ShieldAlert } from 'lucide-react'
import clsx from 'clsx'

type Alert = {
  id: string; title: string; body: string
  severity: 'INFO' | 'WARNING' | 'CRITICAL'; active: boolean
  materialId?: string | null; createdAt: string
  material?: { name: string } | null
}

const SEVERITIES = ['INFO', 'WARNING', 'CRITICAL'] as const
const EMPTY_FORM = { title: '', body: '', severity: 'WARNING' as const, materialId: '' }

export default function AdminFraudAlertsPage() {
  const { isAdmin, token } = useAuth()
  const router = useRouter()

  const [alerts,    setAlerts]    = useState<Alert[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState({ ...EMPTY_FORM })
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    if (!isAdmin) { router.push('/login'); return }
    load()
  }, [isAdmin])

  const load = async () => {
    setLoading(true)
    const res  = await fetch('/api/fraud-alerts', { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json()
    if (json.ok) setAlerts(json.data)
    setLoading(false)
  }

  const create = async () => {
    if (!form.title.trim() || !form.body.trim()) { setError('Title and body are required.'); return }
    setSaving(true); setError('')
    const res  = await fetch('/api/fraud-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, materialId: form.materialId || null }),
    })
    const json = await res.json()
    if (!json.ok) { setError(json.error ?? 'Failed to create.'); setSaving(false); return }
    setShowForm(false); setForm({ ...EMPTY_FORM }); load(); setSaving(false)
  }

  const toggleActive = async (alert: Alert) => {
    await fetch(`/api/fraud-alerts?id=${alert.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active: !alert.active }),
    })
    load()
  }

  const deleteAlert = async (id: string) => {
    if (!confirm('Delete this alert permanently?')) return
    await fetch(`/api/fraud-alerts?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    load()
  }

  const sev = (s: 'INFO' | 'WARNING' | 'CRITICAL') =>
    s === 'INFO' ? 'bg-blue-100 text-blue-700' :
    s === 'WARNING' ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700'

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><ShieldAlert size={22} className="text-red-500" /> Fraud Alerts</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage public fraud and scam alerts.</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary"><Plus size={16} /> New Alert</button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl mb-4">{error}</p>}

      {showForm && (
        <div className="card mb-6 border-red-200">
          <h2 className="font-semibold text-gray-900 mb-4">New Fraud Alert</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Title *</label>
              <input className="input w-full" placeholder="e.g. Counterfeit Dangote Cement in Serekunda market"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Body *</label>
              <textarea className="input w-full min-h-[100px] resize-y"
                placeholder="Detailed description of the alert, what to look for, how to report…"
                value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Severity</label>
                <select className="input" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value as any }))}>
                  {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Material ID (optional)</label>
                <input className="input" placeholder="Leave blank for general alert"
                  value={form.materialId} onChange={e => setForm(f => ({ ...f, materialId: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={create} disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={14} className="animate-spin" /> : 'Publish Alert'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">No fraud alerts created yet.</div>
        ) : (
          alerts.map(a => (
            <div key={a.id} className={clsx('card', !a.active && 'opacity-60')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-bold text-gray-900">{a.title}</h2>
                    <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full', sev(a.severity))}>{a.severity}</span>
                    <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full',
                      a.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                      {a.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{a.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(a)} title={a.active ? 'Deactivate' : 'Activate'}
                    className="text-gray-400 hover:text-primary-500">
                    {a.active ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => deleteAlert(a.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
