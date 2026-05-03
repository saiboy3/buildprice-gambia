'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import {
  Package, Store, Users, ScrollText, Loader2, Hammer,
  MessageSquare, FileText, BookOpen, ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'

type Log = { id: string; action: string; details: string | null; userId: string | null; createdAt: string }

type Stats = {
  materials: number
  suppliers: number
  users: number
  prices: number
  contractors: number
  forumThreads: number
  rfqs: number
  publishedGuides: number
  pendingVerifications: number
}

export default function AdminOverview() {
  const { isAdmin, token } = useAuth()
  const router = useRouter()
  const [stats,   setStats]   = useState<Stats>({
    materials: 0, suppliers: 0, users: 0, prices: 0, contractors: 0,
    forumThreads: 0, rfqs: 0, publishedGuides: 0, pendingVerifications: 0,
  })
  const [logs,    setLogs]    = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) { router.push('/login'); return }
    const h = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch('/api/materials').then(r => r.json()),
      fetch('/api/admin/suppliers',    { headers: h }).then(r => r.json()),
      fetch('/api/admin/users',        { headers: h }).then(r => r.json()),
      fetch('/api/admin/logs?limit=10',{ headers: h }).then(r => r.json()),
      fetch('/api/admin/contractors',  { headers: h }).then(r => r.json()),
      fetch('/api/admin/stats',        { headers: h }).then(r => r.json()).catch(() => ({ ok: false })),
    ]).then(([mats, supps, users, logsData, contractors, extraStats]) => {
      setStats({
        materials:            mats.ok        ? mats.data.length         : 0,
        suppliers:            supps.ok       ? supps.data.length        : 0,
        users:                users.ok       ? users.data.length        : 0,
        prices:               mats.ok        ? mats.data.reduce((s: number, m: { prices: unknown[] }) => s + m.prices.length, 0) : 0,
        contractors:          contractors.ok ? contractors.data.length  : 0,
        forumThreads:         extraStats.ok  ? (extraStats.data?.forumThreads ?? 0) : 0,
        rfqs:                 extraStats.ok  ? (extraStats.data?.rfqs ?? 0)          : 0,
        publishedGuides:      extraStats.ok  ? (extraStats.data?.publishedGuides ?? 0) : 0,
        pendingVerifications: extraStats.ok  ? (extraStats.data?.pendingVerifications ?? 0) : 0,
      })
      if (logsData.ok) setLogs(logsData.data.slice(0, 10))
    }).finally(() => setLoading(false))
  }, [isAdmin])

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h1>

      {/* Primary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          { icon: Package,  label: 'Materials',   value: stats.materials,   href: '/admin/materials' },
          { icon: Store,    label: 'Suppliers',   value: stats.suppliers,   href: '/admin/suppliers' },
          { icon: Hammer,   label: 'Contractors', value: stats.contractors, href: '/admin/contractors' },
          { icon: Users,    label: 'Users',       value: stats.users,       href: '/admin/users' },
        ].map(({ icon: Icon, label, value, href }) => (
          <Link key={label} href={href} className="card hover:border-primary-200 hover:shadow transition-all text-center group">
            <Icon size={22} className="mx-auto text-primary-500 mb-2" />
            <p className="text-3xl font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: MessageSquare, label: 'Forum Threads',         value: stats.forumThreads,         href: '/admin/logs' },
          { icon: FileText,      label: 'RFQs',                  value: stats.rfqs,                  href: '/admin/suppliers' },
          { icon: BookOpen,      label: 'Published Guides',      value: stats.publishedGuides,       href: '/admin/guides' },
          { icon: ShieldCheck,   label: 'Pending Verifications', value: stats.pendingVerifications,  href: '/admin/verification',
            highlight: stats.pendingVerifications > 0 },
        ].map(({ icon: Icon, label, value, href, highlight }) => (
          <Link key={label} href={href} className={`card hover:border-primary-200 hover:shadow transition-all text-center group ${highlight ? 'border-amber-300 bg-amber-50' : ''}`}>
            <Icon size={22} className={`mx-auto mb-2 ${highlight ? 'text-amber-500' : 'text-primary-500'}`} />
            <p className={`text-3xl font-extrabold group-hover:text-primary-600 transition-colors ${highlight ? 'text-amber-600' : 'text-gray-900'}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <ScrollText size={16} /> Recent Activity
          </h2>
          <Link href="/admin/logs" className="text-xs text-primary-600 hover:underline">View all →</Link>
        </div>
        <div className="space-y-2">
          {logs.map(log => (
            <div key={log.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
              <div>
                <span className="font-medium text-gray-800">{log.action}</span>
                {log.details && <span className="text-gray-400 ml-2">— {log.details}</span>}
              </div>
              <span className="text-xs text-gray-400 shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
          {logs.length === 0 && <p className="text-gray-400 text-sm">No activity yet</p>}
        </div>
      </div>
    </div>
  )
}
