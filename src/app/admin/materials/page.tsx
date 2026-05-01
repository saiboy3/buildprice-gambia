'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, Pencil } from 'lucide-react'

type Material = { id: string; name: string; category: { id: string; name: string }; prices: any[] }
type Category = { id: string; name: string }

export default function AdminMaterials() {
  const { isAdmin, token } = useAuth()
  const router = useRouter()
  const [materials,  setMaterials]  = useState<Material[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(true)
  const [newName,    setNewName]    = useState('')
  const [newCatId,   setNewCatId]   = useState('')
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    if (!isAdmin) { router.push('/login'); return }
    load()
  }, [isAdmin])

  const load = async () => {
    setLoading(true)
    const [mRes, cRes] = await Promise.all([
      fetch('/api/admin/materials', { headers: h }),
      fetch('/api/materials'),
    ])
    const mJson = await mRes.json()
    const cJson = await cRes.json()
    if (mJson.ok) setMaterials(mJson.data)
    // Extract categories from materials
    if (cJson.ok) {
      const cats = Array.from(new Map(cJson.data.map((m: any) => [m.category.id, m.category])).values()) as Category[]
      setCategories(cats)
      if (cats.length && !newCatId) setNewCatId(cats[0].id)
    }
    setLoading(false)
  }

  const addMaterial = async () => {
    setError('')
    if (!newName.trim() || !newCatId) { setError('Name and category required'); return }
    setSaving(true)
    const res  = await fetch('/api/materials', { method: 'POST', headers: h, body: JSON.stringify({ name: newName, categoryId: newCatId }) })
    const json = await res.json()
    if (!json.ok) { setError(json.error) } else { setNewName(''); load() }
    setSaving(false)
  }

  const deleteMaterial = async (id: string) => {
    if (!confirm('Delete this material and all its prices?')) return
    await fetch(`/api/admin/materials?id=${id}`, { method: 'DELETE', headers: h })
    load()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Materials</h1>

      {/* Add form */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Add Material</h2>
        <div className="flex gap-3 flex-wrap">
          <input
            type="text" className="input flex-1 min-w-[200px]"
            placeholder="Material name" value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <select className="input w-48" value={newCatId} onChange={e => setNewCatId(e.target.value)}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={addMaterial} disabled={saving} className="btn-primary shrink-0">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Add</>}
          </button>
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2.5">Name</th>
              <th className="text-left px-4 py-2.5">Category</th>
              <th className="text-center px-4 py-2.5">Prices</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {materials.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                <td className="px-4 py-3 text-gray-500">{m.category.name}</td>
                <td className="px-4 py-3 text-center text-gray-500">{m.prices.length}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => deleteMaterial(m.id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
