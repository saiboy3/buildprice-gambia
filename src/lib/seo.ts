const SITE_URL = 'https://buildprice-gambia.vercel.app'
const SITE_NAME = 'BuildPriceGambia'

// ── Organization ──────────────────────────────────────────────────────────────

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      'Real-time construction material prices in The Gambia (GMD). Compare supplier prices, find contractors, track price history.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'GM',
      addressLocality: 'Banjul',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
    sameAs: [],
  }
}

// ── WebSite + SearchAction ────────────────────────────────────────────────────

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'The Gambia\'s #1 platform for real-time construction material prices. Compare cement, rebar, sand, timber and more across verified suppliers.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// ── LocalBusiness (supplier pages) ───────────────────────────────────────────

export interface SupplierForJsonLd {
  id: string
  name: string
  location: string
  contact?: string | null
  verified?: boolean
  avgRating?: number
  reviewCount?: number
  description?: string | null
}

export function localBusinessJsonLd(supplier: SupplierForJsonLd) {
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: supplier.name,
    url: `${SITE_URL}/suppliers/${supplier.id}`,
    description:
      supplier.description ??
      `${supplier.name} — construction materials supplier in ${supplier.location}, The Gambia.`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: supplier.location,
      addressCountry: 'GM',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Gambia',
    },
  }

  if (supplier.contact) {
    ld.telephone = supplier.contact
  }

  if (supplier.avgRating && supplier.reviewCount && supplier.reviewCount > 0) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: supplier.avgRating,
      reviewCount: supplier.reviewCount,
      bestRating: 5,
      worstRating: 1,
    }
  }

  return ld
}

// ── Product (material price pages) ───────────────────────────────────────────

export interface MaterialForJsonLd {
  id: string
  name: string
  category?: { name: string } | null
}

export interface PriceForJsonLd {
  price: number
  unit: string
  supplier: { name: string; location: string }
}

export function productJsonLd(material: MaterialForJsonLd, prices: PriceForJsonLd[]) {
  const sortedPrices = [...prices].sort((a, b) => a.price - b.price)
  const minPrice = sortedPrices[0]?.price
  const maxPrice = sortedPrices[sortedPrices.length - 1]?.price

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: material.name,
    description: `Compare ${material.name} prices across suppliers in The Gambia. Find the best deal in GMD.`,
    category: material.category?.name ?? 'Building Materials',
    url: `${SITE_URL}/prices/${material.id}`,
    offers:
      prices.length > 0
        ? {
            '@type': 'AggregateOffer',
            priceCurrency: 'GMD',
            lowPrice: minPrice,
            highPrice: maxPrice,
            offerCount: prices.length,
            offers: sortedPrices.map((p) => ({
              '@type': 'Offer',
              price: p.price,
              priceCurrency: 'GMD',
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: p.price,
                priceCurrency: 'GMD',
                unitText: p.unit,
              },
              seller: {
                '@type': 'LocalBusiness',
                name: p.supplier.name,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: p.supplier.location,
                  addressCountry: 'GM',
                },
              },
            })),
          }
        : undefined,
  }
}

// ── Article (guide pages) ─────────────────────────────────────────────────────

export interface GuideForJsonLd {
  slug: string
  title: string
  content?: string | null
  category?: string | null
}

export function articleJsonLd(guide: GuideForJsonLd) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description:
      guide.content
        ? guide.content.slice(0, 160).replace(/\n/g, ' ')
        : `${guide.title} — construction guide for The Gambia.`,
    url: `${SITE_URL}/guides/${guide.slug}`,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    inLanguage: 'en',
    about: guide.category ?? 'Construction',
  }
}

// ── BreadcrumbList ────────────────────────────────────────────────────────────

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

// ── FAQPage ───────────────────────────────────────────────────────────────────

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  }
}
