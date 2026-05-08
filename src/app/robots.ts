import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*',            allow: '/', disallow: ['/admin', '/supplier/', '/contractor/', '/api/'] },
      { userAgent: 'GPTBot',       allow: '/' },
      { userAgent: 'ClaudeBot',    allow: '/' },
      { userAgent: 'PerplexityBot',allow: '/' },
      { userAgent: 'Googlebot',    allow: '/' },
    ],
    sitemap: 'https://buildprice-gambia.vercel.app/sitemap.xml',
  }
}
