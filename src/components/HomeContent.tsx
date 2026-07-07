'use client'
import { useT, useLang } from '@/lib/LanguageContext'
import Link from 'next/link'
import { CATEGORY_META, unsplashSrcSet, IMG_WIDTHS } from '@/lib/visual'
import { TrendingDown, Zap, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react'
import SponsoredBanner from '@/components/SponsoredBanner'

export default function HomeContent() {
  const tr = useT()
  const { locale } = useLang()
  const isRTL = locale === 'ar'

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sponsored (homepage placement) */}
      <section className="max-w-6xl mx-auto px-4 pt-8">
        <SponsoredBanner placement="HOMEPAGE" page="/" className="space-y-2" />
      </section>

      {/* Browse by Category */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">{tr('home.categories')}</h2>
          <Link href="/search" className="text-sm text-primary-600 hover:underline font-medium flex items-center gap-1">
            {tr('home.categories.all')} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORY_META.map(cat => (
            <Link key={cat.label} href={`/search?q=${encodeURIComponent(cat.query)}`}
              className="group rounded-2xl border-2 border-cream-200 bg-white overflow-hidden hover:border-primary-300 hover:shadow-md transition-all cursor-pointer">
              <div className="h-24 sm:h-28 w-full overflow-hidden">
                <img
                  src={cat.image}
                  srcSet={unsplashSrcSet(cat.image, IMG_WIDTHS.categoryTile)}
                  sizes="(min-width: 640px) 25vw, 50vw"
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <span className="block px-3 py-2.5 text-sm font-semibold leading-tight text-primary-900 group-hover:text-primary-600 text-center">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Why BuildPriceGambia */}
      <section className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <h2 className="text-lg font-bold text-gray-900 text-center mb-8">{tr('home.why.title')}</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: TrendingDown,  titleKey: 'home.why.compare',   descKey: 'home.why.compare.desc' },
              { icon: Zap,           titleKey: 'home.why.live',      descKey: 'home.why.live.desc' },
              { icon: MessageSquare, titleKey: 'home.why.whatsapp',  descKey: 'home.why.whatsapp.desc' },
              { icon: ShieldCheck,   titleKey: 'home.why.verified',  descKey: 'home.why.verified.desc' },
            ].map(({ icon: Icon, titleKey, descKey }) => (
              <div key={titleKey} className="flex flex-col items-center text-center gap-2.5 sm:items-start sm:text-left">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-50">
                  <Icon size={18} className="text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{tr(titleKey)}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{tr(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
