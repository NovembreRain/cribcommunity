'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Stay', href: '/locations' },
  { label: 'Experience', href: '/community/events' },
  { label: 'Community', href: '/community/our-story' },
] as const

export function NavBar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 pt-6">
      {/* Glass pill nav — exact Stitch pattern */}
      <nav
        className={cn(
          'flex items-center justify-between px-6 py-4 rounded-full border border-white/5 transition-all duration-300',
          scrolled
            ? 'bg-background-dark/90 backdrop-blur-md shadow-glass'
            : 'glass-panel'
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <span className="text-white font-display text-2xl font-bold italic tracking-tighter">
            Crib
          </span>
          <span className="text-primary not-italic text-4xl leading-none font-display">.</span>
        </Link>

        {/* Nav links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-xs font-bold uppercase tracking-widest text-white/80 hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/locations"
          className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase shadow-glow transition-all hover:shadow-glow-hover hover:-translate-y-0.5 active:translate-y-0"
        >
          Reserve
        </Link>
      </nav>
    </header>
  )
}
