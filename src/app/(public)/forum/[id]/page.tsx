'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context'
import { ChevronLeft, MessageSquare, Trash2, Send, Loader2, Eye } from 'lucide-react'
import clsx from 'clsx'

type Reply = {
  id: string; body: string; createdAt: string; user: { id: string; name: string }
}
type Thread = {
  id: string; title: string; body: string; categorySlug: string
  createdAt: string; views: number; user: { id: string; name: string }
  replies: Reply[]
}

export default function ForumThreadPage() {
  const { id }        = useParams<{ id: string }>()
  const { user, token } = useAuth()

  const [thread,     setThread]     = useState<Thread | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [replyBody,  setReplyBody]  = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg,  setSubmitMsg]  = useState('')
  const [deleting,   setDeleting]   = useState<string | null>(null)

  const load = () => {
    fetch(`/api/forum/${id}`)
      .then(r => r.json())
      .then(j => { if (j.ok) setThread(j.data) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [id])

  const submitReply = async () => {
    if (!replyBody.trim()) { setSubmitMsg('Reply cannot be empty.'); return }
    setSubmitting(true); setSubmitMsg('')
    const res  = await fetch(`/api/forum/${id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ body: replyBody }),
    })
    const json = await res.json()
    if (json.ok) { setReplyBody(''); setSubmitMsg(''); load() }
    else setSubmitMsg(json.error ?? 'Failed to post reply.')
    setSubmitting(false)
  }

  const deleteReply = async (replyId: string) => {
    if (!confirm('Delete your reply?')) return
    setDeleting(replyId)
    await fetch(`/api/forum/${id}/replies?replyId=${replyId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setDeleting(null)
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
  )
  if (!thread) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">Thread not found.</div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/forum" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft size={16} /> Forum
      </Link>

      {/* Thread */}
      <div className="card mb-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">{thread.title}</h1>
            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
              <span>by <span className="text-gray-700 font-medium">{thread.user.name}</span></span>
              {thread.categorySlug && (
                <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded capitalize">{thread.categorySlug}</span>
              )}
              <span>{new Date(thread.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className="flex items-center gap-1"><Eye size={11} /> {thread.views}</span>
              <span className="flex items-center gap-1"><MessageSquare size={11} /> {thread.replies.length} replies</span>
            </div>
          </div>
        </div>
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">{thread.body}</div>
      </div>

      {/* Replies */}
      {thread.replies.length > 0 && (
        <div className="space-y-4 mb-6">
          <h2 className="font-bold text-gray-900">Replies ({thread.replies.length})</h2>
          {thread.replies.map(r => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-semibold text-gray-900 text-sm">{r.user.name}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {user && user.id === r.user.id && (
                  <button onClick={() => deleteReply(r.id)} disabled={deleting === r.id}
                    className="text-gray-300 hover:text-red-400 transition-colors">
                    {deleting === r.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply form */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-3">Leave a Reply</h3>
        {!user ? (
          <p className="text-sm text-gray-500">
            <Link href="/login" className="text-primary-600 hover:underline font-medium">Sign in</Link> to reply.
          </p>
        ) : (
          <div className="space-y-3">
            <textarea
              className="input w-full min-h-[100px] resize-y"
              placeholder="Share your thoughts, experience, or answer…"
              value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
            />
            {submitMsg && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{submitMsg}</p>
            )}
            <button onClick={submitReply} disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Post Reply
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
