import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-5xl mb-4">🏗️</p>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Supplier not found</h2>
      <p className="text-gray-500 mb-6 text-sm">This supplier profile doesn't exist or has been removed.</p>
      <Link href="/suppliers" className="btn-primary">View all suppliers</Link>
    </div>
  )
}
