import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

const BASE_URL = 'https://buildprice-gambia.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                  lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/search`,      lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/suppliers`,   lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/contractors`, lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/map`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/forum`,       lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/guides`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/rfq`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE_URL}/estimator`,   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ]

  // Dynamic pages — fetch in parallel
  const [suppliers, contractors, guides, materials] = await Promise.all([
    prisma.supplier.findMany({
      where: { verified: true },
      select: { id: true, updatedAt: true },
    }),
    prisma.contractor.findMany({
      where: { verified: true },
      select: { id: true, updatedAt: true },
    }),
    prisma.materialGuide.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.material.findMany({
      select: { id: true, updatedAt: true },
    }),
  ])

  const supplierPages: MetadataRoute.Sitemap = suppliers.map((s) => ({
    url: `${BASE_URL}/suppliers/${s.id}`,
    lastModified: s.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const contractorPages: MetadataRoute.Sitemap = contractors.map((c) => ({
    url: `${BASE_URL}/contractors/${c.id}`,
    lastModified: c.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const guidePages: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${BASE_URL}/guides/${g.slug}`,
    lastModified: g.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const materialPages: MetadataRoute.Sitemap = materials.map((m) => ({
    url: `${BASE_URL}/prices/${m.id}`,
    lastModified: m.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [
    ...staticPages,
    ...supplierPages,
    ...contractorPages,
    ...guidePages,
    ...materialPages,
  ]
}
