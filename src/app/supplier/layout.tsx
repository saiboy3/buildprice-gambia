import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { LayoutDashboard, BarChart2, ShieldCheck, FileText, Key, MapPin } from 'lucide-react'

const supplierLinks = [
  { href: '/supplier/dashboard',      label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/supplier/analytics',      label: 'Analytics',       icon: BarChart2 },
  { href: '/supplier/verification',   label: 'Verification',    icon: ShieldCheck },
  { href: '/supplier/rfq',            label: 'RFQ Quotes',      icon: FileText },
  { href: '/supplier/api-keys',       label: 'API Keys',        icon: Key },
  { href: '/supplier/delivery-areas', label: 'Delivery Areas',  icon: MapPin },
]

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50">
        {/* Supplier sidebar */}
        <aside className="hidden md:flex w-48 bg-white border-r border-gray-200 flex-col shrink-0">
          <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Supplier</p>
            {supplierLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-colors"
              >
                <Icon size={15} /> {label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </Providers>
  )
}
