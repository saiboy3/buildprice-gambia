'use client'
import { useLang } from '@/lib/LanguageContext'

export default function LanguageToggle() {
  const { locale, setLocale } = useLang()
  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'wo' : 'en')}
      className="text-xs font-semibold px-2 py-1 rounded border border-gray-300 hover:border-primary-400 transition-colors"
      title="Switch language / Soppeel làkk"
    >
      {locale === 'en' ? '🇬🇲 Wolof' : '🇬🇧 English'}
    </button>
  )
}
