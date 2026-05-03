'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { ShieldCheck, ShieldAlert, Loader2, ExternalLink, CheckCircle, XCircle } from 'lucide-react'

type Submission = {
  id: string; status: string; docUrls: string[]; createdAt: string
  rejectionNote?: string | null
  supplier: { id: string; name: string; location: string; contact: string }
}

export default function AdminVerificationPage() {
  const { isAdmin, token } = useAuth()
  const router = useRouter()

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading,     setLoading]     = useState(true)
  const [notes,       setNotes]       = useState<Record<string, string>>({})
  const [actioning,   setActioning]   = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) { router.push('/login'); return }
    load()
  }, [isAdmin])

  const load = async () => {
    setLoading(true)
    const res  = await fetch('/api/admin/supplier-verification', { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json()
    if (json.ok) setSubmissions(json.data)
    setLoading(false)
  }

  const act = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    setActioning(id)
    await fetch(`/api/admin/supplier-verification?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: action, rejectionNote: notes[id] ?? '' }),
    })
    setActioning(null)
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck size={24} className="text-primary-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
          <p className="text-sm text-gray-400 mt-0.5">{submissions.length} pending submission{submissions.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <ShieldCheck size={40} className="mx-auto mb-3 text-gray-300" />
          <p>No pending verification submissions.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {submissions.map(s => (
            <div key={s.id} className="card">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">{s.supplier.name}</h2>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                    <span>{s.supplier.location}</span>
                    <span>{s.supplier.contact}</span>
                    <span>Submitted {new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                  {s.status}
                </span>
              </div>

              {/* Documents */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-600 mb-2">Submitted Documents</h3>
                {s.docUrls.length === 0 ? (
                  <p className="text-xs text-gray-400">No documents submitted.</p>
                ) : (
                  <div className="space-y-1.5">
                    {s.docUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-primary-600 hover:underline break-all">
                        <ExternalLink size={12} className="shrink-0" />
                        Document {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Rejection note */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Rejection Note (optional)</label>
                <input className="input w-full text-sm" placeholder="Reason for rejection if applicable"
                  value={notes[s.id] ?? ''}
                  onChange={e => setNotes(prev => ({ ...prev, [s.id]: e.target.value }))} />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => act(s.id, 'APPROVED')}
                  disabled={actioning === s.id}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {actioning === s.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Approve
                </button>
                <button
                  onClick={() => act(s.id, 'REJECTED')}
                  disabled={actioning === s.id}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {actioning === s.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
