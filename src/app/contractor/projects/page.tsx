'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { Plus, Trash2, Loader2, FolderKanban, MapPin, Calendar, Image as ImageIcon } from 'lucide-react'

type Project = {
  id: string
  title: string
  description: string
  location: string
  completedAt: string | null
  photoUrls: string[]
}

const EMPTY_FORM = { title: '', description: '', location: '', completedAt: '', photoUrls: '' }

export default function ContractorProjectsPage() {
  const { user, token } = useAuth()
  const contractorId = user?.contractorId

  const [projects,  setProjects]  = useState<Project[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState({ ...EMPTY_FORM })
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  const load = async () => {
    if (!contractorId) return
    setLoading(true)
    try {
      const res  = await fetch(`/api/contractors/${contractorId}/projects`, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      if (json.ok) setProjects(json.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [contractorId])

  const addProject = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        title: form.title,
        description: form.description,
        location: form.location,
        completedAt: form.completedAt || null,
        photoUrls: form.photoUrls ? form.photoUrls.split(',').map(u => u.trim()).filter(Boolean) : [],
      }
      const res  = await fetch(`/api/contractors/${contractorId}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error ?? 'Failed to add project.'); return }
      setShowForm(false); setForm({ ...EMPTY_FORM }); load()
    } finally { setSaving(false) }
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return
    await fetch(`/api/contractors/${contractorId}/projects?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    load()
  }

  const f = (k: keyof typeof EMPTY_FORM, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-primary-500" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-sm text-gray-400 mt-0.5">Showcase completed work on your public profile.</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary">
          <Plus size={16} /> Add Project
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl mb-4">{error}</p>}

      {/* Add form */}
      {showForm && (
        <div className="card mb-6 border-primary-200">
          <h2 className="font-semibold text-gray-900 mb-4">New Project</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Project Title *</label>
              <input className="input w-full" placeholder="e.g. 3-Bedroom House in Serrekunda"
                value={form.title} onChange={e => f('title', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
              <textarea className="input w-full min-h-[80px] resize-y" placeholder="Describe the project scope, materials used, outcome…"
                value={form.description} onChange={e => f('description', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Location</label>
              <input className="input w-full" placeholder="e.g. Bakau, The Gambia"
                value={form.location} onChange={e => f('location', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Completion Date</label>
              <input type="date" className="input w-full"
                value={form.completedAt} onChange={e => f('completedAt', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Photo URLs (comma-separated)</label>
              <input className="input w-full" placeholder="https://…/photo1.jpg, https://…/photo2.jpg"
                value={form.photoUrls} onChange={e => f('photoUrls', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addProject} disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save project'}
            </button>
            <button onClick={() => { setShowForm(false); setError('') }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Projects list */}
      {projects.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <FolderKanban size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No projects yet</p>
          <p className="text-sm mt-1">Add your first project to showcase your work.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(p => (
            <div key={p.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg">{p.title}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1 mb-2">
                    {p.location && <span className="flex items-center gap-1"><MapPin size={11} /> {p.location}</span>}
                    {p.completedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> Completed {new Date(p.completedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    {p.photoUrls.length > 0 && (
                      <span className="flex items-center gap-1"><ImageIcon size={11} /> {p.photoUrls.length} photo{p.photoUrls.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                  {p.description && <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>}
                </div>
                <button onClick={() => deleteProject(p.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors shrink-0 p-1">
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Photo thumbnails */}
              {p.photoUrls.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {p.photoUrls.slice(0, 5).map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`Photo ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity shrink-0" />
                    </a>
                  ))}
                  {p.photoUrls.length > 5 && (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-400 font-medium shrink-0">
                      +{p.photoUrls.length - 5}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
