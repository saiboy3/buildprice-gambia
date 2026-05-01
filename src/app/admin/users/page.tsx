'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

type User = { id: string; name: string; phone: string; email: string | null; role: string; createdAt: string }

export default function AdminUsers() {
  const { isAdmin, token } = useAuth()
  const router = useRouter()
  const [users,   setUsers]   = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    if (!isAdmin) { router.push('/login'); return }
    load()
  }, [isAdmin])

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

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE', headers: h })
    load()
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
                  <button onClick={() => deleteUser(u.id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-gray-400 text-center py-6 text-sm">No users found</p>}
      </div>
    </div>
  )
}
