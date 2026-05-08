import Link from 'next/link'
import { HardHat, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <HardHat size={22} className="text-primary-400" />
            <span className="text-white font-bold text-lg">BuildPrice<span className="text-primary-400">Gambia</span></span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            The Gambia&apos;s first real-time construction material price comparison platform.
            Helping builders, contractors, and developers make smarter purchasing decisions.
          </p>
          <div className="flex gap-3 mt-4">
            {/* WhatsApp */}
            <a href="https://wa.me/220XXXXXXXX" className="w-9 h-9 bg-green-600 hover:bg-green-500 rounded-lg flex items-center justify-center transition-colors" aria-label="WhatsApp">
              <Phone size={16} className="text-white" />
            </a>
            <a href="mailto:hello@buildpricegambia.com" className="w-9 h-9 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors" aria-label="Email">
              <Mail size={16} className="text-white" />
            </a>
          </div>
        </div>

        {/* Platform links */}
        <div>
          <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Platform</h3>
          <ul className="space-y-2 text-sm">
            {[
              ['Search Prices',  '/search'],
              ['Suppliers',      '/suppliers'],
              ['Contractors',    '/contractors'],
              ['Map',            '/map'],
              ['Estimator',      '/estimator'],
            ].map(([label, href]) => (
              <li key={href}><Link href={href} className="hover:text-primary-400 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Resources links */}
        <div>
          <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Resources</h3>
          <ul className="space-y-2 text-sm">
            {[
              ['Construction Guides', '/guides'],
              ['Forum',              '/forum'],
              ['Get Quotes',         '/rfq'],
              ['Finance',            '/finance'],
              ['Fraud Alerts',       '/fraud-alerts'],
            ].map(([label, href]) => (
              <li key={href}><Link href={href} className="hover:text-primary-400 transition-colors">{label}</Link></li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-1.5 text-xs">
            <MapPin size={12} className="text-primary-400" />
            <span>The Gambia 🇬🇲</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} BuildPriceGambia. All rights reserved. Prices in Gambian Dalasi (GMD).
      </div>
    </footer>
  )
}
