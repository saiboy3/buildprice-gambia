'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { Loader2, Users, Star, ShieldOff, GitMerge } from 'lucide-react'
import clsx from 'clsx'

type Reporter = {
  id: string
  name: string
  rating: number
  notes: string | null
  active: boolean
  createdAt: string
  phones: string[]
  totalReports: number
  approved: number
  rejected: number
  pending: number
  approvalRate: number | null
}

export default function AdminFieldReportersPage() {
  const { isAdmin, token, ready } = useAuth()
  const router = useRouter()

  const [reporters, setReporters] = useState<Reporter[]>([])
  const [loading,   setLoading]   = useState(true)
  const [mergeFrom, setMergeFrom] = useState<string>('')
  const [mergeInto, setMergeInto] = useState<string>('')

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

  const doMerge = async () => {
    if (!mergeFrom || !mergeInto || mergeFrom === mergeInto) return
    if (!confirm('Merge these two reporter profiles into one? This cannot be undone.')) return
    await fetch('/api/admin/field-reporters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ intoId: mergeInto, fromId: mergeFrom }),
    })
    setMergeFrom(''); setMergeInto('')
    load()
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
          Durable identities — a phone number alone isn't reliable since people commonly carry 2 SIMs and change numbers yearly.
        </p>
      </div>

      {/* Merge tool */}
      <div className="card mb-6 border-amber-200 bg-amber-50/40">
        <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><GitMerge size={16} className="text-amber-600" /> Merge duplicate reporters</h2>
        <p className="text-xs text-gray-500 mb-3">If the same person shows up twice (e.g. reported once from each of their two phones), merge the duplicate into their main profile. All reports and ratings move to the one you keep.</p>
        <div className="flex flex-wrap items-center gap-2">
          <select className="input w-auto" value={mergeFrom} onChange={e => setMergeFrom(e.target.value)}>
            <option value="">Merge this reporter…</option>
            {reporters.map(r => <option key={r.id} value={r.id}>{r.name} ({r.phones.join(', ')})</option>)}
          </select>
          <span className="text-sm text-gray-500">into</span>
          <select className="input w-auto" value={mergeInto} onChange={e => setMergeInto(e.target.value)}>
            <option value="">…this one (kept)</option>
            {reporters.map(r => <option key={r.id} value={r.id}>{r.name} ({r.phones.join(', ')})</option>)}
          </select>
          <button onClick={doMerge} disabled={!mergeFrom || !mergeInto} className="btn-primary text-sm">Merge</button>
        </div>
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
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{r.phones.join(' · ')}</p>

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
                  <button
                    onClick={() => toggleActive(r.id, !r.active)}
                    className={clsx('flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors',
                      r.active ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50')}
                  >
                    <ShieldOff size={13} /> {r.active ? 'Block' : 'Unblock'}
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
