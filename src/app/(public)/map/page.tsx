import type { Metadata } from 'next'
import MapClient from './MapClient'

export const metadata: Metadata = {
  title: 'Supplier & Contractor Map',
  description:
    'Explore an interactive map of verified construction material suppliers and contractors across The Gambia. Find businesses near you in Banjul, Serrekunda, Brikama and beyond.',
  openGraph: {
    title: 'Interactive Map of Suppliers & Contractors in The Gambia',
    description:
      'Find construction material suppliers and contractors near you on an interactive map of The Gambia.',
  },
}

export default function MapPage() {
  return <MapClient />
}
