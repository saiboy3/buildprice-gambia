import Providers from '@/components/Providers'
import AdminNav from './AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen flex">
        <AdminNav />
        <main className="flex-1 bg-gray-50 min-h-screen">{children}</main>
      </div>
    </Providers>
  )
}
