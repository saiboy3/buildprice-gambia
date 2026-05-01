import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navbar />
      <main className="min-h-screen bg-gray-50">{children}</main>
    </Providers>
  )
}
