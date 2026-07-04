// Lightweight offline resilience for the field-report wizard: persists
// in-progress form state so a dropped connection or accidental tab close
// doesn't lose someone's work, and queues submissions that fail due to no
// connectivity so they retry automatically once back online. Not a full
// service-worker background-sync — just localStorage, which is enough for
// "spotty connection at a hardware store", the actual failure mode here.

const DRAFT_KEY = '_bpg_report_draft'
const QUEUE_KEY = '_bpg_report_queue'

export type ReportDraft = {
  step: number
  materialId: string | null
  materialLabel: string
  otherMaterial: string
  price: string
  unit: string
  otherUnit: string
  location: string
  supplierName: string
  note: string
}

export function saveDraft(draft: ReportDraft) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)) } catch {}
}

export function loadDraft(): ReportDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY) } catch {}
}

export type QueuedReport = {
  id: string
  payload: Record<string, unknown>
  queuedAt: number
}

export function getQueue(): QueuedReport[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function enqueue(payload: Record<string, unknown>): QueuedReport {
  const item: QueuedReport = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, payload, queuedAt: Date.now() }
  const queue = getQueue()
  queue.push(item)
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)) } catch {}
  return item
}

function removeFromQueue(id: string) {
  const queue = getQueue().filter(q => q.id !== id)
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)) } catch {}
}

/** Attempts to send every queued report. Returns how many succeeded. */
export async function flushQueue(token: string): Promise<number> {
  const queue = getQueue()
  let sent = 0
  for (const item of queue) {
    try {
      const res = await fetch('/api/field-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(item.payload),
      })
      if (res.ok) {
        removeFromQueue(item.id)
        sent++
      }
    } catch {
      // Still offline — leave it queued and stop trying the rest for now.
      break
    }
  }
  return sent
}
