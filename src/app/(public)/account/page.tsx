'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Download, Trash2, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react'

export default function AccountPage() {
  const { user, token, logout, ready } = useAuth()
  const router = useRouter()

  const [exporting,  setExporting]  = useState(false)
  const [confirming,  setConfirming]  = useState(false)
  const [password,    setPassword]    = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting,    setDeleting]    = useState(false)

  if (ready && !user) {
    router.push('/login?redirect=/account')
    return null
  }
  if (!ready || !user) {
    return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  }

  const downloadData = async () => {
    setExporting(true)
    try {
      const res  = await fetch('/api/account/export', { headers: { Authorization: `Bearer ${token}` } })
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = 'buildpricegambia-data-export.json'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const confirmDeleteAccount = async () => {
    setDeleteError('')
    if (!password) { setDeleteError('Enter your password to confirm'); return }
    setDeleting(true)
    try {
      const res  = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password }),
      })
      const json = await res.json()
      if (!json.ok) { setDeleteError(json.error ?? 'Failed to delete account'); return }
      logout()
      router.push('/')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Account & Privacy</h1>
      <p className="text-sm text-gray-500 mb-8">
        Manage your data under our <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
      </p>

      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-1">Account details</h2>
        <p className="text-sm text-gray-500">{user.name} · {user.phone} · {user.role}</p>
      </div>

      <div className="card mb-6">
        <div className="flex items-start gap-3">
          <Download size={20} className="text-primary-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 mb-1">Download your data</h2>
            <p className="text-sm text-gray-500 mb-3">
              Get a copy of everything we hold about your account — profile, listings, reports, reviews, and more — as a JSON file.
            </p>
            <button onClick={downloadData} disabled={exporting} className="btn-secondary">
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Download my data
            </button>
          </div>
        </div>
      </div>

      <div className="card border-red-200">
        <div className="flex items-start gap-3">
          <Trash2 size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 mb-1">Delete your account</h2>
            <p className="text-sm text-gray-500 mb-3">
              Permanently deletes your login, along with any supplier or field-reporter profile tied to it.
              A linked contractor listing stays live but loses its owner. This can't be undone.
            </p>
            <button onClick={() => { setConfirming(true); setPassword(''); setDeleteError('') }} className="btn-secondary border-red-200 text-red-600 hover:bg-red-50">
              <Trash2 size={14} /> Delete my account
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6 flex items-center gap-1.5">
        <ShieldCheck size={13} /> Requests are handled under GDPR Articles 15 (access) and 17 (erasure).
      </p>

      {confirming && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card max-w-sm w-full">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-red-500" />
              <h3 className="font-bold text-gray-900">Confirm account deletion</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Enter your password to permanently delete your account.</p>
            <input
              type="password"
              className="input mb-3"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmDeleteAccount()}
            />
            {deleteError && <p className="text-sm text-red-500 mb-3">{deleteError}</p>}
            <div className="flex gap-2">
              <button onClick={confirmDeleteAccount} disabled={deleting} className="btn-primary bg-red-600 hover:bg-red-700 border-red-600">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete my account
              </button>
              <button onClick={() => setConfirming(false)} disabled={deleting} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
