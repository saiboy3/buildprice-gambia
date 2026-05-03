'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/context'
import Link from 'next/link'
import { ChevronLeft, Loader2, CheckCircle, XCircle, Send, Package } from 'lucide-react'
import clsx from 'clsx'

type BOQItem = { material: string; qty: number; unit: string }
type Quote = {
  id: string; totalPrice: number; message: string; status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string; supplier: { id: string; name: string; location: string }
}
type RFQDetail = {
  id: string; title: string; location: string; deadline: string | null
  status: 'OPEN' | 'CLOSED' | 'AWARDED'; boqJson: string
  createdAt: string; userId: string
  quotes: Quote[]
}

export default function RFQDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, token } = useAuth()

  const [rfq,         setRfq]         = useState<RFQDetail | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [quotePrice,  setQuotePrice]  = useState('')
  const [quoteMsg,    setQuoteMsg]    = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [submitMsg,   setSubmitMsg]   = useState('')
  const [actioning,   setActioning]   = useState<string | null>(null)

  const load = () => {
    fetch(`/api/rfq/${id}`, { headers: { Authorization: `Bearer ${token ?? ''}` } })
      .then(r => r.json())
      .then(j => { if (j.ok) setRfq(j.data) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [id])

  const isOwner    = user && rfq && user.id === rfq.userId
  const isSupplier = user?.role === 'SUPPLIER' || user?.role === 'ADMIN'
  const boqItems: BOQItem[] = rfq?.boqJson ? (() => { try { return JSON.parse(rfq.boqJson) } catch { return [] } })() : []

  const submitQuote = async () => {
    if (!quotePrice) { setSubmitMsg('Enter a total price.'); return }
    setSubmitting(true); setSubmitMsg('')
    const res  = await fetch(`/api/rfq/${id}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ totalPrice: parseFloat(quotePrice), message: quoteMsg }),
    })
    const json = await res.json()
    if (json.ok) { setSubmitMsg('Quote submitted!'); setQuotePrice(''); setQuoteMsg(''); load() }
    else setSubmitMsg(json.error ?? 'Failed to submit quote.')
    setSubmitting(false)
  }

  const actOnQuote = async (quoteId: string, action: 'ACCEPTED' | 'REJECTED') => {
    setActioning(quoteId)
    await fetch(`/api/rfq/${id}/quotes?quoteId=${quoteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: action }),
    })
    setActioning(null)
    load()
  }

  const closeRFQ = async () => {
    if (!confirm('Close this RFQ? No more quotes will be accepted.')) return
    await fetch(`/api/rfq/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'CLOSED' }),
    })
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )
  if (!rfq) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">RFQ not found.</div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/rfq" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft size={16} /> All RFQs
      </Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{rfq.title}</h1>
              <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full',
                rfq.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                rfq.status === 'AWARDED' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-500')}>
                {rfq.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
              {rfq.location && <span>{rfq.location}</span>}
              {rfq.deadline && <span>Deadline: {new Date(rfq.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
              <span>Posted {new Date(rfq.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {isOwner && rfq.status === 'OPEN' && (
            <button onClick={closeRFQ} className="btn-secondary text-sm">
              <XCircle size={14} /> Close RFQ
            </button>
          )}
        </div>

        {/* BOQ */}
        {boqItems.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <Package size={14} /> Bill of Quantities
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-3 py-2">Material</th>
                    <th className="text-right px-3 py-2">Qty</th>
                    <th className="text-left px-3 py-2">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {boqItems.map((item, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-medium text-gray-800">{item.material}</td>
                      <td className="px-3 py-2 text-right">{item.qty}</td>
                      <td className="px-3 py-2 text-gray-500">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Quotes */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Quotes ({rfq.quotes.length})</h2>
        {rfq.quotes.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No quotes received yet.</p>
        ) : (
          <div className="space-y-3">
            {rfq.quotes.map(q => (
              <div key={q.id} className={clsx('border rounded-xl p-4', q.status === 'ACCEPTED' ? 'border-green-200 bg-green-50' : 'border-gray-100')}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Link href={`/suppliers/${q.supplier.id}`} className="font-semibold text-gray-900 hover:text-primary-600">{q.supplier.name}</Link>
                      <span className={clsx('text-xs font-semibold px-1.5 py-0.5 rounded',
                        q.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                        q.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600')}>
                        {q.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{q.supplier.location} · {new Date(q.createdAt).toLocaleDateString()}</p>
                    {q.message && <p className="text-sm text-gray-600 mt-1">{q.message}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-gray-900">D{q.totalPrice.toLocaleString()}</p>
                    {isOwner && rfq.status === 'OPEN' && q.status === 'PENDING' && (
                      <div className="flex gap-1 mt-1 justify-end">
                        <button onClick={() => actOnQuote(q.id, 'ACCEPTED')} disabled={actioning === q.id}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-lg flex items-center gap-1">
                          <CheckCircle size={11} /> Accept
                        </button>
                        <button onClick={() => actOnQuote(q.id, 'REJECTED')} disabled={actioning === q.id}
                          className="text-xs bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 px-2 py-1 rounded-lg flex items-center gap-1">
                          <XCircle size={11} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit quote form (supplier) */}
      {isSupplier && rfq.status === 'OPEN' && !isOwner && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Submit a Quote</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Total Price (D) *</label>
              <input type="number" className="input w-full max-w-xs" placeholder="e.g. 250000" min={0}
                value={quotePrice} onChange={e => setQuotePrice(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Message</label>
              <textarea className="input w-full min-h-[70px] resize-y" placeholder="Describe what's included, delivery terms, etc."
                value={quoteMsg} onChange={e => setQuoteMsg(e.target.value)} />
            </div>
            {submitMsg && (
              <p className={clsx('text-sm px-3 py-2 rounded', submitMsg.includes('!') ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50')}>
                {submitMsg}
              </p>
            )}
            <button onClick={submitQuote} disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Submit Quote
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
