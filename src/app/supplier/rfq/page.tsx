'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, FileText, Clock, Send, X } from 'lucide-react'

type BOQItem  = { material: string; qty: number; unit: string }
type OpenRFQ  = {
  id: string; title: string; location: string; deadline: string | null
  createdAt: string; boqJson: string; _count?: { quotes: number }
  user?: { name: string }
}

export default function SupplierRFQPage() {
  const { user, token, isSupplier } = useAuth()
  const router = useRouter()

  const [rfqs,       setRfqs]       = useState<OpenRFQ[]>([])
  const [loading,    setLoading]    = useState(true)
  const [modalRFQ,   setModalRFQ]   = useState<OpenRFQ | null>(null)
  const [quotePrice, setQuotePrice] = useState('')
  const [quoteMsg,   setQuoteMsg]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg,  setSubmitMsg]  = useState('')

  useEffect(() => {
    if (!isSupplier) { router.push('/login'); return }
    fetch('/api/rfq?open=true', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => { if (j.ok) setRfqs(j.data) })
      .finally(() => setLoading(false))
  }, [isSupplier])

  const openModal = (rfq: OpenRFQ) => {
    setModalRFQ(rfq); setQuotePrice(''); setQuoteMsg(''); setSubmitMsg('')
  }

  const submitQuote = async () => {
    if (!quotePrice || !modalRFQ) { setSubmitMsg('Enter a price.'); return }
    setSubmitting(true); setSubmitMsg('')
    const res  = await fetch(`/api/rfq/${modalRFQ.id}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ totalPrice: parseFloat(quotePrice), message: quoteMsg }),
    })
    const json = await res.json()
    if (json.ok) {
      setSubmitMsg('Quote submitted successfully!')
      setModalRFQ(null)
    } else {
      setSubmitMsg(json.error ?? 'Failed to submit.')
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Open RFQs</h1>
      <p className="text-sm text-gray-400 mb-6">Browse open requests for quotation and submit competitive bids.</p>

      {rfqs.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 text-gray-300" />
          <p>No open RFQs at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rfqs.map(rfq => {
            const boq: BOQItem[] = (() => { try { return JSON.parse(rfq.boqJson) } catch { return [] } })()
            return (
              <div key={rfq.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-900 mb-1">{rfq.title}</h2>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                      {rfq.location && <span>{rfq.location}</span>}
                      {rfq.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> Deadline: {new Date(rfq.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      <span>{rfq._count?.quotes ?? 0} quote{rfq._count?.quotes !== 1 ? 's' : ''} submitted</span>
                    </div>

                    {/* BOQ preview */}
                    {boq.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {boq.slice(0, 5).map((item, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {item.qty} {item.unit} {item.material}
                          </span>
                        ))}
                        {boq.length > 5 && (
                          <span className="text-xs text-gray-400">+{boq.length - 5} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/rfq/${rfq.id}`} className="btn-secondary text-sm">View details</Link>
                    <button onClick={() => openModal(rfq)} className="btn-primary text-sm">
                      <Send size={13} /> Quote
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick quote modal */}
      {modalRFQ && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Submit Quote</h2>
              <button onClick={() => setModalRFQ(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <p className="text-sm text-gray-600 font-medium">{modalRFQ.title}</p>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Total Price (D) *</label>
                <input type="number" className="input w-full" placeholder="e.g. 125000" min={0}
                  value={quotePrice} onChange={e => setQuotePrice(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Message (optional)</label>
                <textarea className="input w-full min-h-[70px] resize-y" placeholder="Delivery terms, availability, notes…"
                  value={quoteMsg} onChange={e => setQuoteMsg(e.target.value)} />
              </div>
              {submitMsg && (
                <p className={`text-sm px-3 py-2 rounded ${submitMsg.includes('success') ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                  {submitMsg}
                </p>
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
              <button onClick={submitQuote} disabled={submitting} className="btn-primary flex-1">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {submitting ? 'Submitting…' : 'Submit Quote'}
              </button>
              <button onClick={() => setModalRFQ(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
