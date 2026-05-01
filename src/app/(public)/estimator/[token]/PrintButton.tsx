'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-primary text-sm px-3 py-1.5"
    >
      Print / PDF
    </button>
  )
}
