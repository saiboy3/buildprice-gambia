'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { X, MessageSquarePlus, CheckCircle2 } from 'lucide-react'

const ROLES = [
  { value: 'buyer',      label: "I'm a buyer / homebuilder" },
  { value: 'supplier',   label: "I'm a supplier" },
  { value: 'contractor', label: "I'm a contractor" },
  { value: 'other',      label: 'Other' },
]

export default function FeedbackWidget() {
  const pathname = usePathname()
  const [open, setOpen]       = useState(false)
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [role, setRole]       = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const reset = () => {
    setMessage(''); setContact(''); setRole(''); setSent(false); setError('')
  }

  const submit = async () => {
    if (message.trim().length < 3) { setError('Please enter a bit more detail.'); return }
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, contact, role, page: pathname }),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error ?? 'Something went wrong. Please try again.'); return }
      setSent(true)
    } catch {
      setError('Could not send — check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Edge tab — avoids the WhatsApp bar occupying the bottom of the screen */}
      <button
        onClick={() => setOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-2.5 py-3 rounded-l-xl shadow-lg flex flex-col items-center gap-1.5 [writing-mode:vertical-rl] transition-colors"
        aria-label="Give feedback"
      >
        <MessageSquarePlus size={14} className="rotate-90" />
        Feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setOpen(false); reset() }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {sent ? (
              <div className="text-center py-6">
                <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Thanks for the feedback!</h3>
                <p className="text-sm text-gray-500 mb-5">We read every submission — this really helps us improve.</p>
                <button onClick={() => { setOpen(false); reset() }} className="btn-primary w-full justify-center">Close</button>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Got feedback?</h3>
                <p className="text-sm text-gray-500 mb-4">Found a bug, or something confusing? Tell us — testers make this better.</p>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">What's on your mind? *</label>
                    <textarea
                      className="input min-h-[100px] resize-none"
                      placeholder="e.g. The price history chart didn't load on my phone…"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      maxLength={2000}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">I am… (optional)</label>
                    <select className="input" value={role} onChange={e => setRole(e.target.value)}>
                      <option value="">Prefer not to say</option>
                      {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Phone or email (optional — if you'd like a reply)</label>
                    <input
                      className="input"
                      placeholder="e.g. 220 123 4567"
                      value={contact}
                      onChange={e => setContact(e.target.value)}
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

                <button onClick={submit} disabled={sending} className="btn-primary w-full justify-center mt-4">
                  {sending ? 'Sending…' : 'Send feedback'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
