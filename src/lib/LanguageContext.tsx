'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import { type Locale } from './i18n'

type LangCtx = { locale: Locale; setLocale: (l: Locale) => void }
const LangContext = createContext<LangCtx>({ locale: 'en', setLocale: () => {} })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en')
  return <LangContext.Provider value={{ locale, setLocale }}>{children}</LangContext.Provider>
}

export function useLang() { return useContext(LangContext) }
