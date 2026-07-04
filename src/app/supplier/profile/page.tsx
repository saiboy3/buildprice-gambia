import type { Metadata } from 'next'
import SupplierProfileWizard from '@/components/SupplierProfileWizard'

export const metadata: Metadata = {
  title: 'Business Profile',
  robots: { index: false },
}

export default function SupplierProfilePage() {
  return <SupplierProfileWizard />
}
