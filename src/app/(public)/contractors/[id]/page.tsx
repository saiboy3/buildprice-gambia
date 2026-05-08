import type { Metadata } from 'next'
import ContractorProfileClient from './ContractorProfileClient'
import { breadcrumbJsonLd } from '@/lib/seo'

const BASE_URL = 'https://buildprice-gambia.vercel.app'

interface ContractorApiData {
  id: string
  name: string
  specialty: string
  location: string
  bio?: string
  verified?: boolean
  avgRating?: number
  reviewCount?: number
}

async function fetchContractor(id: string): Promise<ContractorApiData | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/contractors/${id}`, {
      next: { revalidate: 3600 },
    })
    const json = await res.json()
    return json.ok ? (json.data as ContractorApiData) : null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const c = await fetchContractor(params.id)
  if (!c) {
    return { title: 'Contractor Not Found' }
  }
  const description =
    c.bio ??
    `${c.name} — ${c.specialty} contractor based in ${c.location}, The Gambia.`

  return {
    title: c.name,
    description,
    openGraph: {
      title: `${c.name} | BuildPriceGambia`,
      description,
      url: `${BASE_URL}/contractors/${c.id}`,
    },
    alternates: {
      canonical: `${BASE_URL}/contractors/${c.id}`,
    },
  }
}

export default async function ContractorPage({ params }: { params: { id: string } }) {
  const c = await fetchContractor(params.id)

  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Contractors', url: '/contractors' },
    { name: c?.name ?? 'Contractor', url: `/contractors/${params.id}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ContractorProfileClient />
    </>
  )
}
