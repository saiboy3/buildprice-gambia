'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context'
import Link from 'next/link'
import {
  calculate, buildPriceMap, DEFAULT_INPUTS,
  type EstimatorInputs, type LineItem, type PriceMap,
} from '@/lib/estimator'
import {
  Calculator, Share2, Printer, ChevronDown, ChevronUp,
  Loader2, CheckCircle, Building2, Layers, Hammer, Paintbrush,
  MapPin, Trophy, BadgeCheck, Phone, ExternalLink, ShieldCheck,
} from 'lucide-react'
import clsx from 'clsx'

// ─── types ────────────────────────────────────────────────────────────────────

type RawPrice = {
  price: number
  unit:  string
  material: { name: string }
  supplier: { id: string; name: string; location: string; contact: string; verified: boolean }
}

type SupplierScore = {
  supplierId: string
  name:       string
  location:   string
  contact:    string
  verified:   boolean
  coveredMaterialKeys: string[]
  coveredLines: Array<{ description: string; qty: number; price: number; total: number }>
  estimatedCost: number
  coveragePct:   number   // 0-100
  proximityScore: number
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const D = (n: number | null) =>
  n !== null ? `D${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '–'

function materialKey(itemId: string): string {
  if (itemId.startsWith('cement')) return 'cement'
  if (itemId.startsWith('sand'))   return 'sand'
  if (itemId.startsWith('gravel')) return 'gravel'
  if (itemId === 'blocks')         return 'blocks'
  if (itemId.startsWith('zinc'))   return 'zinc'
  if (itemId.startsWith('timber')) return 'timber'
  if (itemId.startsWith('rebar'))  return 'rebar'
  return itemId
}

function priceMatchesKey(materialName: string, key: string): boolean {
  const n = materialName.toLowerCase()
  switch (key) {
    case 'cement': return n.includes('cement')
    case 'sand':   return n.includes('sand')
    case 'gravel': return n.includes('gravel')
    case 'blocks': return n.includes('block')
    case 'zinc':   return n.includes('zinc')
    case 'timber': return n.includes('timber')
    case 'rebar':  return n.includes('rebar')
    default:       return false
  }
}

function proximityScore(projectLoc: string, supplierLoc: string): number {
  if (!projectLoc.trim()) return 0
  const words = projectLoc.toLowerCase().split(/\W+/).filter(w => w.length > 2)
  const sLoc  = supplierLoc.toLowerCase()
  return words.filter(w => sLoc.includes(w)).length
}

function computeSupplierSuggestions(items: LineItem[], rawPrices: RawPrice[], location: string): SupplierScore[] {
  // Build per-supplier lowest price lookup: supplierId → materialKey → lowestPrice
  const supplierPriceMap = new Map<string, Map<string, { price: number; unit: string }>>()
  const supplierMeta     = new Map<string, RawPrice['supplier']>()

  for (const p of rawPrices) {
    if (!supplierMeta.has(p.supplier.id)) supplierMeta.set(p.supplier.id, p.supplier)
    let keyMap = supplierPriceMap.get(p.supplier.id)
    if (!keyMap) { keyMap = new Map(); supplierPriceMap.set(p.supplier.id, keyMap) }
    const mk = ['cement','sand','gravel','blocks','zinc','timber','rebar'].find(k => priceMatchesKey(p.material.name, k))
    if (!mk) continue
    const existing = keyMap.get(mk)
    if (!existing || p.price < existing.price) keyMap.set(mk, { price: p.price, unit: p.unit })
  }

  // Unique material keys needed in this BoQ
  const uniqueKeys = Array.from(new Set(items.map(i => materialKey(i.id))))

  const scores: SupplierScore[] = []

  for (const [supplierId, keyMap] of supplierPriceMap) {
    const meta = supplierMeta.get(supplierId)!
    const coveredMaterialKeys: string[] = []
    const coveredLines: SupplierScore['coveredLines'] = []
    let estimatedCost = 0

    // For each BoQ line item, find if this supplier has a price for that material key
    // Aggregate by material key (multiple line items may use same material, e.g. cement in mortar + plaster + foundation)
    const seenKeys = new Set<string>()
    for (const it of items) {
      const mk = materialKey(it.id)
      const entry = keyMap.get(mk)
      if (!entry) continue
      const lineTotal = it.quantity * entry.price
      estimatedCost += lineTotal
      if (!seenKeys.has(mk)) {
        seenKeys.add(mk)
        coveredMaterialKeys.push(mk)
      }
      coveredLines.push({ description: it.description, qty: it.quantity, price: entry.price, total: lineTotal })
    }

    if (coveredMaterialKeys.length === 0) continue

    scores.push({
      supplierId,
      name:     meta.name,
      location: meta.location,
      contact:  meta.contact,
      verified: meta.verified,
      coveredMaterialKeys,
      coveredLines,
      estimatedCost,
      coveragePct:    Math.round((coveredMaterialKeys.length / uniqueKeys.length) * 100),
      proximityScore: proximityScore(location, meta.location),
    })
  }

  return scores
}

// ─── sub-components ───────────────────────────────────────────────────────────

function Field({ label, unit, children, hint }: { label: string; unit?: string; children: React.ReactNode; hint?: string }) {
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

function Section({ icon: Icon, title, color, open, onToggle, children }: {
  icon: React.ElementType; title: string; color: string
  open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="card overflow-hidden p-0">
      <button type="button" onClick={onToggle}
        className={clsx('w-full flex items-center justify-between px-4 py-3 font-semibold text-sm', color)}>
        <span className="flex items-center gap-2"><Icon size={15} />{title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="px-4 py-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>}
    </div>
  )
}

function SupplierCard({ score, badge, badgeColor, badgeIcon: BadgeIcon }: {
  score: SupplierScore
  badge: string
  badgeColor: string
  badgeIcon: React.ElementType
}) {
  // Group lines by material key for display (collapse duplicates)
  const grouped = new Map<string, { description: string; totalQty: number; price: number; total: number }>()
  for (const l of score.coveredLines) {
    const key = l.description
    const existing = grouped.get(key)
    if (existing) { existing.totalQty += l.qty; existing.total += l.total }
    else grouped.set(key, { description: l.description, totalQty: l.qty, price: l.price, total: l.total })
  }

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Badge header */}
      <div className={clsx('px-4 py-2.5 flex items-center gap-2 text-xs font-semibold', badgeColor)}>
        <BadgeIcon size={13} />
        {badge}
        {score.verified && (
          <span className="ml-auto flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            <ShieldCheck size={11} /> Verified
          </span>
        )}
      </div>

      <div className="px-4 pt-3 pb-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-base leading-tight">{score.name}</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin size={11} /> {score.location}
          {score.contact && (
            <span className="ml-3 flex items-center gap-1">
              <Phone size={11} /> {score.contact}
            </span>
          )}
        </div>

        {/* Coverage bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Materials covered</span>
            <span className="font-semibold text-gray-700">{score.coveragePct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${score.coveragePct}%` }} />
          </div>
        </div>

        {/* Material price list */}
        <div className="space-y-1 mb-3">
          {Array.from(grouped.values()).slice(0, 5).map(l => (
            <div key={l.description} className="flex justify-between text-xs">
              <span className="text-gray-600 truncate mr-2">{l.description}</span>
              <span className="font-medium text-gray-900 shrink-0">{D(l.total)}</span>
            </div>
          ))}
          {grouped.size > 5 && (
            <p className="text-xs text-gray-400">+{grouped.size - 5} more items…</p>
          )}
        </div>

        {/* Estimated sub-total */}
        <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">Est. sub-total</span>
          <span className="font-bold text-gray-900">{D(score.estimatedCost)}</span>
        </div>

        <Link href={`/suppliers/${score.supplierId}`}
          className="mt-3 flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-primary-600 hover:text-primary-800 border border-primary-200 hover:border-primary-400 rounded-lg py-1.5 transition-colors">
          View supplier profile <ExternalLink size={11} />
        </Link>
      </div>
    </div>
  )
}

