'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, Loader2, ChevronLeft } from 'lucide-react'

type BOQRow = { material: string; qty: string; unit: string }

const emptyRow = (): BOQRow => ({ material: '', qty: '', unit: '' })

export default function NewRFQPage() {
  const { user, token } = useAuth()
  const router = useRouter()

  const [title,     setTitle]     = useState('')
  const [location,  setLocation]  = useState('')
  const [deadline,  setDeadline]  = useState('')
  const [rows,      setRows]      = useState<BOQRow[]>([emptyRow()])
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  if (!user) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center text-gray-500">
      <p className="mb-4">Please sign in to post an RFQ.</p>
      <Link href="/login" className="btn-primary">Sign in</Link>
    </div>
  )

  const updateRow = (i: number, field: keyof BOQRow, val: string) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

  const addRow    = () => setRows(prev => [...prev, emptyRow()])
  const removeRow = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i))

  const submit = async () => {
    if (!title.trim()) { setError('Title is required.'); return }
    const boqItems = rows.filter(r => r.material.trim())
    if (boqItems.length === 0) { setError('Add at least one BOQ line item.'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          location,
          deadline: deadline || null,
          boqJson: JSON.stringify(boqItems.map(r => ({
            material: r.material,
            qty: parseFloat(r.qty) || 0,
            unit: r.unit,
          }))),
        }),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error ?? 'Failed to create RFQ.'); return }
      router.push('/rfq')
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/rfq" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft size={16} /> My RFQs
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New RFQ</h1>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl mb-4">{error}</p>}

      <div className="card space-y-5">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Title *</label>
          <input className="input w-full" placeholder="e.g. Materials for 3-bedroom house foundation"
            value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Location</label>
            <input className="input w-full" placeholder="e.g. Brikama, West Coast Region"
              value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Quote Deadline</label>
            <input type="date" className="input w-full"
              value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
        </div>
      </div>

      {/* BOQ section */}
      <div className="card mt-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Bill of Quantities (BOQ)</h2>
          <button onClick={addRow} className="btn-secondary text-sm">
            <Plus size={14} /> Add row
          </button>
        </div>

        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 px-1 mb-1">
            <span className="col-span-6">Material</span>
            <span className="col-span-2">Qty</span>
            <span className="col-span-3">Unit</span>
            <span className="col-span-1"></span>
          </div>

          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input className="input text-sm col-span-6" placeholder="e.g. OPC Cement 50kg"
                value={row.material} onChange={e => updateRow(i, 'material', e.target.value)} />
              <input type="number" className="input text-sm col-span-2" placeholder="100" min={0}
                value={row.qty} onChange={e => updateRow(i, 'qty', e.target.value)} />
              <input className="input text-sm col-span-3" placeholder="bags"
                value={row.unit} onChange={e => updateRow(i, 'unit', e.target.value)} />
              <button onClick={() => removeRow(i)} disabled={rows.length === 1}
                className="col-span-1 flex justify-center text-gray-300 hover:text-red-400 transition-colors disabled:opacity-30">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button onClick={submit} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          {saving ? 'Posting…' : 'Post RFQ'}
        </button>
        <Link href="/rfq" className="btn-secondary">Cancel</Link>
      </div>
    </div>
  )
}
