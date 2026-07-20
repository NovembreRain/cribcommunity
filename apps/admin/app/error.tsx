'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-background-dark flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <p className="text-primary text-xs uppercase tracking-[0.2em] font-bold">Something went wrong</p>
        <h1 className="font-display text-4xl text-text-high">Action Failed</h1>
        <p className="text-text-low text-sm">
          {error.message || 'Something broke while processing that action. No changes were saved.'}
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/bookings"
            className="glass-panel border border-gold-border/20 text-text-medium hover:text-text-high px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-colors"
          >
            Back to Bookings
          </Link>
        </div>
      </div>
    </main>
  )
}