function SupplierSuggestions({ scores }: { scores: SupplierScore[] }) {
  if (scores.length === 0) return null

  const byPrice     = [...scores].sort((a, b) => a.estimatedCost - b.estimatedCost)[0]
  const byProximity = [...scores].sort((a, b) => b.proximityScore - a.proximityScore)[0]
  const byVerified  = scores.find(s => s.verified && s.supplierId !== byPrice.supplierId && s.supplierId !== byProximity.supplierId)
    ?? scores.find(s => s.verified)

  // Deduplicate: avoid showing same supplier in multiple slots
  const shown = new Set<string>()
  const slots: Array<{ score: SupplierScore; badge: string; badgeColor: string; badgeIcon: React.ElementType }> = []

  const add = (score: SupplierScore | undefined, badge: string, color: string, icon: React.ElementType) => {
    if (!score || shown.has(score.supplierId)) return
    shown.add(score.supplierId)
    slots.push({ score, badge, badgeColor: color, badgeIcon: icon })
  }

  add(byPrice,     'Best Price',       'bg-amber-50 text-amber-800',   Trophy)
  add(byProximity, 'Nearest to You',   'bg-blue-50 text-blue-800',     MapPin)
  add(byVerified,  'Verified Supplier','bg-emerald-50 text-emerald-800',BadgeCheck)

  // Fill remaining verified suppliers not yet shown
  for (const s of scores.filter(s => s.verified && !shown.has(s.supplierId))) {
    if (slots.length >= 3) break
    add(s, 'Verified Supplier', 'bg-emerald-50 text-emerald-800', BadgeCheck)
  }

  if (slots.length === 0) return null

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-lg font-bold text-gray-900">Where to source your materials</h2>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Based on your project, here are suppliers who stock the materials you need.
        Prices shown are their current listings — visit their profiles for full details.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map(s => (
          <SupplierCard key={s.score.supplierId} {...s} />
        ))}
      </div>

      {scores.length > slots.length && (
        <p className="text-xs text-gray-400 text-center mt-4">
          {scores.length - slots.length} more supplier{scores.length - slots.length > 1 ? 's' : ''} also stock these materials.{' '}
          <Link href="/suppliers" className="text-primary-600 hover:underline">Browse all suppliers →</Link>
        </p>
      )}

      <p className="text-xs text-gray-400 mt-3 text-center">
        Suggested suppliers are based on current price listings. Always confirm availability and negotiate directly.
      </p>
    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function EstimatorPage() {
  const { token } = useAuth()

  const [inputs,     setInputs]     = useState<EstimatorInputs>(DEFAULT_INPUTS)
  const [prices,     setPrices]     = useState<PriceMap>({ cement: null, sand: null, gravel: null, zinc: null, timber: null, rebar: null, blocks: null })
  const [rawPrices,  setRawPrices]  = useState<RawPrice[]>([])
  const [items,      setItems]      = useState<LineItem[]>([])
  const [calculated, setCalculated] = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [shareUrl,   setShareUrl]   = useState<string | null>(null)
  const [copied,     setCopied]     = useState(false)
  const [openSections, setOpenSections] = useState({ walls: true, roof: true, foundation: true, plaster: true })
  const [supplierScores, setSupplierScores] = useState<SupplierScore[]>([])

  const toggleSection = (k: keyof typeof openSections) =>
    setOpenSections(s => ({ ...s, [k]: !s[k] }))

  const set = (key: keyof EstimatorInputs, val: any) =>
    setInputs(prev => ({ ...prev, [key]: val }))

  useEffect(() => {
    fetch('/api/prices')
      .then(r => r.json())
      .then(json => {
        if (!json.ok) return
        setRawPrices(json.data)
        setPrices(buildPriceMap(json.data))
      })
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
    setSupplierScores(computeSupplierSuggestions(result, rawPrices, inputs.location))
    setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const totalCost = items.reduce((s, i) => s + (i.total ?? 0), 0)
  const hasAllPrices = items.length > 0 && items.every(i => i.unitPrice !== null)

  const handleSaveAndShare = async () => {
    setSaving(true)
    try {
      const res  = await fetch('/api/estimates', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body:    JSON.stringify({ projectName: inputs.projectName, location: inputs.location, inputs, results: items, totalCost }),
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Calculator size={26} className="text-primary-500" /> Construction Estimator
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Enter your building dimensions to get a full Bill of Quantities with current market prices.
        </p>
      </div>

      {/* ── Form ── */}
      <div className="space-y-4 mb-6">
        {/* Project info */}
        <div className="card grid gap-4 sm:grid-cols-2">
          <Field label="Project name">
            <input className="input" placeholder="e.g. Family Home – Banjul"
              value={inputs.projectName} onChange={e => set('projectName', e.target.value)} />
          </Field>
          <Field label="Location" hint="Used to find nearby suppliers">
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
              <p className="text-primary-100 text-sm font-medium mb-1">Total Estimated Material Cost</p>
              <p className="text-4xl font-extrabold tracking-tight">
                {totalCost > 0 ? `D${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'Prices unavailable'}
              </p>
              <p className="text-primary-200 text-xs mt-1">{inputs.projectName}{inputs.location ? ` · ${inputs.location}` : ''}</p>
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
              <button onClick={handleCopy} className="btn-primary text-xs px-3 py-1.5 shrink-0">
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

          {/* Grand total */}
          <div className="flex justify-end mb-2">
            <div className="bg-gray-900 text-white rounded-xl px-6 py-4 text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Grand Total</p>
              <p className="text-2xl font-extrabold">
                {totalCost > 0 ? `D${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mb-8">
            Estimate generated {new Date().toLocaleString()} · Prices sourced from BuildPriceGambia supplier listings ·
            Add 10–15% contingency for final budgeting
          </p>

          {/* ── Supplier Suggestions ── */}
          <SupplierSuggestions scores={supplierScores} />
        </div>
      )}
    </div>
  )
}
