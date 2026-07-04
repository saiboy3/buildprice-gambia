'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Trash2, Loader2, MapPin, Phone, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

type Supplier = {
  id: string; name: string; location: string; contact: string; verified: boolean
  views: number; inquiries: number; prices: any[]
  user: { id: string; name: string; phone: string; email: string | null }
}

export default function AdminSuppliers() {
  const { isAdmin, token, ready } = useAuth()
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading,   setLoading]   = useState(true)
  const [confirming, setConfirming] = useState<Supplier | null>(null)
  const [deleteUser, setDeleteUser] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    if (!ready) return
    if (!isAdmin) { router.push('/login'); return }
    load()
  }, [ready, isAdmin])

  const load = async () => {
    setLoading(true)
    const res  = await fetch('/api/admin/suppliers', { headers: h })
    const json = await res.json()
    if (json.ok) setSuppliers(json.data)
    setLoading(false)
  }

  const toggle = async (id: string, verified: boolean) => {
    await fetch('/api/admin/suppliers', { method: 'PATCH', headers: h, body: JSON.stringify({ id, verified: !verified }) })
    load()
  }

  const openConfirm = (s: Supplier) => {
    setConfirming(s)
    setDeleteUser(false)
  }

  const confirmDelete = async () => {
    if (!confirming) return
    setDeleting(true)
    try {
      await fetch(`/api/admin/suppliers?id=${confirming.id}&deleteUser=${deleteUser}`, { method: 'DELETE', headers: h })
      setConfirming(null)
      load()
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Suppliers ({suppliers.length})</h1>
        <div className="flex gap-3 text-sm text-gray-500">
          <span className="badge badge-green">{suppliers.filter(s => s.verified).length} verified</span>
          <span className="badge badge-yellow">{suppliers.filter(s => !s.verified).length} pending</span>
        </div>
      </div>

      <div className="grid gap-4">
        {suppliers.map(s => (
          <div key={s.id} className="card flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link href={`/suppliers/${s.id}`} className="font-semibold text-gray-900 hover:text-primary-600">{s.name}</Link>
                {s.verified
                  ? <span className="badge badge-green text-xs">Verified</span>
                  : <span className="badge badge-yellow text-xs">Pending</span>}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={11} />{s.location}</span>
                <span className="flex items-center gap-1"><Phone size={11} />{s.contact}</span>
                <span>User: {s.user.name} ({s.user.phone})</span>
                <span>{s.prices.length} prices · {s.views} views</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggle(s.id, s.verified)}
                className={`btn text-xs px-3 py-1.5 ${s.verified ? 'btn-secondary' : 'btn-primary'}`}
              >
                {s.verified ? <><XCircle size={13} /> Revoke</> : <><CheckCircle size={13} /> Approve</>}
              </button>
              <button onClick={() => openConfirm(s)} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {suppliers.length === 0 && <p className="text-gray-400 text-center py-8">No suppliers yet.</p>}
      </div>

      {confirming && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card max-w-sm w-full">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-red-500" />
              <h3 className="font-bold text-gray-900">Delete supplier</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently remove <span className="font-semibold">{confirming.name}</span>'s listing, prices, reviews, and delivery areas. This can't be undone.
            </p>

            <label className="flex items-start gap-2 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={deleteUser}
                onChange={e => setDeleteUser(e.target.checked)}
              />
              <span className="text-gray-700">
                Also delete the linked login account
                <span className="block text-xs text-gray-500 mt-0.5">
                  {confirming.user.name} ({confirming.user.phone}) — they won't be able to sign in afterwards.
                </span>
              </span>
            </label>

            <div className="flex gap-2">
              <button onClick={confirmDelete} disabled={deleting} className="btn-primary bg-red-600 hover:bg-red-700 border-red-600">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleteUser ? 'Delete supplier & account' : 'Delete supplier'}
              </button>
              <button onClick={() => setConfirming(null)} disabled={deleting} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
