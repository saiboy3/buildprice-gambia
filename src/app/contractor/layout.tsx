'use client'

import { useEffect, ReactNode } from 'react'
import { useAuth } from '@/lib/context'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, FolderKanban, Users, HardHat, LogOut, Loader2 } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { href: '/contractor/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/contractor/projects',  label: 'My Projects', icon: FolderKanban },
  { href: '/contractor/leads',     label: 'Leads',       icon: Users },
]

export default function ContractorLayout({ children }: { children: ReactNode }) {
  const { user, isContractor, logout, loading } = useAuth() as any
  const router   = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'CONTRACTOR')) {
      router.push('/login')
    }
  }, [user, loading])

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 size={28} className="animate-spin text-primary-500" />
    </div>
  )

  if (!user || user.role !== 'CONTRACTOR') return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <HardHat size={20} className="text-primary-500" />
            <span className="font-bold text-gray-900 text-sm">Contractor Portal</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 truncate">{user.name}</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={() => { logout(); router.push('/login') }}
            className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
