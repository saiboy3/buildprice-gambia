'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { Eye, Users, Search, Monitor, Smartphone, Tablet, TrendingUp, Loader2, BarChart2, MousePointer } from 'lucide-react'

type AnalyticsData = {
  totalViews: number
  uniqueVisitors: number
  topPages: { page: string; views: number }[]
  topSearches: { query: string; count: number }[]
  deviceBreakdown: { device: string; count: number }[]
  dailyViews: { date: string; views: number }[]
  adStats: { id: string; headline: string; impressions: number; clicks: number; spent: number; budget: number; active: boolean; supplier: { name: string } }[]
}

const DEVICE_ICONS: Record<string, typeof Monitor> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
}

export default function AdminAnalyticsPage() {
  const { token, isAdmin, ready } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    if (!isAdmin) { router.push('/login'); return }
    setLoading(true)
    fetch(`/api/admin/analytics?days=${days}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => { if (j.ok) setData(j.data) })
      .finally(() => setLoading(false))
  }, [ready, isAdmin, days])

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
  if (!data) return null

  const totalDevices = data.deviceBreakdown.reduce((s, d) => s + d.count, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Analytics</h1>
          <p className="text-sm text-gray-400 mt-0.5">Visitor tracking &amp; ad performance</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${days === d ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Eye,          label: 'Page Views',     value: data.totalViews.toLocaleString() },
          { icon: Users,        label: 'Unique Visitors', value: data.uniqueVisitors.toLocaleString() },
          { icon: Search,       label: 'Searches',        value: data.topSearches.reduce((s, q) => s + q.count, 0).toLocaleString() },
          { icon: MousePointer, label: 'Ad Clicks',       value: data.adStats.reduce((s, a) => s + a.clicks, 0).toLocaleString() },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card text-center">
            <Icon size={20} className="mx-auto text-primary-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Top pages */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-primary-500" /> Top Pages</h2>
          <div className="space-y-2">
            {data.topPages.map(p => (
              <div key={p.page} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-mono text-xs truncate max-w-[200px]">{p.page}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-primary-400 h-1.5 rounded-full" style={{ width: `${(p.views / (data.topPages[0]?.views || 1)) * 100}%` }} />
                  </div>
                  <span className="text-gray-500 text-xs w-8 text-right">{p.views}</span>
                </div>
              </div>
            ))}
            {data.topPages.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No page views yet.</p>}
          </div>
        </div>

        {/* Top searches */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Search size={16} className="text-primary-500" /> Top Searches</h2>
          <div className="space-y-2">
            {data.topSearches.map(s => (
              <div key={s.query} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-semibold capitalize">{s.query}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${(s.count / (data.topSearches[0]?.count || 1)) * 100}%` }} />
                  </div>
                  <span className="text-gray-500 text-xs w-8 text-right">{s.count}</span>
                </div>
              </div>
            ))}
            {data.topSearches.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No searches yet.</p>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Device breakdown */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Devices</h2>
          <div className="space-y-3">
            {data.deviceBreakdown.map(d => {
              const Icon = DEVICE_ICONS[d.device] ?? Monitor
              const pct = totalDevices ? Math.round((d.count / totalDevices) * 100) : 0
              return (
                <div key={d.device} className="flex items-center gap-3">
                  <Icon size={16} className="text-gray-400 shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize font-medium text-gray-700">{d.device ?? 'Unknown'}</span>
                      <span className="text-gray-400">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-1.5 bg-primary-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{d.count}</span>
                </div>
              )
            })}
            {data.deviceBreakdown.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No data yet.</p>}
          </div>
        </div>

        {/* Ad performance */}
        <div className="card lg:col-span-2">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BarChart2 size={16} className="text-primary-500" /> Ad Performance</h2>
          {data.adStats.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No active ads yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-400 uppercase border-b border-gray-100">
                  <tr>
                    <th className="text-left py-2">Advertiser</th>
                    <th className="text-right py-2">Impressions</th>
                    <th className="text-right py-2">Clicks</th>
                    <th className="text-right py-2">CTR</th>
                    <th className="text-right py-2">Spent</th>
                    <th className="text-center py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.adStats.map(ad => (
                    <tr key={ad.id} className="hover:bg-gray-50">
                      <td className="py-2.5 font-medium text-gray-800 max-w-[140px] truncate">{ad.headline || ad.supplier.name}</td>
                      <td className="py-2.5 text-right text-gray-600">{ad.impressions.toLocaleString()}</td>
                      <td className="py-2.5 text-right text-gray-600">{ad.clicks}</td>
                      <td className="py-2.5 text-right text-gray-500">{ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0'}%</td>
                      <td className="py-2.5 text-right font-medium text-gray-800">D{ad.spent.toLocaleString()}</td>
                      <td className="py-2.5 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ad.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {ad.active ? 'Active' : 'Paused'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Audience insights for ad targeting */}
      <div className="card bg-gradient-to-br from-primary-50 to-amber-50 border-primary-200">
        <h2 className="font-bold text-gray-900 mb-2">📊 Audience Insights for Ad Targeting</h2>
        <p className="text-sm text-gray-600 mb-4">Top searched materials represent your most engaged audience segments.</p>
        <div className="flex flex-wrap gap-2">
          {data.topSearches.slice(0, 8).map(s => (
            <span key={s.query} className="bg-white border border-primary-200 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              🎯 {s.query} ({s.count} searches)
            </span>
          ))}
          {data.topSearches.length === 0 && <p className="text-gray-400 text-sm">Search data will appear here as users search the platform.</p>}
        </div>
      </div>
    </div>
  )
}
