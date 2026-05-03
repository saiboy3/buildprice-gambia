'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { ShieldCheck, ShieldAlert, Clock, Upload, Loader2, CheckCircle, XCircle } from 'lucide-react'

type VerificationStatus = {
  status: 'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED'
  approvedAt?: string | null
  rejectionNote?: string | null
  docUrls: string[]
}

export default function SupplierVerificationPage() {
  const { isSupplier, token } = useAuth()
  const router = useRouter()

  const [verif,      setVerif]      = useState<VerificationStatus | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [docUrls,    setDocUrls]    = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg,        setMsg]        = useState('')

  useEffect(() => {
    if (!isSupplier) { router.push('/login'); return }
    fetch('/api/supplier/verification', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => { if (j.ok) setVerif(j.data) })
      .finally(() => setLoading(false))
  }, [isSupplier])

  const submit = async () => {
    const urls = docUrls.split(',').map(u => u.trim()).filter(Boolean)
    if (urls.length === 0) { setMsg('Please provide at least one document URL.'); return }
    setSubmitting(true); setMsg('')
    const res  = await fetch('/api/supplier/verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ docUrls: urls }),
    })
    const json = await res.json()
    if (json.ok) {
      setMsg('Verification submitted successfully. We will review your documents.')
      setVerif(json.data)
    } else {
      setMsg(json.error ?? 'Submission failed.')
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )

  const status = verif?.status ?? 'UNVERIFIED'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Supplier Verification</h1>

      {/* Status display */}
      {status === 'APPROVED' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 flex items-center gap-4">
          <ShieldCheck size={40} className="text-green-500 shrink-0" />
          <div>
            <h2 className="font-bold text-green-800 text-lg">Verified Supplier</h2>
            <p className="text-green-700 text-sm">Your account is verified and the verified badge is displayed on your profile.</p>
            {verif?.approvedAt && (
              <p className="text-green-600 text-xs mt-1">Approved on {new Date(verif.approvedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            )}
          </div>
        </div>
      )}

      {status === 'PENDING' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 flex items-center gap-4">
          <Clock size={40} className="text-amber-500 shrink-0" />
          <div>
            <h2 className="font-bold text-amber-800 text-lg">Under Review</h2>
            <p className="text-amber-700 text-sm">Your verification documents are being reviewed. This typically takes 1–3 business days.</p>
          </div>
        </div>
      )}

      {status === 'REJECTED' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <XCircle size={24} className="text-red-500 shrink-0" />
            <h2 className="font-bold text-red-800">Verification Rejected</h2>
          </div>
          {verif?.rejectionNote && (
            <p className="text-red-700 text-sm mb-3"><span className="font-semibold">Reason: </span>{verif.rejectionNote}</p>
          )}
          <p className="text-red-600 text-sm">You can resubmit with updated documents below.</p>
        </div>
      )}

      {/* Submission form */}
      {(status === 'UNVERIFIED' || status === 'REJECTED') && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Upload size={18} className="text-primary-500" />
            <h2 className="font-bold text-gray-900">Submit Verification Documents</h2>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-700 mb-2">What documents can you provide?</p>
            <ul className="space-y-1 text-sm">
              <li>• Business registration certificate</li>
              <li>• National ID or passport of owner</li>
              <li>• Proof of business address (utility bill, lease agreement)</li>
              <li>• Photos of your store/warehouse</li>
            </ul>
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Document URLs (comma-separated)</label>
            <textarea className="input w-full min-h-[80px] resize-y"
              placeholder="https://drive.google.com/file/…, https://…"
              value={docUrls}
              onChange={e => setDocUrls(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Upload documents to Google Drive, Dropbox, or similar and paste the shareable links here.</p>
          </div>

          {msg && (
            <p className={`text-sm px-3 py-2 rounded mb-3 ${msg.includes('success') ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
              {msg}
            </p>
          )}

          <button onClick={submit} disabled={submitting} className="btn-primary">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Submit for Verification
          </button>
        </div>
      )}

      {/* Already-submitted docs */}
      {verif?.docUrls && verif.docUrls.length > 0 && status !== 'APPROVED' && (
        <div className="card mt-5">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Documents on File</h3>
          <ul className="space-y-1.5">
            {verif.docUrls.map((url, i) => (
              <li key={i}>
                <a href={url} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:underline break-all">
                  Document {i + 1}: {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
