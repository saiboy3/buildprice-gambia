'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif' }}>
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px',
        }}>
          <p style={{ fontSize: 40, marginBottom: 8 }}>⚠️</p>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20, maxWidth: 380 }}>
            We&apos;ve logged this error and will look into it. Please try again, or use the
            feedback button to tell us what happened.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: '#f09212', color: 'white', fontWeight: 600,
              padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
