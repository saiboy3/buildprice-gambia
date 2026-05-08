import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'
import Footer from '@/components/Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </Providers>
  )
}
