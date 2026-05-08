'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context'
import { MessageSquare, Plus, Eye, Clock, Search, Loader2 } from 'lucide-react'
import clsx from 'clsx'

type Thread = {
  id: string; title: string; categorySlug: string
  createdAt: string; views: number; replyCount: number
  user: { name: string }
}

const CATEGORIES = [
  { slug: '',            label: 'All' },
  { slug: 'general',    label: 'General' },
  { slug: 'estimating', label: 'Estimating' },
  { slug: 'suppliers',  label: 'Suppliers' },
  { slug: 'regulations',label: 'Regulations' },
  { slug: 'other',      label: 'Other' },
]

export default function ForumPage() {
  const { user } = useAuth()
  const [threads,   setThreads]   = useState<Thread[]>([])
  const [loading,   setLoading]   = useState(true)
  const [category,  setCategory]  = useState('')
  const [search,    setSearch]    = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    fetch(`/api/forum?${params}`)
      .then(r => r.json())
      .then(j => { if (j.ok) setThreads(j.data) })
      .finally(() => setLoading(false))
  }, [category])

  const filtered = search.trim()
    ? threads.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    : threads

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Forum</h1>
          <p className="text-sm text-gray-400 mt-0.5">Ask questions, share knowledge about building in The Gambia.</p>
        </div>
        {user ? (
          <Link href="/forum/new" className="btn-primary">
            <Plus size={16} /> New Thread
          </Link>
        ) : (
          <Link href="/login" className="btn-secondary text-sm">Sign in to post</Link>
        )}
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map(c => (
          <button key={c.slug}
            onClick={() => setCategory(c.slug)}
            className={clsx('px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
              category === c.slug
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300')}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9 w-full"
          placeholder="Search threads…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-primary-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
          <p>No threads found.</p>
          {user && <Link href="/forum/new" className="btn-primary mt-4 inline-flex">Start the first thread</Link>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <Link key={t.id} href={`/forum/${t.id}`}
              className="card block hover:border-primary-200 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 hover:text-primary-600 truncate mb-1">{t.title}</h2>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span>by {t.user.name}</span>
                    {t.categorySlug && (
                      <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded capitalize">
                        {t.categorySlug}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-gray-400 shrink-0">
                  <span className="flex items-center gap-1"><MessageSquare size={12} /> {t.replyCount}</span>
                  <span className="flex items-center gap-1"><Eye size={12} /> {t.views}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
