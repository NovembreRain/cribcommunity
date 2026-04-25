import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background-dark flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <p className="text-primary text-xs uppercase tracking-[0.2em] font-bold">404</p>
        <h1 className="font-display text-5xl text-text-high">Page Not Found</h1>
        <p className="text-text-low">
          This page wandered off. Maybe it's checking in somewhere else.
        </p>
        <Link
          href="/"
          className="inline-flex bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}
