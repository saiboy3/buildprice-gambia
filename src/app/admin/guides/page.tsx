'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, Loader2, BookOpen } from 'lucide-react'
import clsx from 'clsx'

type Guide = {
  id: string; slug: string; title: string; category: string
  content: string; published: boolean; materialId?: string | null
}

const CATEGORIES = ['cement', 'blocks', 'steel', 'roofing', 'finishing', 'foundation', 'general']
const EMPTY: Omit<Guide, 'id'> = { slug: '', title: '', category: 'general', content: '', published: false, materialId: '' }

export default function AdminGuidesPage() {
  const { isAdmin, token } = useAuth()
  const router = useRouter()

  const [guides,   setGuides]   = useState<Guide[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId,   setEditId]   = useState<string | null>(null)
  const [form,     setForm]     = useState<Omit<Guide, 'id'>>({ ...EMPTY })
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    if (!isAdmin) { router.push('/login'); return }
    load()
  }, [isAdmin])

  const load = async () => {
    setLoading(true)
    const res  = await fetch('/api/guides', { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json()
    if (json.ok) setGuides(json.data)
    setLoading(false)
  }

  const f = (k: keyof typeof EMPTY, v: string | boolean) => setForm(prev => ({ ...prev, [k]: v }))

  const save = async () => {
    if (!form.slug.trim() || !form.title.trim()) { setError('Slug and title are required.'); return }
    setSaving(true); setError('')
    try {
      const method = editId ? 'PUT' : 'POST'
      const url    = editId ? `/api/guides?id=${editId}` : '/api/guides'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, materialId: form.materialId || null }),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error ?? 'Failed to save.'); return }
      setShowForm(false); setEditId(null); setForm({ ...EMPTY }); load()
    } finally { setSaving(false) }
  }

  const startEdit = (g: Guide) => {
    setEditId(g.id)
    setForm({ slug: g.slug, title: g.title, category: g.category, content: g.content, published: g.published, materialId: g.materialId ?? '' })
    setShowForm(true)
  }

  const togglePublished = async (g: Guide) => {
    await fetch(`/api/guides?id=${g.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ published: !g.published }),
    })
    load()
  }

  const deleteGuide = async (id: string) => {
    if (!confirm('Delete this guide?')) return
    await fetch(`/api/guides?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><BookOpen size={22} className="text-primary-500" /> Guides CMS</h1>
          <p className="text-sm text-gray-400 mt-0.5">Create and manage building guides.</p>
        </div>
        <button onClick={() => { setShowForm(s => !s); setEditId(null); setForm({ ...EMPTY }) }} className="btn-primary">
          <Plus size={16} /> {editId ? 'New' : 'New Guide'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl mb-4">{error}</p>}

      {showForm && (
        <div className="card mb-6 border-primary-200">
          <h2 className="font-semibold text-gray-900 mb-4">{editId ? 'Edit Guide' : 'New Guide'}</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Slug *</label>
              <input className="input" placeholder="e.g. cement-buying-guide"
                value={form.slug} onChange={e => f('slug', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Title *</label>
              <input className="input" placeholder="Guide title"
                value={form.title} onChange={e => f('title', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
              <select className="input" value={form.category} onChange={e => f('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Material ID (optional)</label>
              <input className="input" placeholder="Link to a specific material"
                value={form.materialId ?? ''} onChange={e => f('materialId', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Content</label>
              <textarea className="input w-full min-h-[200px] resize-y font-mono text-sm"
                placeholder="Guide content. Separate paragraphs with blank lines."
                value={form.content} onChange={e => f('content', e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-gray-600">Published</label>
              <button onClick={() => f('published', !form.published)}>
                {form.published
                  ? <ToggleRight size={22} className="text-green-500" />
                  : <ToggleLeft size={22} className="text-gray-400" />}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setError('') }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Guides table */}
      <div className="card overflow-hidden">
        {guides.length === 0 ? (
          <p className="text-gray-400 text-center py-12 text-sm">No guides yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2.5">Title</th>
                  <th className="text-left px-4 py-2.5">Slug</th>
                  <th className="text-left px-4 py-2.5">Category</th>
                  <th className="text-center px-4 py-2.5">Published</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {guides.map(g => (
                  <tr key={g.id} className={clsx('hover:bg-gray-50', !g.published && 'opacity-60')}>
                    <td className="px-4 py-3 font-medium text-gray-900">{g.title}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{g.slug}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{g.category}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => togglePublished(g)}>
                        {g.published
                          ? <ToggleRight size={20} className="text-green-500 mx-auto" />
                          : <ToggleLeft size={20} className="text-gray-400 mx-auto" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => startEdit(g)} className="text-gray-400 hover:text-primary-500 mr-2"><Pencil size={14} /></button>
                      <button onClick={() => deleteGuide(g.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </td>
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
