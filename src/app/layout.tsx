import type { Metadata, Viewport } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/lib/LanguageContext'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'

const inter  = Inter({  subsets: ['latin'], variable: '--font-inter',  display: 'swap' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap', weight: ['400','600','700','800'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://buildprice-gambia.vercel.app'),
  title: {
    template: '%s | BuildPriceGambia',
    default: 'BuildPriceGambia – Construction Material Prices in The Gambia',
  },
  description:
    'Real-time construction material prices in The Gambia (GMD). Compare cement, rebar, sand, timber and more across verified suppliers. Find contractors, estimate project costs and track price history.',
  keywords: [
    'construction materials Gambia',
    'cement price Gambia',
    'building materials Banjul',
    'rebar price Gambia',
    'construction suppliers Gambia',
    'building costs Gambia',
    'sand price Gambia',
    'timber price Gambia',
    'zinc sheets Gambia',
    'construction estimator Gambia',
  ],
  authors: [{ name: 'BuildPriceGambia', url: 'https://buildprice-gambia.vercel.app' }],
  creator: 'BuildPriceGambia',
  publisher: 'BuildPriceGambia',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_GM',
    url: 'https://buildprice-gambia.vercel.app',
    siteName: 'BuildPriceGambia',
    title: 'BuildPriceGambia – Construction Material Prices in The Gambia',
    description:
      'Real-time construction material prices in The Gambia (GMD). Compare cement, rebar, sand, timber and more across verified suppliers.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BuildPriceGambia – Construction Material Prices in The Gambia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BuildPriceGambia – Construction Material Prices in The Gambia',
    description:
      'Real-time construction material prices in The Gambia (GMD). Compare suppliers and find contractors.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://buildprice-gambia.vercel.app',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#d97706',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d97706" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{})`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
      </head>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
