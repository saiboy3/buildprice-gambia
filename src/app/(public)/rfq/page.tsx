'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText, Loader2, Clock } from 'lucide-react'
import clsx from 'clsx'

type RFQ = {
  id: string
  title: string
  location: string
  deadline: string | null
  status: 'OPEN' | 'CLOSED' | 'AWARDED'
  createdAt: string
  _count?: { quotes: number }
}

const STATUS_STYLE: Record<string, string> = {
  OPEN:    'badge-blue',
  CLOSED:  'badge-red',
  AWARDED: 'badge-green',
}

export default function RFQListPage() {
  const { user, token } = useAuth()
  const router = useRouter()

  const [rfqs,    setRfqs]    = useState<RFQ[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    fetch('/api/rfq', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => { if (j.ok) setRfqs(j.data) })
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-primary-500" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests for Quotation</h1>
          <p className="text-sm text-gray-400 mt-0.5">Request competitive quotes from multiple suppliers.</p>
        </div>
        <Link href="/rfq/new" className="btn-primary">
          <Plus size={16} /> Post New RFQ
        </Link>
      </div>

      {rfqs.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No RFQs yet</p>
          <p className="text-sm mt-1">Post a request to get quotes from suppliers.</p>
          <Link href="/rfq/new" className="btn-primary mt-4 inline-flex">Post your first RFQ</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rfqs.map(rfq => (
            <Link key={rfq.id} href={`/rfq/${rfq.id}`}
              className="card block hover:border-primary-200 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-bold text-gray-900">{rfq.title}</h2>
                    <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full',
                      rfq.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                      rfq.status === 'AWARDED' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-500')}>
                      {rfq.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    {rfq.location && <span>{rfq.location}</span>}
                    {rfq.deadline && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> Deadline: {new Date(rfq.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    <span>Posted {new Date(rfq.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-gray-700">{rfq._count?.quotes ?? 0} quotes</p>
                  <p className="text-xs text-gray-400">received</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
