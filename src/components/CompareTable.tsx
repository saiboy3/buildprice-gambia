import { CheckCircle, AlertCircle, MinusCircle } from 'lucide-react'
import clsx from 'clsx'
import Link from 'next/link'

type Price = {
  id: string
  price: number
  unit: string
  stockStatus: string
  supplier: { id: string; name: string; location: string; contact: string; verified: boolean }
}

const StatusIcon = ({ status }: { status: string }) =>
  status === 'AVAILABLE'    ? <CheckCircle size={14} className="text-green-500" />  :
  status === 'LIMITED'      ? <AlertCircle size={14} className="text-yellow-500" /> :
                              <MinusCircle size={14} className="text-red-500" />

export default function CompareTable({ prices }: { prices: Price[] }) {
  const sorted = [...prices].sort((a, b) => a.price - b.price)
  const lowest = sorted[0]?.price

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-4 py-2.5">Supplier</th>
            <th className="text-left px-4 py-2.5">Location</th>
            <th className="text-right px-4 py-2.5">Price</th>
            <th className="text-center px-4 py-2.5">Stock</th>
            <th className="text-left px-4 py-2.5">Contact</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map(p => (
            <tr key={p.id} className={clsx('hover:bg-gray-50', p.price === lowest && 'bg-primary-50')}>
              <td className="px-4 py-3">
                <Link href={`/suppliers/${p.supplier.id}`} className="font-medium text-gray-900 hover:text-primary-600 flex items-center gap-1.5">
                  {p.supplier.name}
                  {p.supplier.verified && <CheckCircle size={12} className="text-green-500" />}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-500">{p.supplier.location}</td>
              <td className="px-4 py-3 text-right">
                <span className={clsx('font-bold', p.price === lowest ? 'text-primary-600 text-base' : 'text-gray-900')}>
                  D{p.price.toLocaleString()}
                </span>
                <span className="text-gray-400 text-xs ml-1">/{p.unit}</span>
                {p.price === lowest && <span className="ml-1 text-xs text-primary-500">★</span>}
              </td>
              <td className="px-4 py-3 text-center">
                <span className="flex items-center justify-center gap-1">
                  <StatusIcon status={p.stockStatus} />
                </span>
              </td>
              <td className="px-4 py-3">
                <a href={`tel:${p.supplier.contact}`} className="text-primary-600 hover:underline">
                  {p.supplier.contact}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
