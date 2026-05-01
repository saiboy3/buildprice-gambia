import { prisma } from '@/lib/db'
import SupplierCard from '@/components/SupplierCard'

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Verified Suppliers</h1>
        <p className="text-gray-500 text-sm">{suppliers.length} suppliers across {locations.length} locations</p>
      </div>

      {locations.map(loc => {
        const locSuppliers = suppliers.filter(s => s.location === loc)
        return (
          <section key={loc} className="mb-10">
            <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
              📍 {loc}
              <span className="text-sm font-normal text-gray-400">({locSuppliers.length})</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locSuppliers.map(s => <SupplierCard key={s.id} supplier={s as any} />)}
            </div>
          </section>
        )
      })}
    </div>
  )
}
