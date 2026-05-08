import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import SearchBar from '@/components/SearchBar'
import AnimatedCounter from '@/components/AnimatedCounter'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingDown, Zap, MessageSquare, ShieldCheck, HardHat, ArrowRight, ArrowDown } from 'lucide-react'
import { CATEGORY_META } from '@/lib/visual'
import { faqJsonLd, breadcrumbJsonLd } from '@/lib/seo'

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
        <section className="relative overflow-hidden bg-gray-900 min-h-[460px] md:min-h-[540px] flex items-center">
          {/* Background photo */}
          <Image
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1920&q=75"
            alt="Construction site in The Gambia"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-40"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-primary-900/40" />

          <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 w-full grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/30 px-3 py-1 rounded-full mb-4">
                🇬🇲 The Gambia&apos;s #1 Construction Price Platform
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight font-display">
                Real-time Construction<br className="hidden md:block" /> Prices in The Gambia
              </h1>
              <p className="text-gray-300 text-base md:text-lg mb-7 leading-relaxed">
                Compare cement, rebar, sand, timber &amp; more across verified suppliers.
                Save money on every project.
              </p>
              <div className="max-w-lg">
                <SearchBar large placeholder="Search: cement, rebar, sand, timber…" />
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {quickLinks.map(link => (
                  <Link key={link} href={`/search?q=${encodeURIComponent(link)}`}
                    className="text-xs bg-white/10 hover:bg-white/20 text-gray-200 px-3 py-1 rounded-full border border-white/10 transition-colors">
                    {link}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right panel — animated stat cards */}
            <div className="hidden md:grid grid-cols-2 gap-3">
              {[
                { value: stats.prices,      label: 'Listed Prices',        icon: '📊' },
                { value: stats.suppliers,   label: 'Verified Suppliers',   icon: '🏪' },
                { value: stats.contractors, label: 'Verified Contractors', icon: '👷' },
                { value: stats.materials,   label: 'Material Types',       icon: '📦' },
              ].map(s => (
                <div key={s.label}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-white text-center animate-float">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-3xl font-extrabold">
                    <AnimatedCounter end={s.value} />
                  </div>
                  <div className="text-xs text-gray-300 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute bottom-8 left-4 right-4 flex justify-center gap-3 flex-wrap z-10">
            <div className="glass rounded-xl px-4 py-2 text-white text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live prices updated daily
            </div>
            <div className="glass rounded-xl px-4 py-2 text-white text-sm font-semibold">
              🇬🇲 Made for The Gambia
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/40 animate-bounce z-10">
            <ArrowDown size={18} />
          </div>
        </section>

        {/* ── Mobile stats bar ────────────────────────────────────────────── */}
        <section className="md:hidden bg-white border-b border-gray-100 py-4 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Prices',      value: stats.prices },
              { label: 'Suppliers',   value: stats.suppliers },
              { label: 'Contractors', value: stats.contractors },
              { label: 'Materials',   value: stats.materials },
            ].map(s => (
              <div key={s.label}>
                <p className="text-xl font-extrabold text-primary-600">
                  <AnimatedCounter end={s.value} />
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Browse by category ───────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Browse by Category</h2>
            <Link href="/search" className="text-sm text-primary-600 hover:underline font-medium flex items-center gap-1">
              All materials <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORY_META.map(cat => (
              <Link key={cat.label} href={`/search?q=${encodeURIComponent(cat.query)}`}
                className={`card-lift group flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border ${cat.color} ${cat.border} text-center cursor-pointer`}>
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.emoji}</span>
                <span className={`text-xs font-semibold leading-tight ${cat.text}`}>{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Why BuildPriceGambia ─────────────────────────────────────────── */}
        <section className="bg-gradient-to-b from-white to-amber-50/30 border-y border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-14 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: TrendingDown,  title: 'Compare Prices',    desc: "Every supplier's price side by side. Pick the best deal instantly." },
              { icon: Zap,           title: 'Live Results',       desc: 'Prices updated by suppliers in real time — always current.' },
              { icon: MessageSquare, title: 'WhatsApp Bot',       desc: 'Message us on WhatsApp. Get prices without opening a browser.' },
              { icon: ShieldCheck,   title: 'Verified Suppliers', desc: 'Every listed supplier is reviewed and verified before going live.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card border-l-4 border-l-primary-400 flex flex-col gap-3 group">
                <div className="p-3 bg-primary-50 rounded-xl w-fit group-hover:rotate-6 transition-transform">
                  <Icon size={22} className="text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Latest prices ───────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Latest Prices
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                LIVE
              </span>
            </h2>
            <Link href="/search" className="text-sm text-primary-600 hover:underline font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map(price => {
              const cm = getCatMeta(price.material.category.name)
              return (
                <Link key={price.id} href={`/search?q=${encodeURIComponent(price.material.name)}`}
                  className="group card hover:shadow-md hover:border-primary-200 transition-all overflow-hidden p-0">
                  {/* Coloured accent bar */}
                  <div className={`h-1.5 w-full ${cm.color.replace('bg-', 'bg-').replace('-50', '-300').replace('-100', '-400')}`} />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cm.emoji}</span>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors text-sm">
                            {price.material.name}
                          </p>
                          <p className="text-xs text-gray-400">{price.material.category.name}</p>
                        </div>
                      </div>
                      <span className="badge badge-blue text-xs shrink-0">In stock</span>
                    </div>
                    <p className="text-2xl font-extrabold text-primary-600 mt-2 price-pulse">
                      D{price.price.toLocaleString()}
                      <span className="text-sm font-normal text-gray-400 ml-1">/{price.unit}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      {price.supplier.verified && <ShieldCheck size={11} className="text-emerald-500" />}
                      {price.supplier.name} · {price.supplier.location}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Price Comparison CTA banner ──────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 mb-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 text-white overflow-hidden relative">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Compare Prices Instantly</h2>
              <p className="text-primary-100 mb-4">Search across all suppliers and find the best deals in seconds.</p>
              <Link href="/search" className="bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors inline-flex items-center gap-2">
                Start comparing <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Contractors CTA ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gray-900 py-12 px-4">
          <Image
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1920&q=75"
            alt="Construction contractor at work"
            fill
            sizes="100vw"
            className="object-cover object-center opacity-25"
          />
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-2">
                <HardHat size={22} className="text-primary-400" />
                <span className="text-sm font-semibold text-primary-400 uppercase tracking-wide">Find Contractors</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Need someone to build it?</h2>
              <p className="text-gray-300 text-sm md:text-base">
                Browse verified, rated contractors across The Gambia — masons, roofers, electricians and more.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/contractors" className="btn-primary px-5 py-2.5">
                Find a Contractor
              </Link>
              <Link href="/contractors/register"
                className="btn bg-white/10 border border-white/20 text-white hover:bg-white/20 px-5 py-2.5">
                Register as Contractor
              </Link>
            </div>
          </div>
        </section>

        {/* ── WhatsApp CTA ────────────────────────────────────────────────── */}
        <section className="bg-[#075E54] text-white py-10 px-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Check prices on WhatsApp</h2>
          <p className="text-green-200 mb-5 text-sm">
            Send &quot;cement price&quot; and get instant results — no app download needed
          </p>
          <a href="https://wa.me/220XXXXXXXX?text=cement%20price" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#075E54] font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-lg">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat on WhatsApp
          </a>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 py-14">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {HOME_FAQS.map(faq => (
              <details key={faq.q} className="card group cursor-pointer">
                <summary className="font-semibold text-gray-900 text-sm list-none flex items-center justify-between gap-2">
                  {faq.q}
                  <span className="text-primary-500 text-lg leading-none shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

      </div>
    </>
  )
}
