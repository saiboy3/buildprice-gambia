'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useT, useLang } from '@/lib/LanguageContext'
import { useAuth } from '@/lib/context'
import { GAMBIA_LOCATIONS, getUserLocation } from '@/lib/location'
import { getCategoryMeta, unsplashSrcSet, IMG_WIDTHS } from '@/lib/visual'
import { saveDraft, loadDraft, clearDraft, enqueue, flushQueue, getQueue, type ReportDraft } from '@/lib/offlineQueue'
import { CheckCircle2, ChevronLeft, Loader2, MapPin, LogIn, Navigation, CloudOff } from 'lucide-react'

type MaterialOption = { id: string; name: string; categoryName: string }

const UNITS = ['Bag', 'Block', 'Sheet', 'Ton', 'm³', 'm²', 'Piece', 'Roll']

const TOTAL_STEPS = 5

export default function ReportWizard() {
  const tr = useT()
  const { locale } = useLang()
  const isRTL = locale === 'ar'
  const { user, token, ready } = useAuth()

  const [step, setStep] = useState(1)
  const [draftRestored, setDraftRestored] = useState(false)

  // Data
  const [materials, setMaterials]   = useState<MaterialOption[]>([])
  const [materialId, setMaterialId] = useState<string | null>(null)
  const [materialLabel, setMaterialLabel] = useState('')
  const [otherMaterial, setOtherMaterial] = useState('')
  const [price,     setPrice]       = useState('')
  const [unit,      setUnit]        = useState('')
  const [otherUnit, setOtherUnit]   = useState('')
  const [location,  setLocation]    = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [note,      setNote]        = useState('')

  // GPS (optional, precise supplement to the named location)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState('')

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [error,       setError]     = useState('')
  const [totalCount,  setTotalCount] = useState<number | null>(null)
  const [queuedOffline, setQueuedOffline] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    fetch('/api/materials')
      .then(r => r.json())
      .then(j => {
        if (j.ok) setMaterials(j.data.map((m: any) => ({ id: m.id, name: m.name, categoryName: m.category?.name ?? '' })))
      })
      .catch(() => {})

    // Restore an in-progress draft (e.g. connection dropped or tab closed mid-form)
    const draft = loadDraft()
    if (draft) {
      setStep(draft.step)
      setMaterialId(draft.materialId)
      setMaterialLabel(draft.materialLabel)
      setOtherMaterial(draft.otherMaterial)
      setPrice(draft.price)
      setUnit(draft.unit)
      setOtherUnit(draft.otherUnit)
      setLocation(draft.location)
      setSupplierName(draft.supplierName)
      setNote(draft.note)
    } else {
      const stored = getUserLocation()
      if (stored) setLocation(stored)
    }
    setDraftRestored(true)
    setPendingCount(getQueue().length)
  }, [])

  // Persist the draft as the user progresses, so a dropped connection never loses their work.
  useEffect(() => {
    if (!draftRestored) return
    const draft: ReportDraft = {
      step, materialId, materialLabel, otherMaterial, price, unit, otherUnit, location, supplierName, note,
    }
    saveDraft(draft)
  }, [draftRestored, step, materialId, materialLabel, otherMaterial, price, unit, otherUnit, location, supplierName, note])

  // Try to flush any queued offline submissions once we have a token and whenever connectivity returns.
  useEffect(() => {
    if (!token) return
    const tryFlush = () => {
      flushQueue(token).then(() => setPendingCount(getQueue().length))
    }
    tryFlush()
    window.addEventListener('online', tryFlush)
    return () => window.removeEventListener('online', tryFlush)
  }, [token])

  const finalUnit = unit === 'Other' ? otherUnit : unit
  const finalMaterialLabel = materialId ? materialLabel : otherMaterial

  const shareLocation = () => {
    if (!navigator.geolocation) { setLocateError('Location is not supported on this device.'); return }
    setLocating(true)
    setLocateError('')
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false) },
      () => { setLocateError('Could not get your location — you can still pick a town below.'); setLocating(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const canProceed = (() => {
    switch (step) {
      case 1: return !!finalMaterialLabel.trim()
      case 2: return !!price && Number(price) > 0 && !!finalUnit.trim()
      case 3: return !!location
      case 4: return true // extra details are optional
      default: return true
    }
  })()

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS))
  const back = () => setStep(s => Math.max(s - 1, 1))

  const submit = async () => {
    setSubmitting(true)
    setError('')
    const payload = {
      materialId,
      materialLabel: finalMaterialLabel,
      price: Number(price),
      unit: finalUnit,
      location,
      lat: coords?.lat,
      lng: coords?.lng,
      supplierName: supplierName || undefined,
      photoNote: note || undefined,
    }
    try {
      const res = await fetch('/api/field-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error ?? 'Something went wrong. Please try again.'); return }
      setTotalCount(json.data.totalCount)
      clearDraft()
      setStep(TOTAL_STEPS + 1)
    } catch {
      // Network failure — likely offline. Queue it instead of losing the report.
      enqueue(payload)
      setPendingCount(getQueue().length)
      setQueuedOffline(true)
      clearDraft()
      setStep(TOTAL_STEPS + 1)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForAnother = () => {
    setMaterialId(null); setMaterialLabel(''); setOtherMaterial('')
    setPrice(''); setUnit(''); setOtherUnit('')
    setSupplierName(''); setNote(''); setError('')
    setCoords(null); setLocateError(''); setQueuedOffline(false)
    setStep(1)
  }

  const bigBtn = (selected: boolean) =>
    `flex items-center justify-center text-center gap-2 rounded-2xl border-2 px-4 py-5 text-base font-semibold transition-colors ${
      selected ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
    }`

  // Wait for auth state to load before deciding whether to show a login gate.
  if (!ready) return null

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <h1 className="text-2xl font-bold text-gray-900 font-display mb-2">{tr('report.title')}</h1>
        <p className="text-sm text-gray-500 mb-8">{tr('report.subtitle')}</p>
        <div className="card">
          <LogIn size={32} className="mx-auto text-primary-500 mb-3" />
          <h2 className="font-bold text-gray-900 mb-1">Sign in to report a price</h2>
          <p className="text-sm text-gray-500 mb-5">
            Reports are tied to your account so we know who to reward and can keep quality ratings — takes a minute to set up.
          </p>
          <div className="flex gap-2">
            <Link href="/login?redirect=/report" className="btn-secondary flex-1 justify-center py-3">Sign in</Link>
            <Link href="/register?redirect=/report" className="btn-primary flex-1 justify-center py-3">Create account</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-display">{tr('report.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{tr('report.subtitle')}</p>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-2 rounded-xl mb-4">
          <CloudOff size={14} />
          {pendingCount} report{pendingCount !== 1 ? 's' : ''} saved offline — will send automatically once you're back online.
        </div>
      )}

      {/* Progress dots */}
      {step <= TOTAL_STEPS && (
        <div className="flex justify-center gap-1.5 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i + 1 === step ? 'w-8 bg-primary-500' : i + 1 < step ? 'w-4 bg-primary-300' : 'w-4 bg-gray-200'}`} />
          ))}
        </div>
      )}

      <div className="card min-h-[320px] flex flex-col">
        {/* Step 1 — material */}
        {step === 1 && (
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
                      <img src={cm.image} srcSet={unsplashSrcSet(cm.image, IMG_WIDTHS.heroPanel)} sizes="56px"
                        alt="" className="w-full h-full object-cover" loading="lazy" />
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

        {/* Step 2 — price + unit */}
        {step === 2 && (
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

        {/* Step 3 — location */}
        {step === 3 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">{tr('report.step.location.title')}</h2>
            <div className="grid grid-cols-2 gap-3">
              {GAMBIA_LOCATIONS.map(loc => (
                <button key={loc} onClick={() => setLocation(loc)} className={bigBtn(location === loc)}>
                  <MapPin size={16} /> {loc}
                </button>
              ))}
            </div>
            <button
              onClick={shareLocation}
              disabled={locating}
              className="flex items-center justify-center gap-2 text-sm font-semibold text-primary-600 border border-primary-200 bg-primary-50 rounded-xl py-3 mt-1"
            >
              {locating ? <Loader2 size={15} className="animate-spin" /> : <Navigation size={15} />}
              {coords ? 'Exact location captured ✓' : 'Share my exact location (optional)'}
            </button>
            {locateError && <p className="text-xs text-red-500">{locateError}</p>}
          </div>
        )}

        {/* Step 4 — extra (optional) */}
        {step === 4 && (
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

        {/* Step 5 — review */}
        {step === 5 && (
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
                <span className="font-semibold text-gray-900">{location}{coords ? ' 📍' : ''}</span>
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
            {queuedOffline ? (
              <>
                <CloudOff size={48} className="text-amber-500" />
                <h2 className="text-xl font-bold text-gray-900">Saved — no connection right now</h2>
                <p className="text-sm text-gray-500">
                  Your report is saved on this device and will send automatically as soon as you're back online.
                </p>
              </>
            ) : (
              <>
                <CheckCircle2 size={48} className="text-emerald-500" />
                <h2 className="text-xl font-bold text-gray-900">{tr('report.thankyou.title')}</h2>
                {totalCount !== null && (
                  <p className="text-sm text-gray-500">
                    {tr('report.thankyou.prefix')} <span className="font-bold text-primary-600">{totalCount}</span> {tr('report.thankyou.suffix')}
                  </p>
                )}
              </>
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
