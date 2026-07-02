'use client'
import { useT, useLang } from '@/lib/LanguageContext'
import Link from 'next/link'
import { ArrowRight, HardHat, MessageCircle } from 'lucide-react'

const WA_NUMBER = '2203456789' // replace with real number

export default function HomeCTASection() {
  const tr = useT()
  const { locale } = useLang()
  const isRTL = locale === 'ar'

  return (
    <section className="max-w-3xl mx-auto px-4 py-14 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 font-display">{tr('home.cta.title')}</h2>
      <p className="text-gray-500 mb-8">{tr('home.cta.desc')}</p>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
        <Link href="/search" className="btn-primary justify-center px-6 py-3">
          {tr('home.cta.btn')} <ArrowRight size={16} />
        </Link>
        <Link href="/contractors" className="btn-secondary justify-center px-6 py-3">
          <HardHat size={16} /> {tr('home.contractors.btn')}
        </Link>
        <a
          href={`https://wa.me/${WA_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 border border-[#25D366]/30 text-[#075E54] bg-[#25D366]/10 hover:bg-[#25D366]/15 font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
        >
          <MessageCircle size={16} /> {tr('home.cta.whatsapp')}
        </a>
      </div>
    </section>
  )
}
