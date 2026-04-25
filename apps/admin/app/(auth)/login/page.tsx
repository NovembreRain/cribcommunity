import { type Metadata } from 'next'
import { adminLogin } from './actions'

export const metadata: Metadata = { title: 'Sign In — Crib Admin' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-0.5 mb-2">
            <span className="font-display text-3xl font-bold italic text-text-high tracking-tighter">Crib</span>
            <span className="text-primary font-display text-5xl leading-none">.</span>
          </div>
          <p className="text-text-low text-xs uppercase tracking-[0.2em]">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-surface-dark border border-gold-border/20 rounded-2xl p-8 space-y-6">
          <div>
            <h1 className="font-display text-2xl text-text-high mb-1">Sign in</h1>
            <p className="text-text-low text-sm">Enter your admin password to continue.</p>
          </div>

          {error === 'invalid' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              Incorrect password. Try again.
            </div>
          )}

          <form action={adminLogin} className="space-y-4">
            <input type="hidden" name="next" value={next ?? '/'} />
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                required
                placeholder="••••••••••••"
                className="w-full bg-background-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl text-sm font-bold tracking-[0.1em] uppercase transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center text-text-low/40 text-xs">
          Crib Community · Admin {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
