import { Suspense } from 'react'
import SearchClient from './SearchClient'
import { Loader2 } from 'lucide-react'

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
