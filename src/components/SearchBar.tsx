'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function SearchBar({
  defaultValue = '',
  placeholder = 'Search materials (cement, rebar, sand…)',
  large = false,
}: {
  defaultValue?: string
  placeholder?: string
  large?: boolean
}) {
  const [q, setQ] = useState(defaultValue)
  const router    = useRouter()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <form onSubmit={submit} className="flex gap-2 w-full">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={placeholder}
          className={`input pl-9 ${large ? 'py-3 text-base' : ''}`}
        />
      </div>
      <button type="submit" className={`btn-primary shrink-0 ${large ? 'px-6 py-3 text-base' : ''}`}>
        Search
      </button>
    </form>
  )
}
