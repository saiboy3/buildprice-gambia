import type { Metadata } from 'next'
import { Suspense } from 'react'
import SearchClient from './SearchClient'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Search Construction Material Prices',
  description:
    'Search and compare construction material prices across verified suppliers in The Gambia. Find the best price for cement, rebar, sand, timber, zinc sheets and more in GMD.',
  openGraph: {
    title: 'Search Construction Material Prices in The Gambia',
    description:
      'Compare prices for cement, rebar, sand, timber and more across verified Gambian suppliers.',
  },
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-primary-500" />
      </div>
    }>
      <SearchClient />
    </Suspense>
  )
}
