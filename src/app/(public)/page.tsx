import { prisma } from '@/lib/db'
import SearchBar from '@/components/SearchBar'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingDown, Zap, MessageSquare, ShieldCheck, HardHat, ArrowRight } from 'lucide-react'
import { CATEGORY_META } from '@/lib/visual'

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

// Maps a category name to the closest CATEGORY_META entry
function getCatMeta(catName: string) {
  return CATEGORY_META.find(c => catName.toLowerCase().includes(c.query) || c.label.toLowerCase().includes(catName.toLowerCase()))
    ?? CATEGORY_META[0]
}

export default async function HomePage() {
  const [featured, stats] = await Promise.all([getFeaturedPrices(), getStats()])

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gray-900 min-h-[420px] md:min-h-[500px] flex items-center">
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
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 w-full grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/30 px-3 py-1 rounded-full mb-4">
              🇬🇲 The Gambia's #1 Construction Price Platform
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
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

          {/* Right panel — stat cards */}
          <div className="hidden md:grid grid-cols-2 gap-3">
            {[
              { value: stats.prices,       label: 'Listed Prices',       icon: '📊' },
              { value: stats.suppliers,    label: 'Verified Suppliers',  icon: '🏪' },
              { value: stats.contractors,  label: 'Verified Contractors',icon: '👷' },
              { value: stats.materials,    label: 'Material Types',      icon: '📦' },
            ].map(s => (
              <div key={s.label}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-white text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-3xl font-extrabold">{s.value}</div>
                <div className="text-xs text-gray-300 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
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
              <p className="text-xl font-extrabold text-primary-600">{s.value}</p>
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
              className={`group flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border ${cat.color} ${cat.border} hover:shadow-md hover:-translate-y-0.5 transition-all text-center`}>
              <span className="text-3xl">{cat.emoji}</span>
              <span className={`text-xs font-semibold leading-tight ${cat.text}`}>{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Why BuildPriceGambia ─────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-14 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: TrendingDown,   title: 'Compare Prices',      desc: "Every supplier's price side by side. Pick the best deal instantly." },
            { icon: Zap,            title: 'Live Results',         desc: 'Prices updated by suppliers in real time — always current.' },
            { icon: MessageSquare,  title: 'WhatsApp Bot',         desc: 'Message us on WhatsApp. Get prices without opening a browser.' },
            { icon: ShieldCheck,    title: 'Verified Suppliers',   desc: 'Every listed supplier is reviewed and verified before going live.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-start gap-3">
              <div className="p-3 bg-primary-50 rounded-xl">
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
          <h2 className="text-xl font-bold text-gray-900">Latest Prices</h2>
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
                  <p className="text-2xl font-extrabold text-primary-600 mt-2">
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
          Send "cement price" and get instant results — no app download needed
        </p>
        <a href="https://wa.me/220XXXXXXXX?text=cement%20price" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-[#075E54] font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-lg">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Chat on WhatsApp
        </a>
      </section>
    </div>
  )
}
