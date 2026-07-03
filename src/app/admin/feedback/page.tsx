'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { Loader2, MessageSquareText, Trash2 } from 'lucide-react'
import clsx from 'clsx'

type Feedback = {
  id: string
  message: string
  page: string | null
  contact: string | null
  role: string | null
  status: 'NEW' | 'REVIEWED' | 'RESOLVED'
  createdAt: string
}

const STATUSES = ['NEW', 'REVIEWED', 'RESOLVED'] as const

export default function AdminFeedbackPage() {
  const { isAdmin, token, ready } = useAuth()
  const router = useRouter()

  const [items,   setItems]   = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState<'ALL' | typeof STATUSES[number]>('ALL')

  useEffect(() => {
    if (!ready) return
    if (!isAdmin) { router.push('/login'); return }
    load()
  }, [ready, isAdmin])

  const load = async () => {
    setLoading(true)
    const res  = await fetch('/api/admin/feedback', { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json()
    if (json.ok) setItems(json.data)
    setLoading(false)
  }

  const setStatus = async (id: string, status: string) => {
    setItems(prev => prev.map(f => f.id === id ? { ...f, status: status as Feedback['status'] } : f))
    await fetch('/api/admin/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status }),
    })
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this feedback permanently?')) return
    await fetch(`/api/admin/feedback?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setItems(prev => prev.filter(f => f.id !== id))
  }

  const statusBadge = (s: string) =>
    s === 'NEW' ? 'bg-amber-100 text-amber-700' :
    s === 'REVIEWED' ? 'bg-blue-100 text-blue-700' :
    'bg-green-100 text-green-700'

  const visible = filter === 'ALL' ? items : items.filter(f => f.status === filter)
  const newCount = items.filter(f => f.status === 'NEW').length

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquareText size={22} className="text-primary-500" /> Tester Feedback
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {newCount > 0 ? `${newCount} new submission${newCount !== 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        <div className="flex gap-2">
          {(['ALL', ...STATUSES] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                filter === s ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">No feedback yet.</div>
        ) : (
          visible.map(f => (
            <div key={f.id} className={clsx('card', f.status === 'RESOLVED' && 'opacity-60')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full', statusBadge(f.status))}>{f.status}</span>
                    {f.role && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{f.role}</span>}
                    {f.page && <span className="text-xs text-gray-400 font-mono">{f.page}</span>}
                    <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{f.message}</p>
                  {f.contact && <p className="text-xs text-primary-600 mt-1.5 font-medium">Contact: {f.contact}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                    value={f.status}
                    onChange={e => setStatus(f.id, e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                  </select>
                  <button onClick={() => remove(f.id)} className="text-gray-400 hover:text-red-500">
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
