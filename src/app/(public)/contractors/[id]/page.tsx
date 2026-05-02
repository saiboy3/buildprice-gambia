'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/context'
import Link from 'next/link'
import {
  MapPin, Phone, ShieldCheck, Star, Clock, Send, Trash2,
  ChevronLeft, HardHat, Loader2,
} from 'lucide-react'
import clsx from 'clsx'

type Review = {
  id: string; rating: number; comment: string; projectType: string
  createdAt: string; user: { name: string }
}
type Contractor = {
  id: string; name: string; specialty: string; location: string
  contact: string; bio: string; yearsExp: number
  verified: boolean; avgRating: number; reviewCount: number
  reviews: Review[]
}

function Stars({ rating, interactive, onSet, size = 18 }: {
  rating: number; interactive?: boolean; onSet?: (n: number) => void; size?: number
}) {
  const [hover, setHover] = useState(0)
  const display = interactive ? (hover || rating) : rating
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
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

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-10 text-right text-gray-500">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-gray-400">{count}</span>
    </div>
  )
}

export default function ContractorProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user, token } = useAuth()

  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [myRating,   setMyRating]   = useState(0)
  const [comment,    setComment]    = useState('')
  const [projectType,setProjectType]= useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg,  setSubmitMsg]  = useState('')

  const load = () => {
    setLoading(true)
    fetch(`/api/contractors/${id}`)
      .then(r => r.json())
      .then(j => { if (j.ok) setContractor(j.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-primary-500" />
    </div>
  )
  if (!contractor) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
      <HardHat size={40} className="mx-auto mb-3 text-gray-300" />
      Contractor not found.
      <Link href="/contractors" className="block mt-4 text-primary-600 hover:underline">← Back to directory</Link>
    </div>
  )

  // Rating distribution
  const dist = [5,4,3,2,1].map(n => ({
    label: `${n}★`, count: contractor.reviews.filter(r => r.rating === n).length,
  }))

  const myExistingReview = user
    ? contractor.reviews.find(r => r.user.name === user.name)
    : null

  const handleSubmitReview = async () => {
    if (!myRating) { setSubmitMsg('Please select a star rating.'); return }
    setSubmitting(true); setSubmitMsg('')
    try {
      const res = await fetch(`/api/contractors/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: myRating, comment, projectType }),
      })
      const json = await res.json()
      if (!json.ok) { setSubmitMsg(json.message ?? 'Could not submit review.'); return }
      setSubmitMsg('Review submitted — thank you!')
      setMyRating(0); setComment(''); setProjectType('')
      load()
    } finally { setSubmitting(false) }
  }

  const handleDeleteReview = async () => {
    if (!confirm('Remove your review?')) return
    await fetch(`/api/contractors/${id}/reviews`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    load()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/contractors" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors">
        <ChevronLeft size={16} /> All contractors
      </Link>

      {/* Profile card */}
      <div className="card mb-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-extrabold text-gray-900">{contractor.name}</h1>
              {contractor.verified && (
                <span className="flex items-center gap-1 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  <ShieldCheck size={14} /> Verified by BuildPriceGambia
                </span>
              )}
            </div>
            <span className="inline-block text-sm font-semibold bg-primary-50 text-primary-700 px-3 py-0.5 rounded-full">
              {contractor.specialty}
            </span>
          </div>
          <a href={`tel:${contractor.contact}`}
            className="btn-primary text-sm px-4 py-2">
            <Phone size={14} /> Call Contractor
          </a>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /> {contractor.location}</span>
          <span className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> {contractor.contact}</span>
          {contractor.yearsExp > 0 && (
            <span className="flex items-center gap-2"><Clock size={14} className="text-gray-400" /> {contractor.yearsExp} years experience</span>
          )}
        </div>

        {contractor.bio && (
          <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">{contractor.bio}</p>
        )}
      </div>

      {/* Rating summary */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="card p-5 flex flex-col items-center justify-center text-center">
          <p className="text-5xl font-extrabold text-gray-900 mb-1">
            {contractor.avgRating > 0 ? contractor.avgRating.toFixed(1) : '—'}
          </p>
          <Stars rating={contractor.avgRating} size={20} />
          <p className="text-sm text-gray-400 mt-2">
            {contractor.reviewCount > 0
              ? `Based on ${contractor.reviewCount} review${contractor.reviewCount > 1 ? 's' : ''}`
              : 'No reviews yet'}
          </p>
        </div>
        <div className="card p-5 flex flex-col gap-2 justify-center">
          {dist.map(d => (
            <RatingBar key={d.label} label={d.label} count={d.count} total={contractor.reviewCount} />
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Reviews {contractor.reviewCount > 0 && <span className="text-gray-400 font-normal">({contractor.reviewCount})</span>}
      </h2>

      {contractor.reviews.length === 0 ? (
        <p className="text-sm text-gray-400 mb-8">No reviews yet — be the first!</p>
      ) : (
        <div className="space-y-4 mb-8">
          {contractor.reviews.map(r => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <span className="font-semibold text-gray-900 text-sm">{r.user.name}</span>
                  {r.projectType && (
                    <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{r.projectType}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Stars rating={r.rating} size={13} />
                  {user && r.user.name === user.name && (
                    <button onClick={handleDeleteReview} title="Remove your review"
                      className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
              <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
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
            {myExistingReview && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                You've already reviewed this contractor. Submitting again will update your existing review.
              </p>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Your rating *</label>
              <Stars rating={myRating} interactive onSet={setMyRating} size={24} />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Project type</label>
              <input className="input w-full" placeholder="e.g. House construction, Roof replacement…"
                value={projectType} onChange={e => setProjectType(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Comment</label>
              <textarea className="input w-full min-h-[90px] resize-y" placeholder="Describe your experience…"
                value={comment} onChange={e => setComment(e.target.value)} />
            </div>

            {submitMsg && (
              <p className={clsx('text-sm px-3 py-2 rounded', submitMsg.includes('thank') ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50')}>
                {submitMsg}
              </p>
            )}

            <button onClick={handleSubmitReview} disabled={submitting}
              className="btn-primary px-5 py-2">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Submit Review
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
