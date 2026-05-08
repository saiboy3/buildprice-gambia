'use client'
import { useState } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { useLang } from '@/lib/LanguageContext'

const WA_NUMBER = '2203456789' // replace with real number
const WA_MESSAGES: Record<string, string> = {
  en: 'Hi! I want to check construction material prices in The Gambia.',
  wo: 'Salam! Damay bëgg xam prix yi ci construction ci Gambia.',
  fr: 'Bonjour ! Je veux vérifier les prix des matériaux de construction en Gambie.',
  ar: 'مرحبا! أريد معرفة أسعار مواد البناء في غامبيا.',
}

const LABELS: Record<string, { heading: string; sub: string; cta: string }> = {
  en: { heading: 'Check prices on WhatsApp', sub: 'Message us for instant price quotes · No app needed', cta: 'Chat now' },
  wo: { heading: 'Xam prix yi ci WhatsApp',  sub: 'Yónneel message bi ngir prix yi',                   cta: 'Tëral' },
  fr: { heading: 'Vérifiez les prix sur WhatsApp', sub: 'Envoyez-nous un message pour les prix instantanés', cta: 'Démarrer' },
  ar: { heading: 'تحقق من الأسعار عبر واتساب', sub: 'أرسل لنا رسالة للحصول على أسعار فورية',           cta: 'ابدأ' },
}

function WhatsAppSVG() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export default function WhatsAppBar() {
  const [dismissed, setDismissed] = useState(false)
  const { locale } = useLang()
  const label  = LABELS[locale] ?? LABELS.en
  const waText = WA_MESSAGES[locale] ?? WA_MESSAGES.en
  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`
  const isRTL  = locale === 'ar'

  if (dismissed) {
    return (
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 transition-all hover:scale-110 active:scale-95"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppSVG />
      </a>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#075E54] text-white shadow-2xl border-t border-[#064d45]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Icon + text */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center shrink-0 shadow-lg animate-pulse">
            <WhatsAppSVG />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight">{label.heading}</p>
            <p className="text-green-200 text-xs truncate">{label.sub}</p>
          </div>
        </div>

        {/* CTA + dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-2"
          >
            <MessageCircle size={15} />
            <span className="hidden sm:inline">{label.cta}</span>
            <span className="sm:hidden">Chat</span>
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="text-green-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
