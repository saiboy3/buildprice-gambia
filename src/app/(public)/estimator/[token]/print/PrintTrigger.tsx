'use client'

export default function PrintTrigger() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-primary text-xs px-3 py-1.5"
    >
      Print / Save PDF
    </button>
  )
}
