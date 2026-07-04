'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useT, useLang } from '@/lib/LanguageContext'
import { GAMBIA_LOCATIONS, getUserLocation } from '@/lib/location'
import { getCategoryMeta } from '@/lib/visual'
import { CheckCircle2, ChevronLeft, Loader2, MapPin } from 'lucide-react'

type MaterialOption = { id: string; name: string; categoryName: string }

const UNITS = ['Bag', 'Block', 'Sheet', 'Ton', 'm³', 'm²', 'Piece', 'Roll']

const TOTAL_STEPS = 6

export default function ReportWizard() {
  const tr = useT()
  const { locale } = useLang()
  const isRTL = locale === 'ar'

  const [step, setStep] = useState(1)

  // Data
  const [materials, setMaterials]   = useState<MaterialOption[]>([])
  const [phone,     setPhone]       = useState('')
  const [name,      setName]        = useState('')
  const [materialId, setMaterialId] = useState<string | null>(null)
  const [materialLabel, setMaterialLabel] = useState('')
  const [otherMaterial, setOtherMaterial] = useState('')
  const [price,     setPrice]       = useState('')
  const [unit,      setUnit]        = useState('')
  const [otherUnit, setOtherUnit]   = useState('')
  const [location,  setLocation]    = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [note,      setNote]        = useState('')

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [error,       setError]     = useState('')
  const [totalCount,  setTotalCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/materials')
      .then(r => r.json())
      .then(j => {
        if (j.ok) setMaterials(j.data.map((m: any) => ({ id: m.id, name: m.name, categoryName: m.category?.name ?? '' })))
      })
      .catch(() => {})
    const stored = getUserLocation()
    if (stored) setLocation(stored)
  }, [])

  const finalUnit = unit === 'Other' ? otherUnit : unit
  const finalMaterialLabel = materialId ? materialLabel : otherMaterial

  const canProceed = (() => {
    switch (step) {
      case 1: return /^\+?\d{7,15}$/.test(phone.trim())
      case 2: return !!finalMaterialLabel.trim()
      case 3: return !!price && Number(price) > 0 && !!finalUnit.trim()
      case 4: return !!location
      case 5: return true // extra details are optional
      default: return true
    }
  })()

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS))
  const back = () => setStep(s => Math.max(s - 1, 1))

  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/field-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterName: name || undefined,
          reporterPhone: phone.trim(),
          materialId,
          materialLabel: finalMaterialLabel,
          price: Number(price),
          unit: finalUnit,
          location,
          supplierName: supplierName || undefined,
          photoNote: note || undefined,
        }),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error ?? 'Something went wrong. Please try again.'); return }
      setTotalCount(json.data.totalCount)
      setStep(TOTAL_STEPS + 1)
    } catch {
      setError('Could not send — check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForAnother = () => {
    setMaterialId(null); setMaterialLabel(''); setOtherMaterial('')
    setPrice(''); setUnit(''); setOtherUnit('')
    setSupplierName(''); setNote(''); setError('')
    setStep(2)
  }

  const bigBtn = (selected: boolean) =>
    `flex items-center justify-center text-center gap-2 rounded-2xl border-2 px-4 py-5 text-base font-semibold transition-colors ${
      selected ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
    }`

  return (
    <div className="max-w-lg mx-auto px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-display">{tr('report.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{tr('report.subtitle')}</p>
      </div>

      {/* Progress dots */}
      {step <= TOTAL_STEPS && (
        <div className="flex justify-center gap-1.5 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i + 1 === step ? 'w-8 bg-primary-500' : i + 1 < step ? 'w-4 bg-primary-300' : 'w-4 bg-gray-200'}`} />
          ))}
        </div>
      )}

      <div className="card min-h-[320px] flex flex-col">
        {/* Step 1 — phone */}
        {step === 1 && (
          <div className="flex-1 flex flex-col gap-4">
            <label className="text-lg font-bold text-gray-900">{tr('report.step.phone.label')}</label>
            <p className="text-sm text-gray-500 -mt-2">{tr('report.step.phone.hint')}</p>
            <input
              type="tel"
              inputMode="numeric"
              className="input text-xl py-4 text-center tracking-wide"
              placeholder={tr('report.step.phone.placeholder')}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              autoFocus
            />
            <div className="mt-2">
              <label className="text-sm font-medium text-gray-600 mb-1 block">{tr('report.step.name.label')}</label>
              <input
                type="text"
                className="input py-3"
                placeholder={tr('report.step.name.placeholder')}
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2 — material */}
        {step === 2 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">{tr('report.step.material.title')}</h2>
            <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {materials.map(m => {
                const cm = getCategoryMeta(m.categoryName)
                const selected = materialId === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => { setMaterialId(m.id); setMaterialLabel(m.name); setOtherMaterial('') }}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-colors ${selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden">
                      <img src={cm.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{m.name}</span>
                  </button>
                )
              })}
            </div>
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => { setMaterialId(null); setMaterialLabel('') }}
                className={bigBtn(materialId === null && !!otherMaterial) + ' w-full'}
              >
                {tr('report.step.material.other')}
              </button>
              {materialId === null && (
                <input
                  type="text"
                  className="input mt-3 py-3"
                  placeholder={tr('report.step.material.otherPlaceholder')}
                  value={otherMaterial}
                  onChange={e => setOtherMaterial(e.target.value)}
                />
              )}
            </div>
          </div>
        )}

        {/* Step 3 — price + unit */}
        {step === 3 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">{tr('report.step.price.title')}</h2>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-primary-600">D</span>
              <input
                type="number"
                inputMode="decimal"
                className="input text-3xl font-extrabold py-4 text-center"
                placeholder="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                autoFocus
              />
            </div>
            <p className="text-sm font-semibold text-gray-600 mt-2">{tr('report.step.price.unit')}</p>
            <div className="grid grid-cols-3 gap-2">
              {UNITS.map(u => (
                <button key={u} onClick={() => setUnit(u)} className={bigBtn(unit === u) + ' py-3 text-sm'}>
                  {u}
                </button>
              ))}
              <button onClick={() => setUnit('Other')} className={bigBtn(unit === 'Other') + ' py-3 text-sm'}>
                {tr('report.step.price.unitOther')}
              </button>
            </div>
            {unit === 'Other' && (
              <input
                type="text"
                className="input py-3"
                placeholder={tr('report.step.price.unitOtherPlaceholder')}
                value={otherUnit}
                onChange={e => setOtherUnit(e.target.value)}
              />
            )}
          </div>
        )}

        {/* Step 4 — location */}
        {step === 4 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">{tr('report.step.location.title')}</h2>
            <div className="grid grid-cols-2 gap-3">
              {GAMBIA_LOCATIONS.map(loc => (
                <button key={loc} onClick={() => setLocation(loc)} className={bigBtn(location === loc)}>
                  <MapPin size={16} /> {loc}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5 — extra (optional) */}
        {step === 5 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">{tr('report.step.extra.title')}</h2>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">{tr('report.step.extra.supplier')}</label>
              <input type="text" className="input py-3" value={supplierName} onChange={e => setSupplierName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">{tr('report.step.extra.note')}</label>
              <textarea className="input py-3 min-h-[80px] resize-none" value={note} onChange={e => setNote(e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 6 — review */}
        {step === 6 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">{tr('report.step.review.title')}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">{tr('report.step.review.material')}</span>
                <span className="font-semibold text-gray-900">{finalMaterialLabel}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">{tr('report.step.review.price')}</span>
                <span className="font-semibold text-gray-900">D{price} / {finalUnit}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">{tr('report.step.review.location')}</span>
                <span className="font-semibold text-gray-900">{location}</span>
              </div>
              {supplierName && (
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">{tr('report.step.extra.supplier')}</span>
                  <span className="font-semibold text-gray-900">{supplierName}</span>
                </div>
              )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )}

        {/* Thank you */}
        {step === TOTAL_STEPS + 1 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-6">
            <CheckCircle2 size={48} className="text-emerald-500" />
            <h2 className="text-xl font-bold text-gray-900">{tr('report.thankyou.title')}</h2>
            {totalCount !== null && (
              <p className="text-sm text-gray-500">
                {tr('report.thankyou.prefix')} <span className="font-bold text-primary-600">{totalCount}</span> {tr('report.thankyou.suffix')}
              </p>
            )}
            <div className="flex gap-2 mt-4 w-full">
              <button onClick={resetForAnother} className="btn-primary flex-1 justify-center py-3">
                {tr('report.thankyou.another')}
              </button>
              <Link href="/" className="btn-secondary flex-1 justify-center py-3">
                <ChevronLeft size={16} /> Home
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step <= TOTAL_STEPS && (
        <div className="flex items-center gap-3 mt-5">
          {step > 1 && (
            <button onClick={back} className="btn-secondary py-3 px-5">
              <ChevronLeft size={16} /> {tr('report.nav.back')}
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button onClick={next} disabled={!canProceed} className="btn-primary flex-1 justify-center py-3 text-base">
              {tr('report.nav.next')}
            </button>
          ) : (
            <button onClick={submit} disabled={submitting} className="btn-primary flex-1 justify-center py-3 text-base">
              {submitting ? <Loader2 size={18} className="animate-spin" /> : tr('report.step.review.submit')}
            </button>
          )}
        </div>
      )}
      {step <= TOTAL_STEPS && error && <p className="text-sm text-red-500 mt-3 text-center">{error}</p>}
    </div>
  )
}
