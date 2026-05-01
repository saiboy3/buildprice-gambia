import Link from 'next/link'
import { MapPin, Phone, CheckCircle, Clock } from 'lucide-react'
import clsx from 'clsx'

type Price = {
  id: string
  price: number
  unit: string
  stockStatus: string
  updatedAt: string
  supplier: { id: string; name: string; location: string; contact: string; verified: boolean }
}

export default function PriceCard({ price, rank }: { price: Price; rank?: number }) {
  const statusColor = {
    AVAILABLE:    'badge-green',
    LIMITED:      'badge-yellow',
    OUT_OF_STOCK: 'badge-red',
  }[price.stockStatus] ?? 'badge-blue'

  const statusLabel = {
    AVAILABLE:    'In stock',
    LIMITED:      'Limited',
    OUT_OF_STOCK: 'Out of stock',
  }[price.stockStatus] ?? price.stockStatus

  return (
    <div className={clsx('card flex flex-col gap-3 relative', rank === 1 && 'border-primary-300 ring-1 ring-primary-200')}>
      {rank === 1 && (
        <span className="absolute -top-2.5 left-4 bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          Lowest price
        </span>
      )}

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            D{price.price.toLocaleString()}
            <span className="text-sm font-normal text-gray-500 ml-1">/{price.unit}</span>
          </p>
          <span className={clsx('mt-1', statusColor)}>{statusLabel}</span>
        </div>
        {price.supplier.verified && (
          <span title="Verified supplier" className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
            <CheckCircle size={12} /> Verified
          </span>
        )}
      </div>

      <div className="border-t border-gray-100 pt-2 flex flex-col gap-1.5 text-sm text-gray-600">
        <Link href={`/suppliers/${price.supplier.id}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
          {price.supplier.name}
        </Link>
        <span className="flex items-center gap-1.5">
          <MapPin size={13} className="text-gray-400 shrink-0" /> {price.supplier.location}
        </span>
        <a href={`tel:${price.supplier.contact}`} className="flex items-center gap-1.5 hover:text-primary-600">
          <Phone size={13} className="text-gray-400 shrink-0" /> {price.supplier.contact}
        </a>
      </div>

      <p className="text-xs text-gray-400 flex items-center gap-1">
        <Clock size={11} /> Updated {new Date(price.updatedAt).toLocaleDateString()}
      </p>
    </div>
  )
}
