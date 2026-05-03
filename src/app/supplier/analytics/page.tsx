'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { Eye, MessageSquare, Package, TrendingUp, Star, Download, Loader2, BarChart2 } from 'lucide-react'

type Analytics = {
  totalViews:       number
  totalInquiries:   number
  pricesListed:     number
  avgPrice:         number
  avgRating:        number
  reviewCount:      number
  topMaterials:     Array<{ name: string; views: number; lowestPrice: number; unit: string }>
  recentChanges:    Array<{ materialName: string; oldPrice: number; newPrice: number; changedAt: string }>
}

export default function SupplierAnalyticsPage() {
  const { isSupplier, token } = useAuth()
  const router = useRouter()

  const [data,        setData]        = useState<Analytics | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!isSupplier) { router.push('/login'); return }
    fetch('/api/supplier/analytics', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => { if (j.ok) setData(j.data) })
      .finally(() => setLoading(false))
  }, [isSupplier])

  const downloadCSV = async () => {
    setDownloading(true)
    try {
      const res  = await fetch('/api/supplier/export/prices', { headers: { Authorization: `Bearer ${token}` } })
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = 'my-prices.csv'; a.click()
      URL.revokeObjectURL(url)
    } finally { setDownloading(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )

  if (!data) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">
      <BarChart2 size={40} className="mx-auto mb-3 text-gray-300" />
      <p>Analytics not available.</p>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-400 mt-0.5">Insights into your supplier profile performance.</p>
        </div>
        <button onClick={downloadCSV} disabled={downloading} className="btn-secondary">
          {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Export prices CSV
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Eye,            label: 'Profile views',     value: data.totalViews.toLocaleString() },
          { icon: MessageSquare,  label: 'Inquiries',         value: data.totalInquiries.toLocaleString() },
          { icon: Package,        label: 'Prices listed',     value: data.pricesListed.toLocaleString() },
          { icon: TrendingUp,     label: 'Avg price (D)',     value: data.avgPrice > 0 ? `D${data.avgPrice.toLocaleString()}` : '—' },
          { icon: Star,           label: 'Avg rating',        value: data.avgRating > 0 ? data.avgRating.toFixed(1) : '—' },
          { icon: Star,           label: 'Total reviews',     value: data.reviewCount.toLocaleString() },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card text-center">
            <Icon size={20} className="mx-auto text-primary-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top materials */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Top Materials by Views</h2>
          {data.topMaterials.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-400 uppercase border-b border-gray-100">
                  <tr>
                    <th className="text-left py-2">Material</th>
                    <th className="text-right py-2">Your price</th>
                    <th className="text-right py-2">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.topMaterials.map(m => (
                    <tr key={m.name} className="hover:bg-gray-50">
                      <td className="py-2.5 font-medium text-gray-800">{m.name}</td>
                      <td className="py-2.5 text-right text-gray-600">D{m.lowestPrice.toLocaleString()} <span className="text-xs text-gray-400">/{m.unit}</span></td>
                      <td className="py-2.5 text-right font-semibold text-gray-900">{m.views.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent price changes */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Recent Price Changes</h2>
          {data.recentChanges.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No recent changes.</p>
          ) : (
            <div className="space-y-3">
              {data.recentChanges.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800">{c.materialName}</p>
                    <p className="text-xs text-gray-400">{new Date(c.changedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 line-through text-xs">D{c.oldPrice.toLocaleString()}</span>
                    <span className={`ml-2 font-bold ${c.newPrice < c.oldPrice ? 'text-green-600' : 'text-red-500'}`}>
                      D{c.newPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
