'use client'
import { useT, useLang } from '@/lib/LanguageContext'
import Link from 'next/link'
import { CATEGORY_META } from '@/lib/visual'
import { TrendingDown, Zap, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react'

export default function HomeContent() {
  const tr = useT()
  const { locale } = useLang()
  const isRTL = locale === 'ar'

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Browse by Category */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{tr('home.categories')}</h2>
          <Link href="/search" className="text-sm text-primary-600 hover:underline font-medium flex items-center gap-1">
            {tr('home.categories.all')} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORY_META.map(cat => (
            <Link key={cat.label} href={`/search?q=${encodeURIComponent(cat.query)}`}
              className={`card-lift group flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border ${cat.color} ${cat.border} text-center cursor-pointer`}>
              <div className="w-12 h-12 rounded-xl overflow-hidden group-hover:scale-110 transition-transform duration-200 shadow-sm">
                <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <span className={`text-xs font-semibold leading-tight ${cat.text}`}>{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Why BuildPriceGambia */}
      <section className="bg-gradient-to-b from-white to-amber-50/30 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">{tr('home.why.title')}</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: TrendingDown,  titleKey: 'home.why.compare',   descKey: 'home.why.compare.desc' },
              { icon: Zap,           titleKey: 'home.why.live',      descKey: 'home.why.live.desc' },
              { icon: MessageSquare, titleKey: 'home.why.whatsapp',  descKey: 'home.why.whatsapp.desc' },
              { icon: ShieldCheck,   titleKey: 'home.why.verified',  descKey: 'home.why.verified.desc' },
            ].map(({ icon: Icon, titleKey, descKey }) => (
              <div key={titleKey} className="card border-l-4 border-l-primary-400 flex flex-col gap-3 group">
                <div className="p-3 bg-primary-50 rounded-xl w-fit group-hover:rotate-6 transition-transform">
                  <Icon size={22} className="text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900">{tr(titleKey)}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{tr(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
