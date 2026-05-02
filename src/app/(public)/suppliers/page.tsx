import { prisma } from '@/lib/db'
import SupplierCard from '@/components/SupplierCard'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

export const revalidate = 60

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    where: { verified: true },
    include: {
      prices: { include: { material: true }, orderBy: { updatedAt: 'desc' }, take: 10 },
    },
    orderBy: { name: 'asc' },
  })

  const locations = Array.from(new Set(suppliers.map(s => s.location))).sort()

  return (
    <div>
      {/* Hero banner */}
      <section className="relative overflow-hidden bg-gray-900 h-44 md:h-56 flex items-end">
        <Image
          src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=1920&q=75"
          alt="Building materials and hardware supplier"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/85 to-gray-900/10" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 pb-7 w-full">
          <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">Verified Suppliers</h1>
          <p className="text-gray-300 text-sm mt-1">
            {suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''} across {locations.length} location{locations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Location quick-jump pills */}
        {locations.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
            {locations.map(loc => (
              <a key={loc} href={`#loc-${loc.replace(/\s+/g, '-')}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:border-primary-300 hover:text-primary-700 whitespace-nowrap transition-colors shrink-0">
                <MapPin size={11} /> {loc}
              </a>
            ))}
          </div>
        )}

        {locations.map(loc => {
          const locSuppliers = suppliers.filter(s => s.location === loc)
          return (
            <section key={loc} id={`loc-${loc.replace(/\s+/g, '-')}`} className="mb-12 scroll-mt-20">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={15} className="text-primary-500" />
                <h2 className="text-base font-bold text-gray-900">{loc}</h2>
                <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {locSuppliers.length} supplier{locSuppliers.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {locSuppliers.map(s => <SupplierCard key={s.id} supplier={s as any} />)}
              </div>
            </section>
          )
        })}

        {suppliers.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="font-medium mb-2">No verified suppliers yet</p>
            <Link href="/register" className="text-primary-600 hover:underline text-sm">Register as a supplier →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
