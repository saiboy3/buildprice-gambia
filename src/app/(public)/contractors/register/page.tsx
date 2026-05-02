'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HardHat, Loader2, ShieldCheck } from 'lucide-react'

const SPECIALTIES = [
  'General Contractor', 'Masonry & Blockwork', 'Roofing',
  'Plumbing', 'Electrical', 'Carpentry & Joinery', 'Tiling & Finishing', 'Painting',
]

export default function ContractorRegisterPage() {
  const { user, token } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({
    name: user?.name ?? '', specialty: SPECIALTIES[0], location: '',
    contact: '', bio: '', yearsExp: 0,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  const set = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { router.push('/login'); return }
    setSubmitting(true); setError('')
    try {
      const res  = await fetch('/api/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.message ?? 'Registration failed. Please try again.'); return }
      router.push(`/contractors/${json.data.id}`)
    } finally { setSubmitting(false) }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <HardHat size={36} className="mx-auto text-primary-500 mb-3" />
        <h1 className="text-2xl font-extrabold text-gray-900">Register as a Contractor</h1>
        <p className="text-gray-500 text-sm mt-2">
          Create your public profile to receive enquiries from clients.
          Verified contractors get a badge after admin review.
        </p>
      </div>

      {!user ? (
        <div className="card text-center py-8">
          <p className="text-gray-600 mb-4">You need to be signed in to register.</p>
          <Link href="/login" className="btn-primary px-5 py-2">Sign in</Link>
          <p className="text-sm text-gray-400 mt-3">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary-600 hover:underline">Register</Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-5 p-6">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-sm text-emerald-800">
            <ShieldCheck size={16} className="shrink-0 mt-0.5" />
            <span>Your profile will be reviewed by our team. Verification badge is added once approved.</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Business / Trading name *</label>
            <input required className="input w-full" placeholder="e.g. Jallow Construction Ltd"
              value={form.name} onChange={e => set('name', e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Primary specialty *</label>
            <select required className="input w-full" value={form.specialty} onChange={e => set('specialty', e.target.value)}>
              {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Location *</label>
              <input required className="input w-full" placeholder="e.g. Serrekunda"
                value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Contact number *</label>
              <input required className="input w-full" placeholder="+220 XXX XXXX"
                value={form.contact} onChange={e => set('contact', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Years of experience</label>
            <input type="number" className="input w-full" min={0} max={60}
              value={form.yearsExp} onChange={e => set('yearsExp', +e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Bio / About your work</label>
            <textarea className="input w-full min-h-[100px] resize-y"
              placeholder="Describe your experience, type of projects you take on, areas covered…"
              value={form.bio} onChange={e => set('bio', e.target.value)} />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <HardHat size={16} />}
            Submit Profile
          </button>

          <p className="text-xs text-gray-400 text-center">
            By submitting you agree that your name, specialty, location and contact will be publicly listed.
          </p>
        </form>
      )}
    </div>
  )
}
