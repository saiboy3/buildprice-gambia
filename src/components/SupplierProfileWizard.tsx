'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context'
import { GAMBIA_LOCATIONS } from '@/lib/location'
import { CheckCircle2, ChevronLeft, Loader2, LogIn, MapPin, Pencil, Store } from 'lucide-react'

const TOTAL_STEPS = 3

export default function SupplierProfileWizard() {
  const { user, token, ready } = useAuth()
  const router = useRouter()

  const [loadingProfile, setLoadingProfile] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [step, setStep] = useState(1)

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [contact, setContact] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!ready || !token) { if (ready) setLoadingProfile(false); return }
    fetch('/api/supplier/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => {
        if (j.ok && j.data) {
          setIsEditing(true)
          setName(j.data.name)
          setLocation(j.data.location)
          setContact(j.data.contact)
        }
      })
      .finally(() => setLoadingProfile(false))
  }, [ready, token])

  const canProceed = (() => {
    switch (step) {
      case 1: return !!name.trim()
      case 2: return !!location
      case 3: return !!contact.trim()
      default: return true
    }
  })()

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS + 1))
  const back = () => setStep(s => Math.max(s - 1, 1))
  const editStep = (s: number) => setStep(s)

  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/supplier/profile', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), location, contact: contact.trim() }),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error ?? 'Something went wrong. Please try again.'); return }
      setDone(true)
    } catch {
      setError('Could not save — check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const bigBtn = (selected: boolean) =>
    `flex items-center justify-center text-center gap-2 rounded-2xl border-2 px-4 py-5 text-base font-semibold transition-colors ${
      selected ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
    }`

  if (!ready || loadingProfile) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="card">
          <LogIn size={32} className="mx-auto text-primary-500 mb-3" />
          <h2 className="font-bold text-gray-900 mb-1">Sign in to set up your business profile</h2>
          <p className="text-sm text-gray-500 mb-5">Takes a minute — you'll be back here right after.</p>
          <div className="flex gap-2">
            <Link href="/login?redirect=/supplier/profile" className="btn-secondary flex-1 justify-center py-3">Sign in</Link>
            <Link href="/register?redirect=/supplier/profile" className="btn-primary flex-1 justify-center py-3">Create account</Link>
          </div>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="card">
          <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">Profile saved!</h2>
          <p className="text-sm text-gray-500 mb-5">
            {isEditing ? 'Your changes are live.' : 'Your business is now listed — you can start adding prices.'}
          </p>
          <button onClick={() => router.push('/supplier/dashboard')} className="btn-primary w-full justify-center py-3">
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <Store size={28} className="mx-auto text-primary-500 mb-2" />
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          {isEditing ? 'Edit Your Business Profile' : 'Set Up Your Business Profile'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">A few quick questions — takes about a minute.</p>
      </div>

      {step <= TOTAL_STEPS && (
        <div className="flex justify-center gap-1.5 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i + 1 === step ? 'w-8 bg-primary-500' : i + 1 < step ? 'w-4 bg-primary-300' : 'w-4 bg-gray-200'}`} />
          ))}
        </div>
      )}

      <div className="card min-h-[280px] flex flex-col">
        {step === 1 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">What's your business called?</h2>
            <input
              type="text"
              className="input py-4 text-lg"
              placeholder="e.g. Banjul Building Supplies"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">Where is your business located?</h2>
            <div className="grid grid-cols-2 gap-3">
              {GAMBIA_LOCATIONS.map(loc => (
                <button key={loc} onClick={() => setLocation(loc)} className={bigBtn(location === loc)}>
                  <MapPin size={16} /> {loc}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">What number should buyers call?</h2>
            <input
              type="tel"
              inputMode="tel"
              className="input py-4 text-lg text-center"
              placeholder="+220 XXX XXXX"
              value={contact}
              onChange={e => setContact(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {step === TOTAL_STEPS + 1 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">Check your details</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Business name', value: name, jump: 1 },
                { label: 'Location', value: location, jump: 2 },
                { label: 'Contact number', value: contact, jump: 3 },
              ].map(f => (
                <div key={f.label} className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div>
                    <p className="text-gray-500 text-xs">{f.label}</p>
                    <p className="font-semibold text-gray-900">{f.value || '—'}</p>
                  </div>
                  <button onClick={() => editStep(f.jump)} className="flex items-center gap-1 text-xs text-primary-600 hover:underline shrink-0">
                    <Pencil size={12} /> Edit
                  </button>
                </div>
              ))}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-5">
        {step > 1 && (
          <button onClick={back} className="btn-secondary py-3 px-5">
            <ChevronLeft size={16} /> Back
          </button>
        )}
        {step <= TOTAL_STEPS ? (
          <button onClick={next} disabled={!canProceed} className="btn-primary flex-1 justify-center py-3 text-base">
            Next
          </button>
        ) : (
          <button onClick={submit} disabled={submitting} className="btn-primary flex-1 justify-center py-3 text-base">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Save Profile'}
          </button>
        )}
      </div>
      {step <= TOTAL_STEPS && error && <p className="text-sm text-red-500 mt-3 text-center">{error}</p>}
    </div>
  )
}
