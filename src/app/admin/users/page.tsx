'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'

type User = {
  id: string; name: string; phone: string; email: string | null; role: string; createdAt: string
  supplier: { id: string; name: string } | null
  contractorProfile: { id: string; name: string } | null
  fieldReporter: { id: string } | null
}

export default function AdminUsers() {
  const { isAdmin, token, ready } = useAuth()
  const router = useRouter()
  const [users,   setUsers]   = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [confirming, setConfirming] = useState<User | null>(null)
  const [deleting,   setDeleting]   = useState(false)

  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    if (!ready) return
    if (!isAdmin) { router.push('/login'); return }
    load()
  }, [ready, isAdmin])

  const load = async () => {
    setLoading(true)
    const res  = await fetch('/api/admin/users', { headers: h })
    const json = await res.json()
    if (json.ok) setUsers(json.data)
    setLoading(false)
  }

  const changeRole = async (id: string, role: string) => {
    await fetch('/api/admin/users', { method: 'PATCH', headers: h, body: JSON.stringify({ id, role }) })
    load()
  }

  const confirmDelete = async () => {
    if (!confirming) return
    setDeleting(true)
    try {
      await fetch(`/api/admin/users?id=${confirming.id}`, { method: 'DELETE', headers: h })
      setConfirming(null)
      load()
    } finally {
      setDeleting(false)
    }
  }

  const roleBadge = (role: string) =>
    role === 'ADMIN'    ? 'badge-red' :
    role === 'SUPPLIER' ? 'badge-blue' :
                          'badge-green'

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  )

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Users ({users.length})</h1>

      <input
        type="text" className="input mb-4 max-w-xs"
        placeholder="Search by name or phone…"
        value={search} onChange={e => setSearch(e.target.value)}
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2.5">Name</th>
              <th className="text-left px-4 py-2.5">Phone</th>
              <th className="text-left px-4 py-2.5">Role</th>
              <th className="text-left px-4 py-2.5">Joined</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.phone}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={e => changeRole(u.id, e.target.value)}
                    className={`badge ${roleBadge(u.role)} cursor-pointer border-0 bg-transparent font-medium text-xs`}
                  >
                    <option value="USER">USER</option>
                    <option value="SUPPLIER">SUPPLIER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setConfirming(u)} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-gray-400 text-center py-6 text-sm">No users found</p>}
      </div>

      {confirming && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card max-w-sm w-full">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-red-500" />
              <h3 className="font-bold text-gray-900">Delete user</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              This permanently deletes <span className="font-semibold">{confirming.name}</span> ({confirming.phone})'s login and:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4 list-disc list-inside">
              {confirming.supplier && (
                <li>Deletes their supplier listing <span className="font-medium">"{confirming.supplier.name}"</span> and all its prices/reviews</li>
              )}
              {confirming.fieldReporter && (
                <li>Deletes their field-reporter profile and reporting history</li>
              )}
              {confirming.contractorProfile && (
                <li>Unlinks (but keeps) their contractor listing <span className="font-medium">"{confirming.contractorProfile.name}"</span> — it stays live with no owner account</li>
              )}
              {!confirming.supplier && !confirming.fieldReporter && !confirming.contractorProfile && (
                <li>No linked supplier, contractor, or field-reporter profiles</li>
              )}
            </ul>
            <p className="text-xs text-gray-400 mb-4">This can't be undone.</p>

            <div className="flex gap-2">
              <button onClick={confirmDelete} disabled={deleting} className="btn-primary bg-red-600 hover:bg-red-700 border-red-600">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete user
              </button>
              <button onClick={() => setConfirming(null)} disabled={deleting} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
