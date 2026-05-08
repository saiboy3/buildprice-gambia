'use client'
import { useLang } from '@/lib/LanguageContext'
import type { Locale } from '@/lib/i18n'

const LANGS: { code: Locale; label: string; flag: string; dir?: 'rtl' }[] = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'wo', label: 'Wolof',    flag: '🇬🇲' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'عربي',     flag: '🇲🇷', dir: 'rtl' },
]

export default function LanguageToggle() {
  const { locale, setLocale } = useLang()
  const current = LANGS.find(l => l.code === locale) ?? LANGS[0]

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-primary-400 bg-white transition-colors"
        title="Switch language"
        aria-label="Select language"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[130px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {LANGS.map(lang => (
          <button
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            dir={lang.dir}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
              locale === lang.code ? 'text-primary-600 font-semibold bg-primary-50' : 'text-gray-700'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
