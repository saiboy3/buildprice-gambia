const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverComponentsExternalPackages: ['@prisma/client'], instrumentationHook: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
}

// Sentry is a no-op until NEXT_PUBLIC_SENTRY_DSN / SENTRY_DSN are set in Vercel.
// Source map upload (SENTRY_ORG / SENTRY_PROJECT / SENTRY_AUTH_TOKEN) is optional —
// the build simply skips it with a warning if those aren't configured.
module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: false,
  },
})
