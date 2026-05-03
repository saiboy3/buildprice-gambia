'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ChevronLeft, TrendingUp, Loader2, Package } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f97316']

type HistoryEntry = {
  date: string
  [supplier: string]: number | string
}

type CurrentPrice = {
  id: string
  price: number
  unit: string
  stockStatus: string
  updatedAt: string
  supplier: { id: string; name: string; location: string }
}

type MaterialInfo = {
  id: string
  name: string
  category: { name: string }
}

export default function PriceHistoryPage() {
  const { materialId } = useParams<{ materialId: string }>()

  const [material,       setMaterial]       = useState<MaterialInfo | null>(null)
  const [historyData,    setHistoryData]     = useState<HistoryEntry[]>([])
  const [currentPrices,  setCurrentPrices]  = useState<CurrentPrice[]>([])
  const [suppliers,      setSuppliers]      = useState<string[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [matsRes, histRes] = await Promise.all([
          fetch('/api/materials'),
          fetch(`/api/prices/history?materialId=${materialId}`),
        ])
        const matsJson = await matsRes.json()
        const histJson = await histRes.json()

        if (matsJson.ok) {
          const found = (matsJson.data as MaterialInfo[]).find(m => m.id === materialId)
          setMaterial(found ?? null)
        }

        if (histJson.ok) {
          // histJson.data shape: [{ date, supplierId, supplierName, price }]
          const raw: Array<{ date: string; supplierName: string; price: number }> = histJson.data

          // Build supplier list
          const supplierNames = [...new Set(raw.map(r => r.supplierName))]
          setSuppliers(supplierNames)

          // Group by date
          const byDate: Record<string, HistoryEntry> = {}
          raw.forEach(({ date, supplierName, price }) => {
            const d = date.slice(0, 10)
            if (!byDate[d]) byDate[d] = { date: d }
            byDate[d][supplierName] = price
          })
          setHistoryData(Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)))

          // Current prices (latest per supplier)
          const latestBySupplier: Record<string, CurrentPrice> = {}
          // Fetch current prices
          const curRes  = await fetch(`/api/prices?materialId=${materialId}`)
          const curJson = await curRes.json()
          if (curJson.ok) setCurrentPrices(curJson.data)
        }
      } catch (e) {
        setError('Failed to load price history.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [materialId])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-primary-500" />
    </div>
  )

  const lowestPrice = currentPrices.length
    ? Math.min(...currentPrices.map(p => p.price))
    : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/search" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft size={16} /> Back to search
      </Link>

      <div className="flex items-start gap-3 mb-6">
        <Package size={28} className="text-primary-500 shrink-0 mt-1" />
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {material?.name ?? 'Material Price History'}
          </h1>
          {material?.category && (
            <p className="text-sm text-gray-400 mt-0.5">{material.category.name}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">{error}</div>
      )}

      {/* Chart */}
      <div className="card mb-6 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-primary-500" />
          <h2 className="font-bold text-gray-900">Price History by Supplier</h2>
        </div>

        {historyData.length === 0 ? (
          <p className="text-gray-400 text-center py-12 text-sm">No historical data available yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={historyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => {
                const dt = new Date(d)
                return `${dt.getDate()}/${dt.getMonth() + 1}`
              }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `D${v.toLocaleString()}`} />
              <Tooltip
                formatter={(value) => [`D${Number(value).toLocaleString()}`, '']}
                labelFormatter={label => `Date: ${label}`}
              />
              <Legend />
              {suppliers.map((s, i) => (
                <Line
                  key={s}
                  type="monotone"
                  dataKey={s}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Current prices table */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Current Prices</h2>
        {currentPrices.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No current prices listed.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2.5">Supplier</th>
                  <th className="text-left px-4 py-2.5">Location</th>
                  <th className="text-right px-4 py-2.5">Price</th>
                  <th className="text-center px-4 py-2.5">Stock</th>
                  <th className="text-left px-4 py-2.5">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...currentPrices].sort((a, b) => a.price - b.price).map(p => (
                  <tr key={p.id} className={p.price === lowestPrice ? 'bg-green-50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3">
                      <Link href={`/suppliers/${p.supplier.id}`} className="font-medium text-gray-900 hover:text-primary-600">
                        {p.supplier.name}
                      </Link>
                      {p.price === lowestPrice && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">Lowest</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.supplier.location}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      D{p.price.toLocaleString()} <span className="text-xs font-normal text-gray-400">/{p.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        p.stockStatus === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                        p.stockStatus === 'LIMITED'   ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                      }`}>
                        {p.stockStatus === 'AVAILABLE' ? 'In stock' : p.stockStatus === 'LIMITED' ? 'Limited' : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(p.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
