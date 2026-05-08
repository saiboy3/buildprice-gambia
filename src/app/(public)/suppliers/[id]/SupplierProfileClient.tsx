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

export default function SupplierProfileClient() {
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
    <div>
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-gray-900 text-white px-4 py-10 mb-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-extrabold">{supplier.name}</h1>
                {supplier.verified && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-300 bg-green-900/50 border border-green-600 px-2 py-0.5 rounded-full">
                    <ShieldCheck size={12} /> Verified
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-primary-200 mt-1">
                <span className="flex items-center gap-1.5"><MapPin size={14} />{supplier.location}</span>
                <a href={`tel:${supplier.contact}`} className="flex items-center gap-1.5 hover:text-white">
                  <Phone size={14} />{supplier.contact}
                </a>
                <span className="flex items-center gap-1.5"><Eye size={14} />{supplier.views.toLocaleString()} views</span>
                <span className="flex items-center gap-1.5"><Package size={14} />{supplier.prices.length} materials</span>
                {supplier.avgRating > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Stars rating={supplier.avgRating} size={13} />
                    <span className="font-semibold text-white">{supplier.avgRating.toFixed(1)}</span>
                    <span className="text-primary-300">({supplier.reviewCount})</span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <a href={`tel:${supplier.contact}`} className="btn-primary shrink-0">
                <Phone size={15} /> Call Supplier
              </a>
              <a
                href={`https://wa.me/${supplier.contact.replace(/\D/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="btn bg-green-500 hover:bg-green-400 text-white shrink-0"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

    <div className="max-w-5xl mx-auto px-4 py-8">

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
                    {catPrices.map((p, idx) => (
                      <tr key={p.id} className={`hover:bg-primary-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
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
    </div>
  )
}
