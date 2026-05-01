import Link from 'next/link'
import { MapPin, Phone, CheckCircle, Package } from 'lucide-react'

type Supplier = {
  id: string
  name: string
  location: string
  contact: string
  verified: boolean
  views: number
  prices: { price: number; unit: string; material: { name: string } }[]
}

export default function SupplierCard({ supplier }: { supplier: Supplier }) {
  return (
    <Link href={`/suppliers/${supplier.id}`} className="card block hover:shadow-md hover:border-primary-200 transition-all group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors leading-tight">
          {supplier.name}
        </h3>
        {supplier.verified && (
          <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200 shrink-0">
            <CheckCircle size={11} /> Verified
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 text-sm text-gray-600 mb-3">
        <span className="flex items-center gap-1.5">
          <MapPin size={13} className="text-gray-400" /> {supplier.location}
        </span>
        <span className="flex items-center gap-1.5">
          <Phone size={13} className="text-gray-400" /> {supplier.contact}
        </span>
      </div>

      {supplier.prices.length > 0 && (
        <div className="border-t border-gray-100 pt-2">
          <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
            <Package size={11} /> {supplier.prices.length} material{supplier.prices.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-1">
            {supplier.prices.slice(0, 4).map((p, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {p.material.name}
              </span>
            ))}
            {supplier.prices.length > 4 && (
              <span className="text-xs text-gray-400 px-1">+{supplier.prices.length - 4} more</span>
            )}
          </div>
        </div>
      )}
    </Link>
  )
}
