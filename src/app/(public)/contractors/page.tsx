import type { Metadata } from 'next'
import ContractorsClient from './ContractorsClient'

export const metadata: Metadata = {
  title: 'Find Contractors',
  description:
    'Find verified, rated construction contractors across The Gambia. Browse masons, roofers, electricians, plumbers, carpenters and more by specialty and location.',
  openGraph: {
    title: 'Find Construction Contractors in The Gambia',
    description:
      'Browse vetted, rated contractors across The Gambia — masons, roofers, electricians, plumbers and more.',
  },
}

export default function ContractorsPage() {
  return <ContractorsClient />
}
