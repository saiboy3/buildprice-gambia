import Link from 'next/link'
import { MapPin, Phone, ShieldCheck, Package } from 'lucide-react'
import { avatarColor, initials } from '@/lib/visual'

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
  const bg  = avatarColor(supplier.name)
  const ini = initials(supplier.name)

  return (
    <Link href={`/suppliers/${supplier.id}`}
      className="card block hover:shadow-md hover:border-primary-200 transition-all group overflow-hidden p-0">

      {/* Coloured header strip with avatar */}
      <div className={`${bg} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white font-extrabold text-sm shadow-inner">
            {ini}
          </div>
          <div>
            <h3 className="font-bold text-white text-sm leading-tight group-hover:underline">
              {supplier.name}
            </h3>
            <span className="flex items-center gap-1 text-white/80 text-xs mt-0.5">
              <MapPin size={10} /> {supplier.location}
            </span>
          </div>
        </div>
        {supplier.verified && (
          <span title="Verified by BuildPriceGambia"
            className="flex items-center gap-1 text-xs font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
            <ShieldCheck size={11} /> Verified
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <span className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
          <Phone size={13} className="text-gray-400 shrink-0" /> {supplier.contact}
        </span>

        {supplier.prices.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
              <Package size={11} /> {supplier.prices.length} material{supplier.prices.length !== 1 ? 's' : ''} listed
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
      </div>
    </Link>
  )
}
