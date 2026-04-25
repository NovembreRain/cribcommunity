'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronDown, Menu, X } from 'lucide-react'

const COMMUNITY_LINKS = [
  { label: 'Our Story', href: '/community/our-story', desc: 'How Crib came to be' },
  { label: 'Events', href: '/community/events', desc: 'Workshops, music & gatherings' },
  { label: 'Blog', href: '/community/blog', desc: 'Stories from the road' },
  { label: 'FAQ', href: '/community/faq', desc: 'Everything you need to know' },
]

export function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [communityOpen, setCommunityOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCommunityOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close everything on route change
  useEffect(() => {
    setCommunityOpen(false)
    setMobileOpen(false)
  }, [pathname])

  const linkClass = (href: string) =>
    cn(
      'text-xs font-bold uppercase tracking-widest transition-colors',
      pathname === href || pathname.startsWith(href + '/')
        ? 'text-primary'
        : 'text-white/80 hover:text-primary'
    )

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 pt-6">
      <nav
        className={cn(
          'flex items-center justify-between px-6 py-4 rounded-full border border-white/5 transition-all duration-300',
          scrolled ? 'bg-background-dark/90 backdrop-blur-md shadow-glass' : 'glass-panel'
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <span className="text-white font-display text-2xl font-bold italic tracking-tighter">Crib</span>
          <span className="text-primary not-italic text-4xl leading-none font-display">.</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className={linkClass('/__home__')}>Home</Link>
          <Link href="/locations" className={linkClass('/locations')}>Stay</Link>

          {/* Community dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setCommunityOpen((v) => !v)}
              className={cn(
                'flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-colors',
                pathname.startsWith('/community')
                  ? 'text-primary'
                  : 'text-white/80 hover:text-primary'
              )}
            >
              Community
              <ChevronDown
                size={12}
                className={cn('transition-transform duration-200', communityOpen && 'rotate-180')}
              />
            </button>

            {communityOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-background-dark/95 backdrop-blur-md border border-gold-border/20 rounded-2xl shadow-glass overflow-hidden">
                <div className="p-2">
                  {COMMUNITY_LINKS.map(({ label, href, desc }) => (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'flex flex-col px-4 py-3 rounded-xl transition-colors group',
                        pathname.startsWith(href)
                          ? 'bg-primary/10 text-primary'
                          : 'text-text-medium hover:bg-white/5 hover:text-text-high'
                      )}
                    >
                      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
                      <span className="text-text-low text-xs mt-0.5 group-hover:text-text-low">{desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link href="/community/jobs" className={linkClass('/community/jobs')}>Join Us</Link>
          <Link href="/contact" className={linkClass('/contact')}>Contact</Link>
        </div>

        {/* Right: Reserve + mobile menu */}
        <div className="flex items-center gap-3">
          <Link
            href="/locations"
            className="hidden md:block bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase shadow-glow transition-all hover:shadow-glow-hover hover:-translate-y-0.5 active:translate-y-0"
          >
            Reserve
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white/80 hover:text-primary transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 bg-background-dark/95 backdrop-blur-md border border-gold-border/20 rounded-2xl shadow-glass overflow-hidden">
          <div className="p-4 space-y-1">
            <MobileLink href="/" label="Home" />
            <MobileLink href="/locations" label="Stay" />
            <div className="px-4 pt-3 pb-1">
              <p className="text-text-low text-xs uppercase tracking-[0.15em] font-bold mb-2">Community</p>
              {COMMUNITY_LINKS.map(({ label, href }) => (
                <MobileLink key={href} href={href} label={label} indent />
              ))}
            </div>
            <MobileLink href="/community/jobs" label="Join Us" />
            <MobileLink href="/contact" label="Contact" />
            <div className="pt-3 px-1">
              <Link
                href="/locations"
                className="block w-full text-center bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full text-xs font-bold tracking-[0.15em] uppercase transition-colors"
              >
                Reserve
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function MobileLink({ href, label, indent }: { href: string; label: string; indent?: boolean }) {
  const pathname = usePathname()
  return (
    <Link
      href={href}
      className={cn(
        'block px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors',
        indent && 'pl-8 text-xs',
        pathname === href || (href !== '/' && pathname.startsWith(href))
          ? 'bg-primary/10 text-primary'
          : 'text-text-medium hover:bg-white/5 hover:text-text-high'
      )}
    >
      {label}
    </Link>
  )
}
