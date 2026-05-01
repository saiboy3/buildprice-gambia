'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { Loader2, RefreshCw } from 'lucide-react'

type Log = { id: string; action: string; details: string | null; userId: string | null; createdAt: string }

const ACTION_COLORS: Record<string, string> = {
  LOGIN:            'bg-green-100 text-green-700',
  REGISTER:         'bg-blue-100 text-blue-700',
  UPDATE_PRICE:     'bg-yellow-100 text-yellow-700',
  DELETE_PRICE:     'bg-red-100 text-red-700',
  CREATE_MATERIAL:  'bg-purple-100 text-purple-700',
  DELETE_MATERIAL:  'bg-red-100 text-red-700',
  UPDATE_SUPPLIER:  'bg-orange-100 text-orange-700',
  DELETE_SUPPLIER:  'bg-red-100 text-red-700',
  CREATE_SUPPLIER:  'bg-teal-100 text-teal-700',
  DELETE_USER:      'bg-red-100 text-red-700',
  UPDATE_USER_ROLE: 'bg-indigo-100 text-indigo-700',
  SEED:             'bg-gray-100 text-gray-700',
}

export default function AdminLogs() {
  const { isAdmin, token } = useAuth()
  const router = useRouter()
  const [logs,    setLogs]    = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('')

  useEffect(() => {
    if (!isAdmin) { router.push('/login'); return }
    load()
  }, [isAdmin])

  const load = async () => {
    setLoading(true)
    const res  = await fetch('/api/admin/logs?limit=200', { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json()
    if (json.ok) setLogs(json.data)
    setLoading(false)
  }

  const filtered = filter ? logs.filter(l => l.action.includes(filter.toUpperCase()) || (l.details?.toLowerCase().includes(filter.toLowerCase()))) : logs

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">Activity Logs ({logs.length})</h1>
        <div className="flex gap-2 items-center">
          <input type="text" className="input w-48" placeholder="Filter…" value={filter} onChange={e => setFilter(e.target.value)} />
          <button onClick={load} className="btn-secondary p-2"><RefreshCw size={15} /></button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2.5">Action</th>
              <th className="text-left px-4 py-2.5">Details</th>
              <th className="text-left px-4 py-2.5">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <span className={`badge text-xs ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-gray-500 max-w-xs truncate">{log.details ?? '—'}</td>
                <td className="px-4 py-2.5 text-xs text-gray-400 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">No logs match your filter</p>}
      </div>
    </div>
  )
}
