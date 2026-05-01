import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <p className="text-6xl mb-4">🔍</p>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
      <Link href="/" className="btn-primary">Back to home</Link>
    </div>
  )
}
