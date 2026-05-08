'use client'
import { useT } from '@/lib/LanguageContext'

export default function HomeLatestHeading() {
  const tr = useT()
  return (
    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
      {tr('home.latest')}
      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        LIVE
      </span>
    </h2>
  )
}
