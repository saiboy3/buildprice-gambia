import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <footer className="bg-white border-t border-gray-200 mt-16 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} BuildPriceGambia · Real-time construction prices in The Gambia
      </footer>
    </Providers>
  )
}
