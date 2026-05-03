'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, Send } from 'lucide-react'

const CATEGORIES = [
  { value: 'general',     label: 'General Discussion' },
  { value: 'estimating',  label: 'Estimating & Costs' },
  { value: 'suppliers',   label: 'Suppliers & Materials' },
  { value: 'regulations', label: 'Regulations & Permits' },
  { value: 'other',       label: 'Other' },
]

export default function NewThreadPage() {
  const { user, token } = useAuth()
  const router          = useRouter()

  const [title,        setTitle]        = useState('')
  const [body,         setBody]         = useState('')
  const [categorySlug, setCategorySlug] = useState('general')
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')

  if (!user) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center text-gray-500">
      <p className="mb-4">Please sign in to start a thread.</p>
      <Link href="/login" className="btn-primary">Sign in</Link>
    </div>
  )

  const submit = async () => {
    if (!title.trim()) { setError('Title is required.'); return }
    if (!body.trim())  { setError('Body is required.'); return }
    setSaving(true); setError('')
    try {
      const res  = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, body, categorySlug }),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error ?? 'Failed to post.'); return }
      router.push('/forum')
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/forum" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft size={16} /> Forum
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Thread</h1>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl mb-4">{error}</p>}

      <div className="card space-y-5">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Title *</label>
          <input className="input w-full" placeholder="e.g. What is the current price of cement in Banjul?"
            value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Category</label>
          <select className="input w-full" value={categorySlug} onChange={e => setCategorySlug(e.target.value)}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Body *</label>
          <textarea
            className="input w-full min-h-[200px] resize-y"
            placeholder="Describe your question or topic in detail. Include relevant details like location, budget, building type, etc."
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={submit} disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {saving ? 'Posting…' : 'Post Thread'}
          </button>
          <Link href="/forum" className="btn-secondary">Cancel</Link>
        </div>
      </div>
    </div>
  )
}
