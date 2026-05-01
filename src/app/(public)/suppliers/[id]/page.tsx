import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { MapPin, Phone, CheckCircle, Eye, Package } from 'lucide-react'
import CompareTable from '@/components/CompareTable'
import Link from 'next/link'

export default async function SupplierProfilePage({ params }: { params: { id: string } }) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: params.id },
    include: {
      prices: {
        include: { material: { include: { category: true } } },
        orderBy: { updatedAt: 'desc' },
      },
    },
  })

  if (!supplier) notFound()

  // Update views server-side
  await prisma.supplier.update({ where: { id: params.id }, data: { views: { increment: 1 } } })

  const categories = Array.from(new Set(supplier.prices.map(p => p.material.category.name)))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
              {supplier.verified && (
                <span className="flex items-center gap-1 badge badge-green">
                  <CheckCircle size={12} /> Verified
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
              <span className="flex items-center gap-1.5"><MapPin size={14} />{supplier.location}</span>
              <a href={`tel:${supplier.contact}`} className="flex items-center gap-1.5 text-primary-600 hover:underline">
                <Phone size={14} />{supplier.contact}
              </a>
              <span className="flex items-center gap-1.5"><Eye size={14} />{supplier.views.toLocaleString()} views</span>
              <span className="flex items-center gap-1.5"><Package size={14} />{supplier.prices.length} materials</span>
            </div>
          </div>
          <a
            href={`tel:${supplier.contact}`}
            className="btn-primary shrink-0"
          >
            <Phone size={15} /> Call Supplier
          </a>
        </div>
      </div>

      {/* Price list grouped by category */}
      {categories.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No prices listed yet.</p>
      ) : (
        categories.map(cat => {
          const catPrices = supplier.prices.filter(p => p.material.category.name === cat)
          return (
            <section key={cat} className="mb-8">
              <h2 className="text-base font-semibold text-gray-700 mb-3">{cat}</h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-2.5">Material</th>
                      <th className="text-right px-4 py-2.5">Price</th>
                      <th className="text-center px-4 py-2.5">Stock</th>
                      <th className="text-left px-4 py-2.5">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {catPrices.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          <Link href={`/search?q=${encodeURIComponent(p.material.name)}`} className="hover:text-primary-600">
                            {p.material.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          D{p.price.toLocaleString()} <span className="font-normal text-gray-400 text-xs">/{p.unit}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`badge ${p.stockStatus === 'AVAILABLE' ? 'badge-green' : p.stockStatus === 'LIMITED' ? 'badge-yellow' : 'badge-red'}`}>
                            {p.stockStatus === 'AVAILABLE' ? 'In stock' : p.stockStatus === 'LIMITED' ? 'Limited' : 'Out of stock'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {new Date(p.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
