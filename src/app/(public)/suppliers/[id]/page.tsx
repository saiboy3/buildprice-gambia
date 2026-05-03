'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/context'
import Link from 'next/link'
import {
  MapPin, Phone, CheckCircle, Eye, Package, Star, Send, Trash2, Loader2, ShieldCheck,
} from 'lucide-react'
import clsx from 'clsx'

type Review = {
  id: string; rating: number; comment: string; createdAt: string
  user: { name: string }
}
type Price = {
  id: string; price: number; unit: string; stockStatus: string; updatedAt: string
  material: { id: string; name: string; category: { name: string } }
}
type Supplier = {
  id: string; name: string; location: string; contact: string
  verified: boolean; views: number; avgRating: number; reviewCount: number
  prices: Price[]
}

function Stars({ rating, interactive, onSet, size = 16 }: {
  rating: number; interactive?: boolean; onSet?: (n: number) => void; size?: number
}) {
  const [hover, setHover] = useState(0)
  const display = interactive ? (hover || rating) : rating
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={size}
          className={clsx(
            display >= n ? 'text-amber-400 fill-amber-400' : 'text-gray-300',
            interactive && 'cursor-pointer hover:scale-110 transition-transform'
          )}
          onMouseEnter={interactive ? () => setHover(n) : undefined}
          onMouseLeave={interactive ? () => setHover(0) : undefined}
          onClick={interactive && onSet ? () => onSet(n) : undefined}
        />
      ))}
    </span>
  )
}

export default function SupplierProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user, token } = useAuth()

  const [supplier,    setSupplier]    = useState<Supplier | null>(null)
  const [reviews,     setReviews]     = useState<Review[]>([])
  const [loading,     setLoading]     = useState(true)
  const [myRating,    setMyRating]    = useState(0)
  const [comment,     setComment]     = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [submitMsg,   setSubmitMsg]   = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch(`/api/suppliers/${id}`).then(r => r.json()),
      fetch(`/api/suppliers/${id}/reviews`).then(r => r.json()),
    ]).then(([suppJson, revJson]) => {
      if (suppJson.ok) setSupplier(suppJson.data)
      if (revJson.ok)  setReviews(revJson.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleSubmitReview = async () => {
    if (!myRating) { setSubmitMsg('Please select a star rating.'); return }
    setSubmitting(true); setSubmitMsg('')
    const res  = await fetch(`/api/suppliers/${id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ rating: myRating, comment }),
    })
    const json = await res.json()
    if (!json.ok) { setSubmitMsg(json.message ?? 'Could not submit review.'); setSubmitting(false); return }
    setSubmitMsg('Review submitted — thank you!')
    setMyRating(0); setComment(''); load()
    setSubmitting(false)
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Remove your review?')) return
    await fetch(`/api/suppliers/${id}/reviews?reviewId=${reviewId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    })
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )
  if (!supplier) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">Supplier not found.</div>
  )

  const categories = [...new Set(supplier.prices.map(p => p.material.category.name))]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
              {supplier.verified && (
                <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  <ShieldCheck size={12} /> Verified
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
              <span className="flex items-center gap-1.5"><MapPin size={14} />{supplier.location}</span>
              <a href={`tel:${supplier.contact}`} className="flex items-center gap-1.5 text-primary-600 hover:underline">
                <Phone size={14} />{supplier.contact}
              </a>
              <span className="flex items-center gap-1.5"><Eye size={14} />{supplier.views.toLocaleString()} views</span>
              <span className="flex items-center gap-1.5"><Package size={14} />{supplier.prices.length} materials</span>
              {supplier.avgRating > 0 && (
                <span className="flex items-center gap-1.5">
                  <Stars rating={supplier.avgRating} size={13} />
                  <span className="font-semibold">{supplier.avgRating.toFixed(1)}</span>
                  <span className="text-gray-400">({supplier.reviewCount})</span>
                </span>
              )}
            </div>
          </div>
          <a href={`tel:${supplier.contact}`} className="btn-primary shrink-0">
            <Phone size={15} /> Call Supplier
          </a>
        </div>
      </div>

      {/* Price list grouped by category */}
      {categories.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No prices listed yet.</p>
      ) : (
        categories.map(cat => {
          const catPrices = supplier.prices.filter(p => p.material.category.name === cat)
          return (
            <section key={cat} className="mb-8">
              <h2 className="text-base font-semibold text-gray-700 mb-3">{cat}</h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-2.5">Material</th>
                      <th className="text-right px-4 py-2.5">Price</th>
                      <th className="text-center px-4 py-2.5">Stock</th>
                      <th className="text-left px-4 py-2.5">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {catPrices.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          <Link href={`/search?q=${encodeURIComponent(p.material.name)}`} className="hover:text-primary-600">
                            {p.material.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          D{p.price.toLocaleString()} <span className="font-normal text-gray-400 text-xs">/{p.unit}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            p.stockStatus === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                            p.stockStatus === 'LIMITED'   ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                          }`}>
                            {p.stockStatus === 'AVAILABLE' ? 'In stock' : p.stockStatus === 'LIMITED' ? 'Limited' : 'Out of stock'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{new Date(p.updatedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )
        })
      )}

      {/* Reviews section */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="card p-5 flex flex-col items-center justify-center text-center">
          <p className="text-5xl font-extrabold text-gray-900 mb-1">
            {supplier.avgRating > 0 ? supplier.avgRating.toFixed(1) : '—'}
          </p>
          <Stars rating={supplier.avgRating} size={20} />
          <p className="text-sm text-gray-400 mt-2">
            {supplier.reviewCount > 0
              ? `Based on ${supplier.reviewCount} review${supplier.reviewCount > 1 ? 's' : ''}`
              : 'No reviews yet'}
          </p>
        </div>
        <div className="card p-5 flex flex-col gap-2 justify-center">
          {[5, 4, 3, 2, 1].map(n => {
            const count = reviews.filter(r => r.rating === n).length
            const pct   = reviews.length > 0 ? (count / reviews.length) * 100 : 0
            return (
              <div key={n} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-right text-gray-500">{n}★</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-gray-400">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review list */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Reviews {reviews.length > 0 && <span className="text-gray-400 font-normal">({reviews.length})</span>}
      </h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-400 mb-8">No reviews yet — be the first!</p>
      ) : (
        <div className="space-y-4 mb-8">
          {reviews.map(r => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-semibold text-gray-900 text-sm">{r.user.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <Stars rating={r.rating} size={13} />
                  {user && r.user.name === user.name && (
                    <button onClick={() => handleDeleteReview(r.id)} title="Remove your review"
                      className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Leave a review */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-4">Leave a Review</h3>
        {!user ? (
          <p className="text-sm text-gray-500">
            <Link href="/login" className="text-primary-600 hover:underline font-medium">Sign in</Link> to leave a review.
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Your rating *</label>
              <Stars rating={myRating} interactive onSet={setMyRating} size={24} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Comment</label>
              <textarea className="input w-full min-h-[90px] resize-y" placeholder="Describe your experience with this supplier…"
                value={comment} onChange={e => setComment(e.target.value)} />
            </div>
            {submitMsg && (
              <p className={clsx('text-sm px-3 py-2 rounded', submitMsg.includes('thank') ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50')}>
                {submitMsg}
              </p>
            )}
            <button onClick={handleSubmitReview} disabled={submitting} className="btn-primary px-5 py-2">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Submit Review
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
