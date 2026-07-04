import type { Metadata } from 'next'
import ReportWizard from '@/components/ReportWizard'

export const metadata: Metadata = {
  title: 'Report a Price',
  description: 'Help track real construction material prices across The Gambia — takes about a minute, no account needed.',
}

export default function ReportPage() {
  return <ReportWizard />
}
