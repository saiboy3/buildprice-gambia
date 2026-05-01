'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context'
import Link from 'next/link'
import { HardHat, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const { login } = useAuth()
  const router    = useRouter()
  const [name,     setName]     = useState('')
  const [phone,    setPhone]    = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [role,     setRole]     = useState('USER')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password, role }),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error); return }

      login(json.data.token, json.data.user)
      router.push(role === 'SUPPLIER' ? '/supplier/dashboard' : '/')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-extrabold text-primary-600 mb-2">
            <HardHat size={28} /> BuildPriceGambia
          </div>
          <p className="text-gray-500 text-sm">Create your account</p>
        </div>

        <div className="card">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Full name</label>
              <input type="text" className="input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Phone number</label>
              <input type="tel" className="input" placeholder="e.g. 2201234567" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email (optional)</label>
              <input type="email" className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
              <input type="password" className="input" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">I am a…</label>
              <select className="input" value={role} onChange={e => setRole(e.target.value)}>
                <option value="USER">Contractor / Homebuilder</option>
                <option value="SUPPLIER">Supplier / Vendor</option>
              </select>
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
