import Link from 'next/link'
import { BookOpen, ExternalLink } from 'lucide-react'

type Guide = {
  id: string; slug: string; title: string; category: string
  published: boolean; materialId?: string | null
  material?: { id: string; name: string } | null
}

async function getGuides(): Promise<Guide[]> {
  try {
    const res  = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/guides?published=true`, {
      next: { revalidate: 300 },
    })
    const json = await res.json()
    return json.ok ? json.data : []
  } catch { return [] }
}

export default async function GuidesPage() {
  const guides = await getGuides()

  const categories = ['All', ...new Set(guides.map(g => g.category).filter(Boolean))]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
          <BookOpen size={26} className="text-primary-500" />
          Building Guides
        </h1>
        <p className="text-gray-500">Practical guides for building materials, construction techniques, and best practices in The Gambia.</p>
      </div>

      {guides.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
          <p>No guides available yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {guides.map(g => (
            <Link key={g.id} href={`/guides/${g.slug}`}
              className="card hover:border-primary-200 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <BookOpen size={18} className="text-primary-500 shrink-0 mt-0.5" />
                <ExternalLink size={14} className="text-gray-300 group-hover:text-primary-400 transition-colors shrink-0 mt-0.5" />
              </div>
              <h2 className="font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">{g.title}</h2>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {g.category && (
                  <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full capitalize font-medium">
                    {g.category}
                  </span>
                )}
                {g.material && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {g.material.name}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
