import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, Store, HardHat, User, MessageCircle, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Test Credentials | BuildPriceGambia',
  robots: { index: false },
}

export default async function TestPage() {
  let dbOk = false
  let counts = { suppliers: 0, materials: 0, prices: 0, contractors: 0 }
  try {
    const { prisma } = await import('@/lib/db')
    const [s, m, p, c] = await Promise.all([
      prisma.supplier.count(), prisma.material.count(),
      prisma.price.count(), prisma.contractor.count(),
    ])
    counts = { suppliers: s, materials: m, prices: p, contractors: c }
    dbOk = p > 0
  } catch {}

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* DB Status Banner */}
      {!dbOk ? (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <strong>⚠️ Database appears empty</strong> — run <code className="bg-red-100 px-1 rounded">npx prisma db seed</code> locally or trigger seed in production to populate test data.
          <div className="mt-1 text-xs text-red-500">Counts: {counts.suppliers} suppliers · {counts.materials} materials · {counts.prices} prices · {counts.contractors} contractors</div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <strong>✅ Database ready</strong> — {counts.suppliers} suppliers · {counts.materials} materials · {counts.prices} prices · {counts.contractors} contractors
        </div>
      )}

      <div className="mb-8">
        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full mb-3">🧪 TEST MODE</span>
        <h1 className="text-3xl font-extrabold text-gray-900">Testing Guide</h1>
        <p className="text-gray-500 mt-2">All credentials and flows needed to test the BuildPriceGambia platform.</p>
      </div>

      {/* Credentials grid */}
      <div className="grid md:grid-cols-2 gap-5 mb-10">

        {/* Admin */}
        <div className="card border-l-4 border-l-purple-500">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={18} className="text-purple-600" />
            <h2 className="font-bold text-gray-900">Admin Account</h2>
          </div>
          <div className="space-y-1 text-sm font-mono bg-gray-50 rounded-lg p-3">
            <p><span className="text-gray-500">Phone:</span> <strong>0000000000</strong></p>
            <p><span className="text-gray-500">Password:</span> <strong>admin123</strong></p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/login" className="btn-secondary text-xs">Login</Link>
            <Link href="/admin" className="btn-primary text-xs">Admin Panel →</Link>
          </div>
          <p className="text-xs text-gray-400 mt-2">Access: user management, supplier verification, analytics, guides, fraud alerts</p>
        </div>

        {/* Supplier 1 */}
        <div className="card border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 mb-3">
            <Store size={18} className="text-blue-600" />
            <h2 className="font-bold text-gray-900">Supplier — Banjul</h2>
          </div>
          <div className="space-y-1 text-sm font-mono bg-gray-50 rounded-lg p-3">
            <p><span className="text-gray-500">Name:</span> <strong>Banjul Building Supplies</strong></p>
            <p><span className="text-gray-500">Phone:</span> <strong>2201001001</strong></p>
            <p><span className="text-gray-500">Password:</span> <strong>supplier123</strong></p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/login" className="btn-secondary text-xs">Login</Link>
            <Link href="/supplier/dashboard" className="btn-primary text-xs">Supplier Dashboard →</Link>
          </div>
          <p className="text-xs text-gray-400 mt-2">Test: update prices, view analytics, export CSV, manage delivery areas</p>
        </div>

        {/* Supplier 2 */}
        <div className="card border-l-4 border-l-blue-400">
          <div className="flex items-center gap-2 mb-3">
            <Store size={18} className="text-blue-500" />
            <h2 className="font-bold text-gray-900">Supplier — Serrekunda</h2>
          </div>
          <div className="space-y-1 text-sm font-mono bg-gray-50 rounded-lg p-3">
            <p><span className="text-gray-500">Name:</span> <strong>Serrekunda Hardware Store</strong></p>
            <p><span className="text-gray-500">Phone:</span> <strong>2201002002</strong></p>
            <p><span className="text-gray-500">Password:</span> <strong>supplier123</strong></p>
          </div>
          <div className="mt-3 flex gap-2">
            <Link href="/login" className="btn-secondary text-xs">Login</Link>
            <Link href="/supplier/dashboard" className="btn-primary text-xs">Dashboard →</Link>
          </div>
        </div>

        {/* Contractor */}
        <div className="card border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 mb-3">
            <HardHat size={18} className="text-amber-600" />
            <h2 className="font-bold text-gray-900">Contractor — Banjul</h2>
          </div>
          <div className="space-y-1 text-sm font-mono bg-gray-50 rounded-lg p-3">
            <p><span className="text-gray-500">Name:</span> <strong>Omar Jallow Construction</strong></p>
            <p><span className="text-gray-500">Phone:</span> <strong>2202001001</strong></p>
            <p><span className="text-gray-500">Password:</span> <strong>contractor123</strong></p>
          </div>
          <div className="mt-3 flex gap-2">
            <Link href="/login" className="btn-secondary text-xs">Login</Link>
            <Link href="/contractor/dashboard" className="btn-primary text-xs">Dashboard →</Link>
          </div>
          <p className="text-xs text-gray-400 mt-2">Test: view leads, manage projects, update profile</p>
        </div>

        {/* Buyer */}
        <div className="card border-l-4 border-l-green-500 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <User size={18} className="text-green-600" />
            <h2 className="font-bold text-gray-900">Buyer / Public User</h2>
          </div>
          <p className="text-sm text-gray-600 mb-3">Register a new account to test the buyer experience:</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/register" className="btn-primary text-sm">Register new account →</Link>
            <Link href="/search" className="btn-secondary text-sm">Browse prices (no login needed)</Link>
          </div>
          <p className="text-xs text-gray-400 mt-2">Test: search prices, set price alerts, submit RFQ, browse suppliers &amp; contractors, leave reviews</p>
        </div>
      </div>

      {/* Key flows to test */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-900 mb-4 text-lg">Key Flows to Test</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Search & compare prices', href: '/search?q=cement', emoji: '🔍' },
            { label: 'View supplier profile',   href: '/suppliers',       emoji: '🏪' },
            { label: 'Browse contractors',       href: '/contractors',     emoji: '👷' },
            { label: 'Use cost estimator',       href: '/estimator',       emoji: '📐' },
            { label: 'View map',                 href: '/map',             emoji: '🗺️' },
            { label: 'Submit RFQ for quote',     href: '/rfq',             emoji: '📋' },
            { label: 'Price history chart',      href: '/prices/mat-cement-opc', emoji: '📈' },
            { label: 'Read guides',              href: '/guides',          emoji: '📚' },
            { label: 'Forum',                    href: '/forum',           emoji: '💬' },
            { label: 'Switch language (FR/AR)',  href: '/',                emoji: '🌍' },
          ].map(f => (
            <Link key={f.href} href={f.href}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <span>{f.emoji}</span>
              <span className="font-medium text-gray-700">{f.label}</span>
              <ExternalLink size={12} className="ml-auto text-gray-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* WhatsApp Bot Testing */}
      <div className="card bg-[#075E54] text-white mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center">
            <MessageCircle size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">WhatsApp Bot Testing</h2>
            <p className="text-green-200 text-sm">Test commands you can send to the WhatsApp bot</p>
          </div>
        </div>
        <div className="bg-[#064d45] rounded-xl p-4 space-y-2 text-sm font-mono">
          {[
            ['hi', 'Show main menu'],
            ['cement', 'Get cement prices from all suppliers'],
            ['rebar', 'Get rebar prices'],
            ['find cement Banjul', 'Find cement in Banjul specifically'],
            ['2', 'List verified suppliers'],
            ['3', 'List top contractors'],
            ['estimate 100', 'Get quick estimate for 100 m²'],
            ['contractor mason', 'Find masonry contractors'],
            ['alert cement 700', 'Set a price alert'],
            ['6', 'Browse construction guides'],
          ].map(([cmd, desc]) => (
            <div key={cmd} className="flex items-start gap-3">
              <code className="bg-[#25D366]/20 text-green-200 px-2 py-0.5 rounded text-xs whitespace-nowrap">{cmd}</code>
              <span className="text-green-100 text-xs">{desc}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg text-yellow-200 text-xs">
          ⚠️ <strong>To enable real WhatsApp replies:</strong> Set <code>WHATSAPP_PHONE_NUMBER_ID</code>, <code>WHATSAPP_ACCESS_TOKEN</code>, <code>WHATSAPP_VERIFY_TOKEN</code>, and <code>WHATSAPP_APP_SECRET</code> (for signature verification) in Vercel environment variables, then register the webhook URL at Meta Business Manager:<br />
          <code className="text-yellow-100 break-all">https://buildprice-gambia.vercel.app/api/whatsapp/webhook</code>
        </div>
      </div>

      {/* Vercel env vars needed */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-3">Environment Variables Checklist</h2>
        <div className="space-y-2 text-sm">
          {[
            { key: 'DATABASE_URL', status: 'required', note: 'PostgreSQL connection string (Neon)' },
            { key: 'JWT_SECRET', status: 'required', note: 'Random 32+ char string for auth tokens' },
            { key: 'WHATSAPP_PHONE_NUMBER_ID', status: 'for-whatsapp', note: 'From Meta Business → WhatsApp → API Setup' },
            { key: 'WHATSAPP_ACCESS_TOKEN', status: 'for-whatsapp', note: 'Permanent access token from Meta' },
            { key: 'WHATSAPP_VERIFY_TOKEN', status: 'for-whatsapp', note: 'Any random string — must match Meta webhook config' },
            { key: 'WHATSAPP_APP_SECRET', status: 'for-whatsapp', note: 'Meta App Dashboard → Settings → Basic. Verifies incoming webhook signatures.' },
            { key: 'NEXT_PUBLIC_SENTRY_DSN', status: 'for-monitoring', note: 'sentry.io → create a Next.js project → copy DSN. Catches client-side errors.' },
            { key: 'SENTRY_DSN', status: 'for-monitoring', note: 'Same DSN as above — used for server/edge error reporting.' },
            { key: 'UPSTASH_REDIS_REST_URL', status: 'for-performance', note: 'Vercel Marketplace → Upstash → Install (auto-injects this + the token below).' },
            { key: 'UPSTASH_REDIS_REST_TOKEN', status: 'for-performance', note: 'Speeds up rate limiting — falls back to DB-based limiting if unset.' },
            { key: 'NEXT_PUBLIC_APP_URL', status: 'optional', note: 'https://buildprice-gambia.vercel.app' },
          ].map(v => (
            <div key={v.key} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono shrink-0">{v.key}</code>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                v.status === 'required' ? 'bg-red-100 text-red-700' :
                v.status === 'for-whatsapp' ? 'bg-green-100 text-green-700' :
                v.status === 'for-monitoring' ? 'bg-purple-100 text-purple-700' :
                v.status === 'for-performance' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-500'
              }`}>
                {v.status === 'required' ? 'Required' : v.status === 'for-whatsapp' ? 'WhatsApp' : v.status === 'for-monitoring' ? 'Monitoring' : v.status === 'for-performance' ? 'Performance' : 'Optional'}
              </span>
              <span className="text-xs text-gray-500">{v.note}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
          <strong>Webhook URL for Meta:</strong><br />
          <code className="text-xs break-all">https://buildprice-gambia.vercel.app/api/whatsapp/webhook</code>
        </div>
      </div>
    </div>
  )
}
