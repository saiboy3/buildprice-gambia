'use client'
import { AuthProvider } from '@/lib/context'
import { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
