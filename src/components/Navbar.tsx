'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/context'
import { useState } from 'react'
import {
  Menu, X, HardHat, LogOut, LayoutDashboard, Bell,
  Map, MessageSquare, BookOpen, FileText, BarChart2, Key, Hammer,
  ChevronDown,
} from 'lucide-react'
import LanguageToggle from '@/components/LanguageToggle'

const mainLinks = [
  { href: '/search',      label: 'Prices' },
  { href: '/suppliers',   label: 'Suppliers' },
  { href: '/estimator',   label: 'Estimator' },
  { href: '/contractors', label: 'Contractors' },
  { href: '/map',         label: 'Map',     icon: Map },
  { href: '/forum',       label: 'Forum',   icon: MessageSquare },
  { href: '/guides',      label: 'Guides',  icon: BookOpen },
  { href: '/rfq',         label: 'Get Quotes', icon: FileText },
]

export default function Navbar() {
  const { user, logout, isAdmin, isSupplier, isContractor } = useAuth()
  const [open,        setOpen]        = useState(false)
  const [supplierDdOpen, setSupplierDdOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary-600 shrink-0">
          <HardHat size={22} />
          <span>BuildPrice<span className="text-gray-900">Gambia</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3 text-sm font-medium text-gray-600 flex-1 justify-end">
          {mainLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-primary-600 transition-colors whitespace-nowrap">
              {label}
            </Link>
          ))}

          {user && (
            <Link href="/alerts" className="flex items-center gap-1 hover:text-primary-600 transition-colors">
              <Bell size={15} /> Alerts
            </Link>
          )}

          {isContractor && (
            <Link href="/contractor/dashboard" className="flex items-center gap-1 hover:text-primary-600 transition-colors">
              <Hammer size={15} /> Contractor Dashboard
            </Link>
          )}

          {isSupplier && !isAdmin && (
            <div className="relative">
              <button
                onClick={() => setSupplierDdOpen(s => !s)}
                className="flex items-center gap-1 hover:text-primary-600 transition-colors"
              >
                <LayoutDashboard size={15} /> Supplier <ChevronDown size={12} />
              </button>
              {supplierDdOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
                  onMouseLeave={() => setSupplierDdOpen(false)}
                >
                  <Link href="/supplier/dashboard"     onClick={() => setSupplierDdOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"><LayoutDashboard size={14} /> Dashboard</Link>
                  <Link href="/supplier/analytics"     onClick={() => setSupplierDdOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"><BarChart2 size={14} /> Analytics</Link>
                  <Link href="/supplier/api-keys"      onClick={() => setSupplierDdOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"><Key size={14} /> API Keys</Link>
                </div>
              )}
            </div>
          )}

          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-1 hover:text-primary-600 transition-colors text-purple-700">
              Admin
            </Link>
          )}

          <LanguageToggle />

          {user ? (
            <div className="flex items-center gap-3 border-l border-gray-200 pl-3 ml-1">
              <span className="text-gray-800 max-w-[100px] truncate">{user.name}</span>
              <button onClick={logout} className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                <LogOut size={15} /> Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-gray-200 pl-3 ml-1">
              <Link href="/login"    className="btn-secondary text-xs px-3 py-1.5">Sign in</Link>
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
          <Link href="/search"      onClick={() => setOpen(false)}>Prices</Link>
          <Link href="/suppliers"   onClick={() => setOpen(false)}>Suppliers</Link>
          <Link href="/estimator"   onClick={() => setOpen(false)}>Estimator</Link>
          <Link href="/contractors" onClick={() => setOpen(false)}>Contractors</Link>
          <Link href="/map"         onClick={() => setOpen(false)}>Map</Link>
          <Link href="/forum"       onClick={() => setOpen(false)}>Forum</Link>
          <Link href="/guides"      onClick={() => setOpen(false)}>Guides</Link>
          <Link href="/rfq"         onClick={() => setOpen(false)}>Get Quotes</Link>

          {user && (
            <Link href="/alerts" onClick={() => setOpen(false)} className="flex items-center gap-1">
              <Bell size={14} /> Alerts
            </Link>
          )}

          {isContractor && (
            <Link href="/contractor/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-1">
              <Hammer size={14} /> Contractor Dashboard
            </Link>
          )}

          {isSupplier && !isAdmin && (
            <>
              <Link href="/supplier/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link href="/supplier/analytics" onClick={() => setOpen(false)}>Analytics</Link>
              <Link href="/supplier/api-keys"  onClick={() => setOpen(false)}>API Keys</Link>
            </>
          )}

          {isAdmin && (
            <Link href="/admin" onClick={() => setOpen(false)} className="text-purple-700">Admin Panel</Link>
          )}

          <div className="pt-1">
            <LanguageToggle />
          </div>

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
