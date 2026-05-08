import type { Metadata } from 'next'
import PriceHistoryClient from './PriceHistoryClient'
import { productJsonLd, breadcrumbJsonLd } from '@/lib/seo'

const BASE_URL = 'https://buildprice-gambia.vercel.app'

interface MaterialApiData {
  id: string
  name: string
  category: { name: string }
}

interface PriceApiData {
  id: string
  price: number
  unit: string
  stockStatus: string
  supplier: { id: string; name: string; location: string }
}

async function fetchMaterial(materialId: string): Promise<MaterialApiData | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/materials`, { next: { revalidate: 3600 } })
    const json = await res.json()
    if (!json.ok) return null
    return (json.data as MaterialApiData[]).find((m) => m.id === materialId) ?? null
  } catch {
    return null
  }
}

async function fetchPrices(materialId: string): Promise<PriceApiData[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/prices?material_id=${materialId}`, {
      next: { revalidate: 3600 },
    })
    const json = await res.json()
    return json.ok ? (json.data as PriceApiData[]) : []
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: { materialId: string }
}): Promise<Metadata> {
  const m = await fetchMaterial(params.materialId)
  if (!m) {
    return { title: 'Material Prices' }
  }
  const description = `Compare ${m.name} prices across suppliers in The Gambia. View price history, current listings and find the best deal in GMD.`

  return {
    title: `${m.name} Prices`,
    description,
    openGraph: {
      title: `${m.name} Prices in The Gambia | BuildPriceGambia`,
      description,
      url: `${BASE_URL}/prices/${m.id}`,
    },
    alternates: {
      canonical: `${BASE_URL}/prices/${m.id}`,
    },
  }
}

export default async function PricePage({ params }: { params: { materialId: string } }) {
  const [material, prices] = await Promise.all([
    fetchMaterial(params.materialId),
    fetchPrices(params.materialId),
  ])

  const productLd = material
    ? productJsonLd(material, prices.map((p) => ({
        price: p.price,
        unit: p.unit,
        supplier: { name: p.supplier.name, location: p.supplier.location },
      })))
    : null

  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Search', url: '/search' },
    { name: material ? `${material.name} Prices` : 'Material Prices', url: `/prices/${params.materialId}` },
  ])

  return (
    <>
      {productLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <PriceHistoryClient />
    </>
  )
}
