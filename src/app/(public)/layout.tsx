import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'
import Footer from '@/components/Footer'
import WhatsAppBar from '@/components/WhatsAppBar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navbar />
      <main className="min-h-screen pb-16">{children}</main>
      <Footer />
      <WhatsAppBar />
    </Providers>
  )
}
