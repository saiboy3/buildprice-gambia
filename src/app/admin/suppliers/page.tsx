'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Trash2, Loader2, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

type Supplier = {
  id: string; name: string; location: string; contact: string; verified: boolean
  views: number; inquiries: number; prices: any[]
  user: { name: string; phone: string; email: string | null }
}

export default function AdminSuppliers() {
  const { isAdmin, token } = useAuth()
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading,   setLoading]   = useState(true)

  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    if (!isAdmin) { router.push('/login'); return }
    load()
  }, [isAdmin])

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

  const deleteSupplier = async (id: string) => {
    if (!confirm('Delete this supplier?')) return
    await fetch(`/api/admin/suppliers?id=${id}`, { method: 'DELETE', headers: h })
    load()
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
              <button onClick={() => deleteSupplier(s.id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {suppliers.length === 0 && <p className="text-gray-400 text-center py-8">No suppliers yet.</p>}
      </div>
    </div>
  )
}
