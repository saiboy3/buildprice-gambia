import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, ChevronLeft, Package } from 'lucide-react'
import { notFound } from 'next/navigation'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo'

const BASE_URL = 'https://buildprice-gambia.vercel.app'

type Guide = {
  id: string; slug: string; title: string; category: string
  content: string; published: boolean
  material?: { id: string; name: string } | null
}

async function getGuide(slug: string): Promise<Guide | null> {
  try {
    const res  = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/guides/${slug}`, {
      next: { revalidate: 300 },
    })
    const json = await res.json()
    return json.ok ? json.data : null
  } catch { return null }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const guide = await getGuide(params.slug)
  if (!guide || !guide.published) {
    return { title: 'Guide Not Found' }
  }
  const description = guide.content
    ? guide.content.slice(0, 160).replace(/\n/g, ' ')
    : `${guide.title} — construction guide for The Gambia.`

  return {
    title: guide.title,
    description,
    openGraph: {
      title: `${guide.title} | BuildPriceGambia`,
      description,
      url: `${BASE_URL}/guides/${guide.slug}`,
    },
    alternates: {
      canonical: `${BASE_URL}/guides/${guide.slug}`,
    },
  }
}

export default async function GuideDetailPage({ params }: { params: { slug: string } }) {
  const guide = await getGuide(params.slug)
  if (!guide || !guide.published) notFound()

  const articleLd = articleJsonLd({
    slug: guide.slug,
    title: guide.title,
    content: guide.content,
    category: guide.category,
  })

  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: guide.title, url: `/guides/${guide.slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/guides" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} /> All Guides
        </Link>

        <div className="card">
          <div className="flex items-start gap-3 mb-5">
            <BookOpen size={22} className="text-primary-500 shrink-0 mt-1" />
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {guide.category && (
                  <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full capitalize font-medium">
                    {guide.category}
                  </span>
                )}
                {guide.material && (
                  <Link href={`/search?q=${encodeURIComponent(guide.material.name)}`}
                    className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors">
                    <Package size={10} /> {guide.material.name}
                  </Link>
                )}
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900">{guide.title}</h1>
            </div>
          </div>

          {/* Content */}
          <div className="border-t border-gray-100 pt-5">
            {guide.content.split('\n\n').map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4 last:mb-0 text-sm">
                {para}
              </p>
            ))}
          </div>

          {/* Related material CTA */}
          {guide.material && (
            <div className="mt-6 bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-primary-900 text-sm">See prices for {guide.material.name}</p>
                <p className="text-xs text-primary-600">Compare suppliers across The Gambia.</p>
              </div>
              <Link href={`/search?q=${encodeURIComponent(guide.material.name)}`} className="btn-primary text-sm shrink-0">
                View prices
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
