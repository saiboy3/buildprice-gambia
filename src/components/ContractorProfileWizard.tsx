'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context'
import { GAMBIA_LOCATIONS } from '@/lib/location'
import { SPECIALTY_META, unsplashSrcSet, IMG_WIDTHS } from '@/lib/visual'
import { CheckCircle2, ChevronLeft, Loader2, LogIn, MapPin, Pencil, HardHat, Minus, Plus } from 'lucide-react'

const SPECIALTIES = Object.keys(SPECIALTY_META)
const TOTAL_STEPS = 6

export default function ContractorProfileWizard() {
  const { user, token, ready } = useAuth()
  const router = useRouter()

  const [loadingProfile, setLoadingProfile] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [step, setStep] = useState(1)

  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [location, setLocation] = useState('')
  const [contact, setContact] = useState('')
  const [yearsExp, setYearsExp] = useState(0)
  const [bio, setBio] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!ready || !token) { if (ready) setLoadingProfile(false); return }
    fetch('/api/contractor/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => {
        if (j.ok && j.data) {
          setIsEditing(true)
          setName(j.data.name)
          setSpecialty(j.data.specialty)
          setLocation(j.data.location)
          setContact(j.data.contact)
          setYearsExp(j.data.yearsExp)
          setBio(j.data.bio ?? '')
        }
      })
      .finally(() => setLoadingProfile(false))
  }, [ready, token])

  const canProceed = (() => {
    switch (step) {
      case 1: return !!name.trim()
      case 2: return !!specialty
      case 3: return !!location
      case 4: return !!contact.trim()
      case 5: return true // years experience always has a value (0+)
      case 6: return true // bio optional
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
      const payload = { name: name.trim(), specialty, location, contact: contact.trim(), yearsExp, bio: bio.trim() }
      const res = await fetch(isEditing ? '/api/contractor/profile' : '/api/contractors', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.message ?? json.error ?? 'Something went wrong. Please try again.'); return }
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
          <h2 className="font-bold text-gray-900 mb-1">Sign in to set up your contractor profile</h2>
          <p className="text-sm text-gray-500 mb-5">Takes a couple of minutes — you'll be back here right after.</p>
          <div className="flex gap-2">
            <Link href="/login?redirect=/contractors/register" className="btn-secondary flex-1 justify-center py-3">Sign in</Link>
            <Link href="/register?redirect=/contractors/register" className="btn-primary flex-1 justify-center py-3">Create account</Link>
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
            {isEditing ? 'Your changes are live.' : 'Your profile is now listed — clients can find and contact you.'}
          </p>
          <button onClick={() => router.push('/contractor/dashboard')} className="btn-primary w-full justify-center py-3">
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <HardHat size={28} className="mx-auto text-primary-500 mb-2" />
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          {isEditing ? 'Edit Your Contractor Profile' : 'Set Up Your Contractor Profile'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">A few quick questions — takes about two minutes.</p>
      </div>

      {step <= TOTAL_STEPS && (
        <div className="flex justify-center gap-1.5 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i + 1 === step ? 'w-8 bg-primary-500' : i + 1 < step ? 'w-4 bg-primary-300' : 'w-4 bg-gray-200'}`} />
          ))}
        </div>
      )}

      <div className="card min-h-[300px] flex flex-col">
        {step === 1 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">What's your name or business called?</h2>
            <input
              type="text"
              className="input py-4 text-lg"
              placeholder="e.g. Omar Jallow Construction"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">What kind of work do you do?</h2>
            <div className="grid grid-cols-2 gap-3">
              {SPECIALTIES.map(s => {
                const meta = SPECIALTY_META[s]
                const selected = specialty === s
                return (
                  <button
                    key={s}
                    onClick={() => setSpecialty(s)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-colors ${selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img src={meta.image} srcSet={unsplashSrcSet(meta.image, IMG_WIDTHS.avatarCircle)} sizes="48px"
                        alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{s}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">Where do you work?</h2>
            <div className="grid grid-cols-2 gap-3">
              {GAMBIA_LOCATIONS.map(loc => (
                <button key={loc} onClick={() => setLocation(loc)} className={bigBtn(location === loc)}>
                  <MapPin size={16} /> {loc}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">What number should clients call?</h2>
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

        {step === 5 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">How many years have you been working?</h2>
            <div className="flex items-center justify-center gap-6 py-6">
              <button
                onClick={() => setYearsExp(y => Math.max(0, y - 1))}
                className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary-300"
              >
                <Minus size={20} />
              </button>
              <span className="text-4xl font-extrabold text-primary-600 w-20 text-center">{yearsExp}</span>
              <button
                onClick={() => setYearsExp(y => Math.min(60, y + 1))}
                className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary-300"
              >
                <Plus size={20} />
              </button>
            </div>
            <p className="text-center text-sm text-gray-400">years of experience</p>
          </div>
        )}

        {step === 6 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">Tell clients about your work</h2>
            <p className="text-sm text-gray-500 -mt-2">Optional — a short description helps clients trust you.</p>
            <textarea
              className="input py-3 min-h-[120px] resize-none"
              placeholder="e.g. Over 10 years building homes across Greater Banjul, specialising in..."
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>
        )}

        {step === TOTAL_STEPS + 1 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">Check your details</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Name', value: name, jump: 1 },
                { label: 'Specialty', value: specialty, jump: 2 },
                { label: 'Location', value: location, jump: 3 },
                { label: 'Contact number', value: contact, jump: 4 },
                { label: 'Years of experience', value: String(yearsExp), jump: 5 },
                { label: 'Bio', value: bio || '(none)', jump: 6 },
              ].map(f => (
                <div key={f.label} className="flex items-center justify-between border-b border-gray-100 pb-2 gap-3">
                  <div className="min-w-0">
                    <p className="text-gray-500 text-xs">{f.label}</p>
                    <p className="font-semibold text-gray-900 truncate">{f.value || '—'}</p>
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
