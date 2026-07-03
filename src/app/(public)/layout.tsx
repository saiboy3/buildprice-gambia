import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'
import Footer from '@/components/Footer'
import WhatsAppBar from '@/components/WhatsAppBar'
import AnalyticsTracker from '@/components/AnalyticsTracker'
import FeedbackWidget from '@/components/FeedbackWidget'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navbar />
      <AnalyticsTracker />
      <main className="min-h-screen pb-16">{children}</main>
      <Footer />
      <WhatsAppBar />
      <FeedbackWidget />
    </Providers>
  )
}
