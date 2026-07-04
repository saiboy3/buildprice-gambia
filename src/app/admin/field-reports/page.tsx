'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, MapPinned, Trash2, Star, Users } from 'lucide-react'
import clsx from 'clsx'

type FieldReport = {
  id: string
  materialLabel: string
  material: { name: string } | null
  price: number
  unit: string
  location: string
  supplierName: string | null
  photoNote: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rewardNote: string | null
  createdAt: string
  reporter: { id: string; rating: number; active: boolean; user: { name: string; phone: string } }
}

const STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const

export default function AdminFieldReportsPage() {
  const { isAdmin, token, ready } = useAuth()
  const router = useRouter()

  const [reports, setReports] = useState<FieldReport[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState<'ALL' | typeof STATUSES[number]>('PENDING')

  useEffect(() => {
    if (!ready) return
    if (!isAdmin) { router.push('/login'); return }
    load()
  }, [ready, isAdmin, filter])

  const load = async () => {
    setLoading(true)
    const res  = await fetch(`/api/admin/field-reports?status=${filter}`, { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json()
    if (json.ok) setReports(json.data.reports)
    setLoading(false)
  }

  const setStatus = async (id: string, status: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: status as FieldReport['status'] } : r))
    await fetch('/api/admin/field-reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status }),
    })
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this report permanently?')) return
    await fetch(`/api/admin/field-reports?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setReports(prev => prev.filter(r => r.id !== id))
  }

  const statusBadge = (s: string) =>
    s === 'PENDING' ? 'bg-amber-100 text-amber-700' :
    s === 'APPROVED' ? 'bg-green-100 text-green-700' :
    'bg-red-100 text-red-700'

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPinned size={22} className="text-primary-500" /> Field Price Reports
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Crowd-sourced submissions from authenticated field reporters</p>
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

      <Link href="/admin/field-reporters" className="flex items-center gap-2 text-sm text-primary-600 hover:underline font-medium mb-4">
        <Users size={14} /> Manage reporters, ratings &amp; rewards →
      </Link>

      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">No reports in this view.</div>
        ) : (
          reports.map(r => (
            <div key={r.id} className={clsx('card', r.status === 'REJECTED' && 'opacity-60')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full', statusBadge(r.status))}>{r.status}</span>
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="font-bold text-gray-900">{r.materialLabel}{r.material && <span className="text-xs text-gray-400 font-normal ml-1">(matched: {r.material.name})</span>}</p>
                  <p className="text-lg font-extrabold text-primary-600">D{r.price.toLocaleString()} <span className="text-sm font-normal text-gray-400">/ {r.unit}</span></p>
                  <p className="text-xs text-gray-500 mt-1">{r.location}{r.supplierName ? ` · ${r.supplierName}` : ''}</p>
                  {r.photoNote && <p className="text-xs text-gray-400 mt-1 italic">"{r.photoNote}"</p>}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs text-gray-400">
                      Reporter: {r.reporter.user.name} · {r.reporter.user.phone}
                    </span>
                    <span className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={11} className={star <= r.reporter.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                      ))}
                    </span>
                    {!r.reporter.active && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-semibold">Blocked</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                    value={r.status}
                    onChange={e => setStatus(r.id, e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                  </select>
                  <button onClick={() => remove(r.id)} className="text-gray-400 hover:text-red-500">
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
