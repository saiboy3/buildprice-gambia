import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { LineItem } from '@/lib/estimator'
import PrintButton from './PrintButton'

type Estimate = {
  id: string
  shareToken: string
  projectName: string
  location: string
  totalCost: number
  createdAt: string
  inputs: Record<string, unknown>
  results: LineItem[]
  user?: { name: string } | null
}

async function getEstimate(token: string): Promise<Estimate | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  try {
    const res = await fetch(`${base}/api/estimates/${token}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

const GMD = (n: number | null) =>
  n === null ? '—' : `D ${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default async function SharedEstimatePage({ params }: { params: { token: string } }) {
  const estimate = await getEstimate(params.token)
  if (!estimate) notFound()

  const categories = Array.from(new Set(estimate.results.map(r => r.category)))

  const catTotals: Record<string, number> = {}
  for (const item of estimate.results) {
    if (item.total !== null) {
      catTotals[item.category] = (catTotals[item.category] ?? 0) + item.total
    }
  }

  const createdDate = new Date(estimate.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <>
      {/* Print-specific styles injected inline */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-size: 11pt; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 print:bg-white">
        {/* Topbar */}
        <div className="no-print bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-primary-600">BuildPriceGambia</Link>
            <div className="flex gap-3">
              <Link href="/estimator" className="btn-secondary text-sm px-3 py-1.5">
                New Estimate
              </Link>
              <PrintButton />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 print:py-4 print:px-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 print:mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-1 print:text-gray-400">
                Bill of Quantities — Construction Estimate
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{estimate.projectName}</h1>
              {estimate.location && (
                <p className="text-gray-500 mt-0.5">{estimate.location}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">Generated {createdDate}</p>
            </div>
            <div className="text-right hidden print:block">
              <div className="text-xs text-gray-400">buildpricegambia.com</div>
            </div>
          </div>

          {/* Total cost banner */}
          <div className="bg-primary-600 text-white rounded-xl px-6 py-4 mb-8 print:mb-6 print:rounded-none print:border print:border-gray-300 print:bg-white print:text-gray-900">
            <div className="text-sm opacity-80 print:opacity-100 print:text-gray-500">Estimated Material Cost</div>
            <div className="text-3xl font-bold mt-1">
              {estimate.totalCost > 0 ? GMD(estimate.totalCost) : 'Prices not available'}
            </div>
            <div className="text-xs opacity-70 print:opacity-100 print:text-gray-400 mt-1">
              Excludes labour, transport, fittings &amp; contingency. Based on lowest market prices at time of generation.
            </div>
          </div>

          {/* BoQ tables by category */}
          {categories.map(cat => {
            const rows = estimate.results.filter(r => r.category === cat)
            return (
              <div key={cat} className="mb-8 print:mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-gray-800 uppercase tracking-wide text-sm">{cat}</h2>
                  {catTotals[cat] !== undefined && (
                    <span className="text-sm font-medium text-gray-600">{GMD(catTotals[cat])}</span>
                  )}
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-200 print:rounded-none">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 print:bg-gray-100 text-left text-xs uppercase tracking-wider text-gray-500">
                        <th className="px-4 py-2.5 font-medium">Description</th>
                        <th className="px-4 py-2.5 font-medium text-right">Qty</th>
                        <th className="px-4 py-2.5 font-medium">Unit</th>
                        <th className="px-4 py-2.5 font-medium text-right">Unit Price</th>
                        <th className="px-4 py-2.5 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.map(row => (
                        <tr key={row.id} className="bg-white hover:bg-gray-50 print:hover:bg-white">
                          <td className="px-4 py-2.5 text-gray-900">
                            {row.description}
                            {row.note && (
                              <span className="block text-xs text-gray-400">{row.note}</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{row.quantity.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-gray-500">{row.unit}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">
                            {row.unitPrice !== null ? GMD(row.unitPrice) : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-medium text-gray-900">
                            {row.total !== null ? GMD(row.total) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}

          {/* Grand total row */}
          <div className="flex justify-end mb-10 print:mb-6">
            <div className="border-t-2 border-gray-900 pt-3 min-w-[260px]">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Grand Total</span>
                <span className="font-bold text-lg text-gray-900">{GMD(estimate.totalCost)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 text-right">Materials only · GMD</p>
            </div>
          </div>

          {/* Building parameters summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 print:mb-6 print:rounded-none text-sm">
            <h3 className="font-semibold text-gray-700 mb-3 text-xs uppercase tracking-wide">Project Parameters</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-gray-600">
              {[
                ['Length', `${estimate.inputs.buildingLength} m`],
                ['Width', `${estimate.inputs.buildingWidth} m`],
                ['Wall height', `${estimate.inputs.wallHeight} m`],
                ['Floors', `${estimate.inputs.numFloors}`],
                ['Doors', `${estimate.inputs.numDoors}`],
                ['Windows', `${estimate.inputs.numWindows}`],
                ['Foundation', estimate.inputs.includeFoundation ? `${estimate.inputs.foundationWidth}m × ${estimate.inputs.foundationDepth}m` : 'Not included'],
                ['Plastering', estimate.inputs.includePlastering ? 'Both faces' : 'Not included'],
                ['Roof', estimate.inputs.includeRoof ? `Pitch ${estimate.inputs.roofPitch}°, ${estimate.inputs.sheetLength}ft sheets` : 'Not included'],
              ].map(([label, val]) => (
                <div key={label as string} className="flex justify-between gap-2">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium text-gray-800">{val as string}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 space-y-1 print:mt-8">
            <p>This estimate is for guidance only and does not constitute a formal quotation.</p>
            <p>Quantities include standard wastage allowances. Verify prices with suppliers before procurement.</p>
            <p className="no-print mt-3">
              <Link href="/estimator" className="text-primary-600 hover:underline">
                Create your own estimate →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
