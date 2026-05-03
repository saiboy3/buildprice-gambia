import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import type { LineItem } from '@/lib/estimator'
import PrintTrigger from './PrintTrigger'

const GMD = (n: number | null) =>
  n === null ? '—' : `D ${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default async function EstimatePrintPage({ params }: { params: { token: string } }) {
  const raw = await prisma.estimate.findUnique({
    where: { shareToken: params.token },
    include: { user: { select: { name: true } } },
  }).catch(() => null)

  if (!raw) notFound()

  const results: LineItem[]               = JSON.parse(raw.results)
  const inputs: Record<string, unknown>   = JSON.parse(raw.inputs)
  const categories = Array.from(new Set(results.map(r => r.category)))

  const catTotals: Record<string, number> = {}
  for (const item of results) {
    if (item.total !== null) {
      catTotals[item.category] = (catTotals[item.category] ?? 0) + item.total
    }
  }

  const createdDate = new Date(raw.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-size: 10.5pt; color: #111; }
          table { page-break-inside: auto; width: 100%; }
          tr { page-break-inside: avoid; }
          h2 { page-break-after: avoid; }
        }
      `}</style>

      {/* Print toolbar */}
      <div className="no-print bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
          <span className="text-sm text-gray-500">Print preview — {raw.projectName}</span>
          <div className="flex gap-2">
            <a href={`/estimator/${params.token}`} className="btn-secondary text-xs px-3 py-1.5">
              ← Back
            </a>
            <PrintTrigger />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 print:py-4 bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
              Bill of Quantities — Construction Estimate
            </p>
            <h1 className="text-2xl font-bold text-gray-900">{raw.projectName}</h1>
            {raw.location && <p className="text-gray-500 text-sm mt-0.5">{raw.location}</p>}
            <p className="text-xs text-gray-400 mt-1">Generated {createdDate}</p>
            {raw.user && <p className="text-xs text-gray-400">Prepared by {raw.user.name}</p>}
          </div>
          <div className="text-right text-xs text-gray-400">
            <p className="font-semibold text-gray-700">BuildPriceGambia</p>
            <p>buildpricegambia.com</p>
          </div>
        </div>

        {/* Grand total banner */}
        <div className="border border-gray-300 rounded-lg px-5 py-3 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Estimated Material Cost</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
              {raw.totalCost > 0 ? GMD(raw.totalCost) : 'Prices not available'}
            </p>
          </div>
          <p className="text-xs text-gray-400 max-w-[220px] text-right">
            Excludes labour, transport, fittings &amp; contingency. Based on lowest market prices at generation.
          </p>
        </div>

        {/* BoQ tables */}
        {categories.map(cat => {
          const rows = results.filter(r => r.category === cat)
          return (
            <div key={cat} className="mb-7">
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-600">{cat}</h2>
                {catTotals[cat] !== undefined && (
                  <span className="text-xs font-medium text-gray-500">{GMD(catTotals[cat])}</span>
                )}
              </div>
              <table className="w-full text-sm border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="px-3 py-2 font-medium text-right">Qty</th>
                    <th className="px-3 py-2 font-medium">Unit</th>
                    <th className="px-3 py-2 font-medium text-right">Unit Price</th>
                    <th className="px-3 py-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 text-gray-900">
                        {row.description}
                        {row.note && <span className="block text-xs text-gray-400">{row.note}</span>}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{row.quantity.toLocaleString()}</td>
                      <td className="px-3 py-2 text-gray-500">{row.unit}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-600">
                        {row.unitPrice !== null ? GMD(row.unitPrice) : '—'}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium text-gray-900">
                        {row.total !== null ? GMD(row.total) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}

        {/* Grand total row */}
        <div className="flex justify-end mb-8">
          <div className="border-t-2 border-gray-900 pt-2.5 min-w-[240px]">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Grand Total</span>
              <span className="font-bold text-lg text-gray-900">{GMD(raw.totalCost)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 text-right">Materials only · GMD</p>
          </div>
        </div>

        {/* Project parameters */}
        <div className="border border-gray-200 rounded-lg p-4 mb-6 text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Project Parameters</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1.5 text-gray-600">
            {[
              ['Length',     `${inputs.buildingLength} m`],
              ['Width',      `${inputs.buildingWidth} m`],
              ['Wall height',`${inputs.wallHeight} m`],
              ['Floors',     `${inputs.numFloors}`],
              ['Doors',      `${inputs.numDoors}`],
              ['Windows',    `${inputs.numWindows}`],
              ['Foundation', inputs.includeFoundation ? `${inputs.foundationWidth}m × ${inputs.foundationDepth}m` : 'Not included'],
              ['Plastering', inputs.includePlastering ? 'Both faces' : 'Not included'],
              ['Roof',       inputs.includeRoof ? `Pitch ${inputs.roofPitch}°, ${inputs.sheetLength}ft sheets` : 'Not included'],
            ].map(([label, val]) => (
              <div key={label as string} className="flex justify-between gap-2">
                <span className="text-gray-400">{label}</span>
                <span className="font-medium text-gray-800">{val as string}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 space-y-1 border-t border-gray-200 pt-4">
          <p>This estimate is for guidance only and does not constitute a formal quotation.</p>
          <p>Quantities include standard wastage allowances. Verify prices with suppliers before procurement.</p>
        </div>
      </div>
    </>
  )
}
