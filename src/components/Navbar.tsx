'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/context'
import { useState } from 'react'
import { Menu, X, HardHat, LogOut, LayoutDashboard, Bell } from 'lucide-react'

export default function Navbar() {
  const { user, logout, isAdmin, isSupplier } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary-600">
          <HardHat size={22} />
          <span>BuildPrice<span className="text-gray-900">Gambia</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-600">
          <Link href="/search" className="hover:text-primary-600 transition-colors">Prices</Link>
          <Link href="/suppliers" className="hover:text-primary-600 transition-colors">Suppliers</Link>
          {user && (
            <Link href="/alerts" className="flex items-center gap-1 hover:text-primary-600 transition-colors">
              <Bell size={15} /> Alerts
            </Link>
          )}
          {isSupplier && (
            <Link href="/supplier/dashboard" className="flex items-center gap-1 hover:text-primary-600 transition-colors">
              <LayoutDashboard size={15} /> Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-1 hover:text-primary-600 transition-colors text-purple-700">
              Admin
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-400">|</span>
              <span className="text-gray-800">{user.name}</span>
              <button onClick={logout} className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                <LogOut size={15} /> Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-secondary text-xs px-3 py-1.5">Sign in</Link>
              <Link href="/register" className="btn-primary text-xs px-3 py-1.5">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-1 text-gray-600" onClick={() => setOpen(o => !o)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3 text-sm font-medium text-gray-700">
          <Link href="/search"    onClick={() => setOpen(false)}>Prices</Link>
          <Link href="/suppliers" onClick={() => setOpen(false)}>Suppliers</Link>
          {user && <Link href="/alerts"              onClick={() => setOpen(false)}>🔔 Alerts</Link>}
          {isSupplier && <Link href="/supplier/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>}
          {isAdmin    && <Link href="/admin"               onClick={() => setOpen(false)}>Admin Panel</Link>}
          {user ? (
            <button onClick={() => { logout(); setOpen(false) }} className="text-left text-red-500">Sign out</button>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link href="/login"    onClick={() => setOpen(false)} className="btn-secondary flex-1 text-center">Sign in</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="btn-primary flex-1 text-center">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
