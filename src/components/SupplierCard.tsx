import Link from 'next/link'
import { MapPin, Phone, ShieldCheck, Package, Star, ArrowRight } from 'lucide-react'
import { avatarColor, initials } from '@/lib/visual'

type Supplier = {
  id: string
  name: string
  location: string
  contact: string
  verified: boolean
  views: number
  avgRating?: number
  reviewCount?: number
  prices: { price: number; unit: string; material: { name: string } }[]
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={11}
          className={rating >= n ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
      ))}
    </span>
  )
}

export default function SupplierCard({ supplier }: { supplier: Supplier }) {
  const bg  = avatarColor(supplier.name)
  const ini = initials(supplier.name)

  return (
    <Link href={`/suppliers/${supplier.id}`}
      className="card block group overflow-hidden p-0 relative">

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
        <span className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
          <Phone size={13} className="text-gray-400 shrink-0" /> {supplier.contact}
        </span>

        {/* Rating */}
        {supplier.avgRating != null && supplier.avgRating > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <RatingStars rating={supplier.avgRating} />
            <span className="text-xs font-semibold text-gray-700">{supplier.avgRating.toFixed(1)}</span>
            {supplier.reviewCount != null && (
              <span className="text-xs text-gray-400">({supplier.reviewCount})</span>
            )}
          </div>
        )}

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

      {/* Hover reveal CTA */}
      <div className="absolute bottom-0 left-0 right-0 bg-primary-500 text-white text-xs font-semibold flex items-center justify-center gap-1 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
        View Profile <ArrowRight size={12} />
      </div>
    </Link>
  )
}
