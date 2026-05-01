'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import {
  calculate, buildPriceMap, DEFAULT_INPUTS,
  type EstimatorInputs, type LineItem, type PriceMap,
} from '@/lib/estimator'
import {
  Calculator, Share2, Printer, ChevronDown, ChevronUp,
  Loader2, CheckCircle, Building2, Layers, Hammer, Paintbrush,
} from 'lucide-react'
import clsx from 'clsx'

// ─── small helpers ────────────────────────────────────────────────────────────

const D = (n: number | null) =>
  n !== null ? `D${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '–'

function Field({
  label, unit, children, hint,
}: { label: string; unit?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 mb-1 block">
        {label} {unit && <span className="font-normal text-gray-400">({unit})</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  )
}

function Section({
  icon: Icon, title, color, open, onToggle, children,
}: {
  icon: React.ElementType; title: string; color: string
  open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="card overflow-hidden p-0">
      <button
        type="button"
        onClick={onToggle}
        className={clsx('w-full flex items-center justify-between px-4 py-3 font-semibold text-sm', color)}
      >
        <span className="flex items-center gap-2"><Icon size={15} />{title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="px-4 py-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>}
    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function EstimatorPage() {
  const { user, token } = useAuth()
  const router = useRouter()

  const [inputs,   setInputs]   = useState<EstimatorInputs>(DEFAULT_INPUTS)
  const [prices,   setPrices]   = useState<PriceMap>({ cement: null, sand: null, gravel: null, zinc: null, timber: null, rebar: null, blocks: null })
  const [items,    setItems]    = useState<LineItem[]>([])
  const [calculated, setCalculated] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied,   setCopied]   = useState(false)
  const [openSections, setOpenSections] = useState({ walls: true, roof: true, foundation: true, plaster: true })

  const toggleSection = (k: keyof typeof openSections) =>
    setOpenSections(s => ({ ...s, [k]: !s[k] }))

  const set = (key: keyof EstimatorInputs, val: any) =>
    setInputs(prev => ({ ...prev, [key]: val }))

  // Fetch current lowest prices from DB
  useEffect(() => {
    fetch('/api/prices')
      .then(r => r.json())
      .then(json => { if (json.ok) setPrices(buildPriceMap(json.data)) })
      .catch(() => {})
  }, [])

  const handleCalculate = () => {
    if (!inputs.projectName.trim()) {
      alert('Please enter a project name first.')
      return
    }
    const result = calculate(inputs, prices)
    setItems(result)
    setCalculated(true)
    setShareUrl(null)
    setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const totalCost = items.reduce((s, i) => s + (i.total ?? 0), 0)
  const hasAllPrices = items.length > 0 && items.every(i => i.unitPrice !== null)

  const handleSaveAndShare = async () => {
    setSaving(true)
    try {
      const res  = await fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ projectName: inputs.projectName, location: inputs.location, inputs, results: items, totalCost }),
      })
      const json = await res.json()
      if (!json.ok) { alert('Could not save estimate. Try again.'); return }
      const url = `${window.location.origin}/estimator/${json.data.shareToken}`
      setShareUrl(url)
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    if (shareUrl) { window.open(shareUrl + '?print=1', '_blank') }
    else { alert('Click "Save & Share" first to get a print-ready page.') }
  }

  const groupedItems = items.reduce<Record<string, LineItem[]>>((acc, item) => {
    acc[item.category] = acc[item.category] ?? []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 print:py-2">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Calculator size={26} className="text-primary-500" /> Construction Estimator
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your building dimensions to get a full Bill of Quantities with current market prices.
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="space-y-4 mb-6">
        {/* Project info */}
        <div className="card grid gap-4 sm:grid-cols-2">
          <Field label="Project name">
            <input className="input" placeholder="e.g. Family Home – Banjul"
              value={inputs.projectName} onChange={e => set('projectName', e.target.value)} />
          </Field>
          <Field label="Location">
            <input className="input" placeholder="e.g. Serrekunda"
              value={inputs.location} onChange={e => set('location', e.target.value)} />
          </Field>
        </div>

        {/* Walls */}
        <Section icon={Building2} title="Walls & Masonry" color="bg-blue-50 text-blue-800"
          open={openSections.walls} onToggle={() => toggleSection('walls')}>
          <Field label="Building length" unit="m">
            <input type="number" className="input" min={1} step={0.1}
              value={inputs.buildingLength} onChange={e => set('buildingLength', +e.target.value)} />
          </Field>
          <Field label="Building width" unit="m">
            <input type="number" className="input" min={1} step={0.1}
              value={inputs.buildingWidth} onChange={e => set('buildingWidth', +e.target.value)} />
          </Field>
          <Field label="Wall height per floor" unit="m">
            <input type="number" className="input" min={2} max={5} step={0.1}
              value={inputs.wallHeight} onChange={e => set('wallHeight', +e.target.value)} />
          </Field>
          <Field label="Number of floors">
            <input type="number" className="input" min={1} max={5}
              value={inputs.numFloors} onChange={e => set('numFloors', +e.target.value)} />
          </Field>
          <Field label="Number of doors" hint="Standard 0.9 m × 2.1 m">
            <input type="number" className="input" min={0}
              value={inputs.numDoors} onChange={e => set('numDoors', +e.target.value)} />
          </Field>
          <Field label="Number of windows" hint="Standard 1.2 m × 1.2 m">
            <input type="number" className="input" min={0}
              value={inputs.numWindows} onChange={e => set('numWindows', +e.target.value)} />
          </Field>
        </Section>

        {/* Plastering */}
        <Section icon={Paintbrush} title="Plastering" color="bg-purple-50 text-purple-800"
          open={openSections.plaster} onToggle={() => toggleSection('plaster')}>
          <Field label="Include plastering?" hint="Both faces of all walls, 15 mm thick">
            <div className="flex gap-3 mt-1">
              {[true, false].map(v => (
                <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="plaster" checked={inputs.includePlastering === v}
                    onChange={() => set('includePlastering', v)} />
                  {v ? 'Yes' : 'No'}
                </label>
              ))}
            </div>
          </Field>
        </Section>

        {/* Foundation */}
        <Section icon={Layers} title="Foundation" color="bg-amber-50 text-amber-800"
          open={openSections.foundation} onToggle={() => toggleSection('foundation')}>
          <Field label="Include foundation?">
            <div className="flex gap-3 mt-1">
              {[true, false].map(v => (
                <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="foundation" checked={inputs.includeFoundation === v}
                    onChange={() => set('includeFoundation', v)} />
                  {v ? 'Yes' : 'No'}
                </label>
              ))}
            </div>
          </Field>
          {inputs.includeFoundation && <>
            <Field label="Foundation width" unit="m" hint="Typically 0.45 m">
              <input type="number" className="input" min={0.3} max={1} step={0.05}
                value={inputs.foundationWidth} onChange={e => set('foundationWidth', +e.target.value)} />
            </Field>
            <Field label="Foundation depth" unit="m" hint="Typically 0.6 m">
              <input type="number" className="input" min={0.3} max={1.5} step={0.05}
                value={inputs.foundationDepth} onChange={e => set('foundationDepth', +e.target.value)} />
            </Field>
          </>}
        </Section>

        {/* Roof */}
        <Section icon={Hammer} title="Roofing" color="bg-green-50 text-green-800"
          open={openSections.roof} onToggle={() => toggleSection('roof')}>
          <Field label="Include roof?">
            <div className="flex gap-3 mt-1">
              {[true, false].map(v => (
                <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="roof" checked={inputs.includeRoof === v}
                    onChange={() => set('includeRoof', v)} />
                  {v ? 'Yes' : 'No'}
                </label>
              ))}
            </div>
          </Field>
          {inputs.includeRoof && <>
            <Field label="Roof pitch" unit="degrees" hint="Typically 20–25°">
              <input type="number" className="input" min={10} max={45}
                value={inputs.roofPitch} onChange={e => set('roofPitch', +e.target.value)} />
            </Field>
            <Field label="Overhang each side" unit="m">
              <input type="number" className="input" min={0} max={1.5} step={0.1}
                value={inputs.roofOverhang} onChange={e => set('roofOverhang', +e.target.value)} />
            </Field>
            <Field label="Sheet length" unit="ft">
              <select className="input" value={inputs.sheetLength}
                onChange={e => set('sheetLength', +e.target.value)}>
                <option value={6}>6 ft</option>
                <option value={8}>8 ft</option>
                <option value={10}>10 ft</option>
              </select>
            </Field>
          </>}
        </Section>
      </div>

      <button onClick={handleCalculate}
        className="btn-primary w-full py-3 text-base mb-10 shadow-md hover:shadow-lg transition-shadow">
        <Calculator size={18} /> Calculate Bill of Quantities
      </button>

      {/* ── Results ── */}
      {calculated && (
        <div id="results">
          {/* Total banner */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl p-6 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-primary-100 text-sm font-medium mb-1">Total Estimated Cost</p>
              <p className="text-4xl font-extrabold tracking-tight">
                {totalCost > 0 ? `D${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'Prices unavailable'}
              </p>
              <p className="text-primary-200 text-xs mt-1">{inputs.projectName} · {inputs.location}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={handleSaveAndShare} disabled={saving}
                className="btn bg-white text-primary-700 hover:bg-primary-50 shadow text-sm px-4 py-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                Save & Share
              </button>
              <button onClick={handlePrint}
                className="btn bg-primary-700 text-white hover:bg-primary-800 text-sm px-4 py-2">
                <Printer size={14} /> Print / PDF
              </button>
            </div>
          </div>

          {/* Share URL */}
          {shareUrl && (
            <div className="card mb-6 flex flex-wrap items-center gap-3 border-primary-200 bg-primary-50">
              <CheckCircle size={18} className="text-primary-600 shrink-0" />
              <p className="text-sm text-primary-800 flex-1 break-all font-medium">{shareUrl}</p>
              <button onClick={handleCopy}
                className="btn-primary text-xs px-3 py-1.5 shrink-0">
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          )}

          {!hasAllPrices && (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4">
              ⚠ Some items are missing current market prices. Quantities are still correct — contact suppliers to complete your estimate.
            </p>
          )}

          {/* Bill of Quantities by category */}
          {Object.entries(groupedItems).map(([cat, catItems]) => (
            <div key={cat} className="mb-6">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">{cat}</h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-2.5">Description</th>
                      <th className="text-right px-4 py-2.5">Qty</th>
                      <th className="text-left px-4 py-2.5">Unit</th>
                      <th className="text-right px-4 py-2.5">Unit price</th>
                      <th className="text-right px-4 py-2.5">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {catItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{item.description}</p>
                          {item.note && <p className="text-xs text-gray-400">{item.note}</p>}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">{item.quantity.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{item.unit}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{D(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">{D(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Grand total row */}
          <div className="flex justify-end">
            <div className="bg-gray-900 text-white rounded-xl px-6 py-4 text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Grand Total</p>
              <p className="text-2xl font-extrabold">
                {totalCost > 0
                  ? `D${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                  : '—'}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Estimate generated {new Date().toLocaleString()} · Prices sourced from BuildPriceGambia supplier listings ·
            Add 10–15% contingency for final budgeting
          </p>
        </div>
      )}
    </div>
  )
}
