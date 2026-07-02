'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, BarChart2, MousePointer, Eye, DollarSign } from 'lucide-react'

type Ad = {
  id: string; headline: string | null; description: string | null
  placement: string; active: boolean; budget: number; spent: number
  cpc: number; impressions: number; clicks: number
  startsAt: string; endsAt: string
}

export default function SupplierAdsPage() {
  const { token, isSupplier, ready } = useAuth()
  const router = useRouter()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ headline: '', description: '', placement: 'SEARCH', budget: 500, cpc: 5, startsAt: '', endsAt: '' })

  useEffect(() => {
    if (!ready) return
    if (!isSupplier) { router.push('/login'); return }
    fetch('/api/supplier/ads', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.ok) setAds(j.data) }).finally(() => setLoading(false))
  }, [ready, isSupplier])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    const res = await fetch('/api/supplier/ads', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const j = await res.json()
    if (j.ok) { setAds(prev => [j.data, ...prev]); setForm({ headline: '', description: '', placement: 'SEARCH', budget: 500, cpc: 5, startsAt: '', endsAt: '' }) }
    setCreating(false)
  }

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary-500" size={28} /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Advertise on BuildPriceGambia</h1>
        <p className="text-sm text-gray-400 mt-0.5">Promote your listings to reach more buyers. Pay only per click (CPC).</p>
      </div>

      {/* Pricing info */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Search Results', price: 'D5/click', desc: 'Appear at top of search results with "Sponsored" badge', color: 'border-primary-300 bg-primary-50' },
          { label: 'Homepage Banner', price: 'D8/click', desc: 'Featured slot on the homepage latest prices section', color: 'border-amber-300 bg-amber-50' },
          { label: 'Category Page', price: 'D4/click', desc: 'Appear first in your product category', color: 'border-green-300 bg-green-50' },
        ].map(p => (
          <div key={p.label} className={`card border-2 ${p.color}`}>
            <h3 className="font-bold text-gray-900">{p.label}</h3>
            <p className="text-2xl font-extrabold text-primary-600 my-1">{p.price}</p>
            <p className="text-xs text-gray-500">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Create ad form */}
      <div className="card mb-8">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Plus size={16} /> Create New Ad</h2>
        <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ad Headline</label>
            <input className="input w-full" placeholder="e.g. Best Cement Prices in Banjul" value={form.headline}
              onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Placement</label>
            <select className="input w-full" value={form.placement} onChange={e => setForm(f => ({ ...f, placement: e.target.value }))}>
              <option value="SEARCH">Search Results (D5/click)</option>
              <option value="HOMEPAGE">Homepage (D8/click)</option>
              <option value="CATEGORY">Category Page (D4/click)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Short Description</label>
            <input className="input w-full" placeholder="e.g. OPC & PPC cement, verified supplier, delivery available" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
            <input type="date" className="input w-full" value={form.startsAt} onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
            <input type="date" className="input w-full" value={form.endsAt} onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Total Budget (GMD)</label>
            <input type="number" className="input w-full" value={form.budget} min={100}
              onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) }))} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Max CPC (GMD per click)</label>
            <input type="number" className="input w-full" value={form.cpc} min={1} step={0.5}
              onChange={e => setForm(f => ({ ...f, cpc: Number(e.target.value) }))} required />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={creating} className="btn-primary w-full">
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Launch Ad Campaign
            </button>
          </div>
        </form>
      </div>

      {/* Existing ads */}
      {ads.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Your Campaigns</h2>
          <div className="space-y-4">
            {ads.map(ad => (
              <div key={ad.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{ad.headline ?? 'Untitled'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{ad.placement} · {new Date(ad.startsAt).toLocaleDateString()} → {new Date(ad.endsAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ad.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {ad.active ? 'Active' : 'Ended'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { icon: Eye,          label: 'Impressions', value: ad.impressions },
                    { icon: MousePointer, label: 'Clicks',      value: ad.clicks },
                    { icon: BarChart2,    label: 'CTR',         value: ad.impressions ? `${((ad.clicks / ad.impressions) * 100).toFixed(1)}%` : '0%' },
                    { icon: DollarSign,   label: 'Spent',       value: `D${ad.spent}/${ad.budget}` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-2">
                      <Icon size={14} className="mx-auto text-gray-400 mb-1" />
                      <p className="font-bold text-gray-900 text-sm">{value}</p>
                      <p className="text-xs text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
                {/* Budget progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Budget used</span>
                    <span>D{ad.spent} / D{ad.budget}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className="h-1.5 bg-primary-400 rounded-full transition-all" style={{ width: `${Math.min((ad.spent / ad.budget) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
