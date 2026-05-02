'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ShieldCheck, ShieldOff, Star, MapPin, ExternalLink } from 'lucide-react'
import clsx from 'clsx'

type Contractor = {
  id: string; name: string; specialty: string; location: string
  contact: string; yearsExp: number; verified: boolean; verifiedAt: string | null
  avgRating: number; reviewCount: number; createdAt: string
  reviews: { id: string }[]
}

export default function AdminContractorsPage() {
  const { isAdmin, token } = useAuth()
  const router = useRouter()
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading,     setLoading]     = useState(true)
  const [toggling,    setToggling]    = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/admin/contractors', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => { if (j.ok) setContractors(j.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isAdmin) { router.push('/login'); return }
    load()
  }, [isAdmin])

  const toggleVerify = async (id: string, current: boolean) => {
    setToggling(id)
    await fetch(`/api/admin/contractors/${id}/verify`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ verified: !current }),
    })
    setToggling(null)
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-primary-500" />
    </div>
  )

  const verified   = contractors.filter(c => c.verified).length
  const unverified = contractors.length - verified

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contractors</h1>
          <p className="text-sm text-gray-400 mt-0.5">{verified} verified · {unverified} pending</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Contractor</th>
              <th className="text-left px-4 py-3">Specialty</th>
              <th className="text-left px-4 py-3">Location</th>
              <th className="text-left px-4 py-3">Rating</th>
              <th className="text-left px-4 py-3">Joined</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contractors.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.contact}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.specialty}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-gray-600">
                    <MapPin size={11} /> {c.location}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="font-medium">{c.avgRating > 0 ? c.avgRating.toFixed(1) : '—'}</span>
                    <span className="text-gray-400">({c.reviewCount})</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(c.createdAt).toLocaleDateString('en-GB')}
                </td>
                <td className="px-4 py-3">
                  {c.verified ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full w-fit">
                      <ShieldCheck size={11} /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full w-fit">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVerify(c.id, c.verified)}
                      disabled={toggling === c.id}
                      className={clsx(
                        'flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-colors',
                        c.verified
                          ? 'text-red-600 border-red-200 hover:bg-red-50'
                          : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                      )}>
                      {toggling === c.id
                        ? <Loader2 size={12} className="animate-spin" />
                        : c.verified ? <ShieldOff size={12} /> : <ShieldCheck size={12} />
                      }
                      {c.verified ? 'Unverify' : 'Verify'}
                    </button>
                    <Link href={`/contractors/${c.id}`} target="_blank"
                      className="text-gray-400 hover:text-primary-600 transition-colors" title="View profile">
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {contractors.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No contractors registered yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
