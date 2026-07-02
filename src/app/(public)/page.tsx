import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import SearchBar from '@/components/SearchBar'
import AnimatedCounter from '@/components/AnimatedCounter'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, ArrowRight } from 'lucide-react'
import { faqJsonLd, breadcrumbJsonLd } from '@/lib/seo'
import HomeContent from '@/components/HomeContent'
import HomeCTASection from '@/components/HomeCTASection'
import HomeLatestHeading from '@/components/HomeLatestHeading'
import { CATEGORY_META } from '@/lib/visual'

export const metadata: Metadata = {
  title: 'BuildPriceGambia – Construction Material Prices in The Gambia',
  description:
    'Real-time construction material prices in The Gambia (GMD). Compare cement, rebar, sand, timber, zinc sheets and more across verified suppliers. Find contractors, estimate costs and track price history.',
  openGraph: {
    title: 'BuildPriceGambia – Construction Material Prices in The Gambia',
    description:
      'Compare construction material prices across verified suppliers in The Gambia. Find cement, rebar, sand, timber, zinc sheets and more in GMD.',
    url: 'https://buildprice-gambia.vercel.app',
  },
  alternates: {
    canonical: 'https://buildprice-gambia.vercel.app',
  },
}

const HOME_FAQS = [
  {
    q: 'How much does cement cost in The Gambia?',
    a: 'Cement prices in The Gambia typically range from D300 to D600 per bag (50 kg) depending on the supplier and location. BuildPriceGambia shows live prices from verified suppliers so you can compare and get the best deal.',
  },
  {
    q: 'Where can I find verified construction material suppliers in The Gambia?',
    a: 'BuildPriceGambia lists verified construction material suppliers across The Gambia including Banjul, Serrekunda, Brikama, Farafenni and more. Browse our suppliers directory or use the map to find suppliers near you.',
  },
  {
    q: 'How can I estimate the cost of building a house in The Gambia?',
    a: 'Use our free construction cost estimator at buildprice-gambia.vercel.app/estimator. Enter your building dimensions and it generates a full Bill of Quantities using current market prices for cement, blocks, rebar, zinc sheets and more.',
  },
  {
    q: 'What construction materials can I compare prices for in The Gambia?',
    a: 'You can compare prices for cement, rebar, sand, gravel, concrete blocks, zinc/corrugated iron sheets, timber, plywood, paint, tiles, PVC pipes and many more construction materials — all in Gambian Dalasi (GMD).',
  },
  {
    q: 'How do I find a contractor in The Gambia?',
    a: 'Visit our contractors directory at buildprice-gambia.vercel.app/contractors to browse vetted and rated construction professionals across The Gambia including masons, roofers, electricians, plumbers and general contractors.',
  },
]

async function getFeaturedPrices() {
  return prisma.price.findMany({
    where: { stockStatus: 'AVAILABLE' },
    include: {
      material: { include: { category: true } },
      supplier: { select: { id: true, name: true, location: true, verified: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 6,
  })
}

async function getStats() {
  const [materials, suppliers, prices, contractors] = await Promise.all([
    prisma.material.count(),
    prisma.supplier.count({ where: { verified: true } }),
    prisma.price.count(),
    prisma.contractor.count({ where: { verified: true } }),
  ])
  return { materials, suppliers, prices, contractors }
}

const quickLinks = ['Cement', 'Rebar', 'Sand', 'Timber', 'Zinc Sheet', 'Plywood']

function getCatMeta(catName: string) {
  return CATEGORY_META.find(c => catName.toLowerCase().includes(c.query) || c.label.toLowerCase().includes(catName.toLowerCase()))
    ?? CATEGORY_META[0]
}

export default async function HomePage() {
  const [featured, stats] = await Promise.all([getFeaturedPrices(), getStats()])

  const faqLd        = faqJsonLd(HOME_FAQS)
  const breadcrumbLd = breadcrumbJsonLd([{ name: 'Home', url: '/' }])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="page-enter">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gray-900 min-h-[380px] md:min-h-[420px] flex items-center">
          {/* Background photo */}
          <Image
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=60"
            alt="Construction site in The Gambia"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-30"
          />
          {/* Single flat overlay — no gradient noise */}
          <div className="absolute inset-0 bg-gray-900/55" />

          <div className="relative z-10 max-w-2xl mx-auto px-4 py-14 w-full text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight font-display">
              Construction material prices in The Gambia
            </h1>
            <p className="text-gray-300 text-sm md:text-base mb-7 leading-relaxed max-w-lg mx-auto">
              Compare cement, rebar, sand, timber &amp; more across verified suppliers.
            </p>
            <div className="max-w-lg mx-auto">
              <SearchBar large placeholder="Search: cement, rebar, sand, timber…" />
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {quickLinks.map(link => (
                <Link key={link} href={`/search?q=${encodeURIComponent(link)}`}
                  className="text-xs bg-white/10 hover:bg-white/20 text-gray-200 px-3 py-1 rounded-full border border-white/10 transition-colors">
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stat strip ──────────────────────────────────────────────────── */}
        <section className="bg-white border-b border-gray-100 py-5 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Prices',      value: stats.prices },
              { label: 'Suppliers',   value: stats.suppliers },
              { label: 'Contractors', value: stats.contractors },
              { label: 'Materials',   value: stats.materials },
            ].map(s => (
              <div key={s.label}>
                <p className="text-lg md:text-xl font-bold text-gray-900">
                  <AnimatedCounter end={s.value} />
                </p>
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Browse by category + Why section (client, translatable) ─────── */}
        <HomeContent />

        {/* ── Latest prices ───────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 py-10 border-t border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <HomeLatestHeading />
            <Link href="/search" className="text-sm text-primary-600 hover:underline font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map(price => {
              const cm = getCatMeta(price.material.category.name)
              return (
                <Link key={price.id} href={`/search?q=${encodeURIComponent(price.material.name)}`}
                  className="group flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-primary-200 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <img src={cm.image} alt={cm.label} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors text-sm truncate">
                      {price.material.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {price.supplier.verified && <ShieldCheck size={10} className="inline mr-0.5 text-emerald-500 align-[-1px]" />}
                      {price.supplier.name} · {price.supplier.location}
                    </p>
                  </div>
                  <p className="text-base font-bold text-gray-900 shrink-0">
                    D{price.price.toLocaleString()}
                    <span className="text-xs font-normal text-gray-400">/{price.unit}</span>
                  </p>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Final CTA (client, translatable — merged compare/contractors/whatsapp) ── */}
        <HomeCTASection />

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 py-14 border-t border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {HOME_FAQS.map(faq => (
              <details key={faq.q} className="group cursor-pointer border-b border-gray-100 pb-3">
                <summary className="font-medium text-gray-900 text-sm list-none flex items-center justify-between gap-2">
                  {faq.q}
                  <span className="text-primary-500 text-lg leading-none shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

      </div>
    </>
  )
}
