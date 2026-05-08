import type { Metadata } from 'next'
import SupplierProfileClient from './SupplierProfileClient'
import { localBusinessJsonLd, breadcrumbJsonLd } from '@/lib/seo'

const BASE_URL = 'https://buildprice-gambia.vercel.app'

interface SupplierApiData {
  id: string
  name: string
  location: string
  contact?: string
  verified?: boolean
  avgRating?: number
  reviewCount?: number
  description?: string | null
  prices?: Array<{ price: number; unit: string; material: { name: string }; supplier: { name: string; location: string } }>
}

async function fetchSupplier(id: string): Promise<SupplierApiData | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/suppliers/${id}`, {
      next: { revalidate: 3600 },
    })
    const json = await res.json()
    return json.ok ? (json.data as SupplierApiData) : null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const s = await fetchSupplier(params.id)
  if (!s) {
    return { title: 'Supplier Not Found' }
  }
  const description =
    s.description ??
    `${s.name} — verified construction materials supplier in ${s.location}, The Gambia. View current prices and contact details.`

  return {
    title: s.name,
    description,
    openGraph: {
      title: `${s.name} | BuildPriceGambia`,
      description,
      url: `${BASE_URL}/suppliers/${s.id}`,
    },
    alternates: {
      canonical: `${BASE_URL}/suppliers/${s.id}`,
    },
  }
}

export default async function SupplierPage({ params }: { params: { id: string } }) {
  const s = await fetchSupplier(params.id)

  const localBizLd = s
    ? localBusinessJsonLd({
        id: s.id,
        name: s.name,
        location: s.location,
        contact: s.contact,
        verified: s.verified,
        avgRating: s.avgRating,
        reviewCount: s.reviewCount,
        description: s.description,
      })
    : null

  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Suppliers', url: '/suppliers' },
    { name: s?.name ?? 'Supplier', url: `/suppliers/${params.id}` },
  ])

  return (
    <>
      {localBizLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBizLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <SupplierProfileClient />
    </>
  )
}
