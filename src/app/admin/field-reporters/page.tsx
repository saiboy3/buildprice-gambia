'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { Loader2, Users, Star, ShieldOff, Trash2, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

type Reporter = {
  id: string
  userId: string
  name: string
  phone: string
  rating: number
  notes: string | null
  active: boolean
  createdAt: string
  totalReports: number
  approved: number
  rejected: number
  pending: number
  approvalRate: number | null
}

export default function AdminFieldReportersPage() {
  const { isAdmin, token, ready } = useAuth()
  const router = useRouter()

  const [reporters,  setReporters]  = useState<Reporter[]>([])
  const [loading,    setLoading]    = useState(true)
  const [confirming, setConfirming] = useState<Reporter | null>(null)
  const [deleteUser, setDeleteUser] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  useEffect(() => {
    if (!ready) return
    if (!isAdmin) { router.push('/login'); return }
    load()
  }, [ready, isAdmin])

  const load = async () => {
    setLoading(true)
    const res  = await fetch('/api/admin/field-reporters', { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json()
    if (json.ok) setReporters(json.data)
    setLoading(false)
  }

  const updateRating = async (id: string, rating: number) => {
    setReporters(prev => prev.map(r => r.id === id ? { ...r, rating } : r))
    await fetch('/api/admin/field-reporters', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, rating }),
    })
  }

  const toggleActive = async (id: string, active: boolean) => {
    setReporters(prev => prev.map(r => r.id === id ? { ...r, active } : r))
    await fetch('/api/admin/field-reporters', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, active }),
    })
  }

  const saveNotes = async (id: string, notes: string) => {
    await fetch('/api/admin/field-reporters', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, notes }),
    })
  }

  const openConfirm = (r: Reporter) => {
    setConfirming(r)
    setDeleteUser(false)
  }

  const confirmDelete = async () => {
    if (!confirming) return
    setDeleting(true)
    try {
      await fetch(`/api/admin/field-reporters?id=${confirming.id}&deleteUser=${deleteUser}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setReporters(prev => prev.filter(r => r.id !== confirming.id))
      setConfirming(null)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users size={22} className="text-primary-500" /> Field Reporters
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Each reporter is tied to a real account (web login or WhatsApp-verified phone) — no name-matching or merging, since common name combinations here would make that unsafe.
        </p>
      </div>

      <div className="space-y-3">
        {reporters.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">No field reporters yet.</div>
        ) : (
          reporters.map(r => (
            <div key={r.id} className={clsx('card', !r.active && 'opacity-60')}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">{r.name}</p>
                    {!r.active && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-semibold">Blocked</span>}
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{r.phone}</p>

                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-gray-600"><strong>{r.totalReports}</strong> reports</span>
                    <span className="text-green-600">{r.approved} approved</span>
                    <span className="text-red-500">{r.rejected} rejected</span>
                    <span className="text-amber-600">{r.pending} pending</span>
                    {r.approvalRate !== null && (
                      <span className="text-gray-400">({r.approvalRate}% approval rate)</span>
                    )}
                  </div>

                  <textarea
                    className="input mt-3 text-xs min-h-[50px] resize-none"
                    placeholder="Admin notes (e.g. reward history, concerns)…"
                    defaultValue={r.notes ?? ''}
                    onBlur={e => saveNotes(r.id, e.target.value)}
                  />
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {/* Star rating */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => updateRating(r.id, star)}>
                        <Star size={18} className={star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleActive(r.id, !r.active)}
                      className={clsx('flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors',
                        r.active ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50')}
                    >
                      <ShieldOff size={13} /> {r.active ? 'Block' : 'Unblock'}
                    </button>
                    <button onClick={() => openConfirm(r)} className="text-gray-400 hover:text-red-500 p-1.5">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {confirming && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card max-w-sm w-full">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-red-500" />
              <h3 className="font-bold text-gray-900">Remove field reporter</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This removes <span className="font-semibold">{confirming.name}</span>'s reporter profile and rating/report history. Their account stays intact unless you also delete it below.
            </p>

            <label className="flex items-start gap-2 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={deleteUser}
                onChange={e => setDeleteUser(e.target.checked)}
              />
              <span className="text-gray-700">
                Also delete the linked login account
                <span className="block text-xs text-gray-500 mt-0.5">
                  {confirming.name} ({confirming.phone}) — they won't be able to sign in afterwards.
                </span>
              </span>
            </label>

            <div className="flex gap-2">
              <button onClick={confirmDelete} disabled={deleting} className="btn-primary bg-red-600 hover:bg-red-700 border-red-600">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleteUser ? 'Remove reporter & delete account' : 'Remove reporter'}
              </button>
              <button onClick={() => setConfirming(null)} disabled={deleting} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
