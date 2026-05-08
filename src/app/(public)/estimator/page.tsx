import type { Metadata } from 'next'
import EstimatorClient from './EstimatorClient'

export const metadata: Metadata = {
  title: 'Construction Cost Estimator',
  description:
    'Free construction cost estimator for The Gambia. Enter your building dimensions and get an instant Bill of Quantities with current market prices for cement, blocks, rebar, zinc sheets and more in GMD.',
  openGraph: {
    title: 'Free Construction Cost Estimator for The Gambia',
    description:
      'Get an instant Bill of Quantities with live market prices for your building project in The Gambia.',
  },
}

export default function EstimatorPage() {
  return <EstimatorClient />
}
