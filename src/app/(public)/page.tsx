import { prisma } from '@/lib/db'
import SearchBar from '@/components/SearchBar'
import Link from 'next/link'
import { TrendingDown, Zap, MessageSquare, ShieldCheck } from 'lucide-react'

async function getFeaturedPrices() {
  return prisma.price.findMany({
    where: { stockStatus: 'AVAILABLE' },
    include: {
      material: { include: { category: true } },
      supplier: { select: { id: true, name: true, location: true, contact: true, verified: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 6,
  })
}

async function getStats() {
  const [materials, suppliers, prices] = await Promise.all([
    prisma.material.count(),
    prisma.supplier.count({ where: { verified: true } }),
    prisma.price.count(),
  ])
  return { materials, suppliers, prices }
}

const quickLinks = [
  'Cement', 'Rebar', 'Sand', 'Timber', 'Zinc Sheet', 'Plywood',
]

export default async function HomePage() {
  const [featured, stats] = await Promise.all([getFeaturedPrices(), getStats()])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight">
            Real-time Construction<br/>Prices in The Gambia
          </h1>
          <p className="text-primary-100 text-lg mb-8">
            Compare cement, rebar, sand, timber & more across verified suppliers. Save money on your next project.
          </p>
          <div className="max-w-xl mx-auto">
            <SearchBar large placeholder="Search: cement, rebar, sand, timber…" />
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {quickLinks.map(link => (
              <Link
                key={link}
                href={`/search?q=${encodeURIComponent(link)}`}
                className="text-sm bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition-colors"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Materials', value: stats.materials },
            { label: 'Verified Suppliers', value: stats.suppliers },
            { label: 'Listed Prices', value: stats.prices },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl md:text-3xl font-extrabold text-primary-600">{s.value}</p>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { icon: TrendingDown,   title: 'Compare Prices',   desc: 'See every supplier\'s price side by side and pick the best deal.' },
          { icon: Zap,            title: 'Instant Results',  desc: 'Search any material and get live prices in under a second.' },
          { icon: MessageSquare,  title: 'WhatsApp Bot',     desc: 'Message us on WhatsApp. Get prices without opening a browser.' },
          { icon: ShieldCheck,    title: 'Verified Suppliers', desc: 'All listed suppliers are verified before going live.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-start gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Icon size={22} className="text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>

      {/* Featured prices */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Latest Prices</h2>
          <Link href="/search" className="text-sm text-primary-600 hover:underline font-medium">View all →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map(price => (
            <Link
              key={price.id}
              href={`/search?q=${encodeURIComponent(price.material.name)}`}
              className="card hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {price.material.name}
                  </p>
                  <p className="text-xs text-gray-400">{price.material.category.name}</p>
                </div>
                <span className="badge badge-blue text-xs">{price.stockStatus === 'AVAILABLE' ? 'In stock' : price.stockStatus}</span>
              </div>
              <p className="text-2xl font-extrabold text-primary-600 mt-2">
                D{price.price.toLocaleString()}
                <span className="text-sm font-normal text-gray-400 ml-1">/{price.unit}</span>
              </p>
              <p className="text-xs text-gray-500 mt-2">{price.supplier.name} · {price.supplier.location}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="bg-green-600 text-white py-10 px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Check prices on WhatsApp</h2>
        <p className="text-green-100 mb-5 text-sm">Send "cement price" and get instant results — no app download needed</p>
        <a
          href="https://wa.me/220XXXXXXXX?text=cement%20price"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Chat on WhatsApp
        </a>
      </section>
    </div>
  )
}
