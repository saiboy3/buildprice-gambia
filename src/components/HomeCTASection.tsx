'use client'
import { useT, useLang } from '@/lib/LanguageContext'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HomeCTASection() {
  const tr = useT()
  const { locale } = useLang()
  const isRTL = locale === 'ar'

  return (
    <section className="max-w-6xl mx-auto px-4 mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">{tr('home.cta.title')}</h2>
          <p className="text-primary-100 mb-4">{tr('home.cta.desc')}</p>
          <Link href="/search" className="bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors inline-flex items-center gap-2">
            {tr('home.cta.btn')} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
