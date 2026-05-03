'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/context'
import {
  HardHat, LayoutDashboard, Package, Store, Users, ScrollText, LogOut, Hammer,
  AlertTriangle, BookOpen, ShieldCheck, Star, Wrench,
} from 'lucide-react'
import clsx from 'clsx'

const links = [
  { href: '/admin',                    label: 'Overview',            icon: LayoutDashboard },
  { href: '/admin/materials',          label: 'Materials',           icon: Package },
  { href: '/admin/suppliers',          label: 'Suppliers',           icon: Store },
  { href: '/admin/contractors',        label: 'Contractors',         icon: Hammer },
  { href: '/admin/users',              label: 'Users',               icon: Users },
  { href: '/admin/labour-rates',       label: 'Labour Rates',        icon: Wrench },
  { href: '/admin/fraud-alerts',       label: 'Fraud Alerts',        icon: AlertTriangle },
  { href: '/admin/guides',             label: 'Guides',              icon: BookOpen },
  { href: '/admin/verification',       label: 'Supplier Verification', icon: ShieldCheck },
  { href: '/admin/promoted-listings',  label: 'Promoted Listings',   icon: Star },
  { href: '/admin/logs',               label: 'Activity',            icon: ScrollText },
]

export default function AdminNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="w-56 bg-gray-900 text-gray-300 flex flex-col shrink-0">
      <div className="px-5 py-4 border-b border-gray-700">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-sm">
          <HardHat size={18} className="text-primary-400" /> BuildPriceGambia
        </Link>
        <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === href
                ? 'bg-primary-600 text-white font-medium'
                : 'hover:bg-gray-800 hover:text-white'
            )}
          >
            <Icon size={15} /> {label}
          </Link>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-gray-700 text-xs">
        <p className="font-medium text-white">{user?.name}</p>
        <button onClick={logout} className="flex items-center gap-1.5 mt-2 text-gray-400 hover:text-red-400 transition-colors">
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </aside>
  )
}
