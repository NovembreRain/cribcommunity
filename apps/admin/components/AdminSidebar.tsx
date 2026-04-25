'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  MapPin,
  Building2,
  CalendarDays,
  BookOpen,
  Briefcase,
  MessageSquare,
  HelpCircle,
  Users,
  LogOut,
  Calendar,
} from 'lucide-react'
import { adminLogout } from '@/app/(auth)/login/actions'

const NAV_ITEMS = [
  { label: 'Dashboard',  href: '/',             icon: LayoutDashboard },
  { label: 'Locations',  href: '/locations',    icon: MapPin },
  { label: 'Properties', href: '/properties',   icon: Building2 },
  { label: 'Bookings',   href: '/bookings',     icon: Calendar },
  { label: 'Events',     href: '/events',       icon: CalendarDays },
  { label: 'Blog',       href: '/blog',         icon: BookOpen },
  { label: 'Jobs',       href: '/jobs',         icon: Briefcase },
  { label: 'Enquiries',  href: '/enquiries',    icon: MessageSquare },
  { label: 'FAQ',        href: '/faq',          icon: HelpCircle },
  { label: 'Users',      href: '/users',        icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-surface-dark border-r border-gold-border/20">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gold-border/20">
        <Link href="/" className="flex items-center gap-1">
          <span className="font-display text-xl font-bold italic text-text-high tracking-tighter">
            Crib
          </span>
          <span className="text-primary font-display text-3xl leading-none">.</span>
          <span className="text-text-low text-xs uppercase tracking-[0.2em] ml-1 mt-1">Admin</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-text-low hover:bg-white/5 hover:text-text-medium',
              )}
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gold-border/20">
        <button
          onClick={() => startTransition(() => adminLogout())}
          disabled={pending}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-text-low hover:bg-white/5 hover:text-text-medium transition-colors disabled:opacity-50"
        >
          <LogOut size={16} className="shrink-0" />
          {pending ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </aside>
  )
}
