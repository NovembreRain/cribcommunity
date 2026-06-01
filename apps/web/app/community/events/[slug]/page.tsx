import { type Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { prisma } from '@crib/db'
import { formatDateTime } from '@crib/lib'
import { NavBar } from '@/components/home/NavBar'
import { LucideIcon } from '@/components/location/LucideIcon'
import { registerForEvent } from './actions'
import { Footer } from '@/components/home/Footer'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { name: true, description: true },
  })
  if (!event) return {}
  return {
    title: `${event.name} — Crib Community`,
    description: event.description ?? undefined,
  }
}

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ registered?: string }>
}) {
  const [{ slug }, { registered }] = await Promise.all([params, searchParams])

  const event = await prisma.event.findUnique({
    where: { slug, is_approved: true },
    include: {
      location: { select: { name: true, city: true, state: true } },
      _count: { select: { registrations: true } },
    },
  })
  if (!event) notFound()

  const isPast = event.start_datetime < new Date()
  const images = Array.isArray(event.images) ? (event.images as string[]) : []
  const coverImage = images[0] ?? null

  return (
    <main className="min-h-screen bg-background-dark">
      <NavBar />

      {/* Hero banner — full-bleed with overlay */}
      <div className="relative pt-20 h-[50vh] min-h-[320px] flex items-end overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={event.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-dark to-background-dark" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-background-dark/10" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 pb-10 w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-text-low mb-4">
            <Link href="/community/events" className="hover:text-primary transition-colors">
              Events
            </Link>
            <LucideIcon name="chevron-right" size={12} className="text-text-low/40" />
            <span className="text-text-medium line-clamp-1">{event.name}</span>
          </nav>

          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center rounded-full bg-primary/15 border border-primary/25 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary backdrop-blur-sm">
              {event.type}
            </span>
            {isPast && (
              <span className="text-text-low/60 text-xs uppercase tracking-wider">Past event</span>
            )}
          </div>

          <h1 className="font-display text-4xl md:text-5xl text-text-high leading-tight">
            {event.name}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {event.description && (
          <p className="text-text-medium text-lg leading-relaxed">{event.description}</p>
        )}

        {/* Detail panel */}
        <div className="glass-panel rounded-2xl p-6 border border-gold-border/20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <LucideIcon name="calendar" size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-text-low text-xs uppercase tracking-[0.1em] mb-1">Date & Time</p>
                <p className="text-text-high font-medium">{formatDateTime(event.start_datetime)}</p>
                <p className="text-text-low text-xs mt-0.5">until {formatDateTime(event.end_datetime)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <LucideIcon name="map-pin" size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-text-low text-xs uppercase tracking-[0.1em] mb-1">Location</p>
                <p className="text-text-high font-medium">{event.location.name}</p>
                <p className="text-text-low text-xs mt-0.5">
                  {event.location.city}, {event.location.state}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <LucideIcon name="users" size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-text-low text-xs uppercase tracking-[0.1em] mb-1">Registrations</p>
                <p className="text-text-high font-medium">{event._count.registrations} people</p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration / past state */}
        {isPast ? (
          <div className="glass-panel rounded-2xl p-8 border border-gold-border/10 text-center space-y-3">
            <p className="text-text-low text-sm">This event has already taken place.</p>
            <Link
              href="/community/events"
              className="inline-flex items-center gap-1.5 text-primary text-sm hover:underline"
            >
              View upcoming events
              <LucideIcon name="arrow-right" size={14} />
            </Link>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-6 border border-gold-border/20">
            {registered === 'true' ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto">
                  <LucideIcon name="check" size={28} className="text-emerald-400" />
                </div>
                <div>
                  <p className="font-display text-2xl text-text-high">You&apos;re registered!</p>
                  <p className="text-text-medium text-sm mt-1">
                    We&apos;ll see you there. Check your email for details.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-xl text-text-high">Register for this Event</h2>
                  <p className="text-text-low text-xs mt-1">Free to attend · Spots are limited</p>
                </div>
                <form action={registerForEvent} className="space-y-4">
                  <input type="hidden" name="event_id" value={event.id} />
                  <Field label="Your Name *" name="name" placeholder="Jane Doe" />
                  <Field label="Email *" name="email" placeholder="jane@example.com" type="email" />
                  <Field label="Phone" name="phone" placeholder="+91 98765 43210" type="tel" />
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl text-sm font-bold tracking-[0.1em] uppercase transition-colors shadow-glow hover:shadow-glow-hover"
                  >
                    Register Now
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        <Link
          href="/community/events"
          className="inline-flex items-center gap-1.5 text-text-low hover:text-primary transition-colors text-xs uppercase tracking-[0.15em] font-bold"
        >
          <LucideIcon name="arrow-left" size={12} />
          Back to Events
        </Link>
      </div>

      <Footer />
    </main>
  )
}

function Field({
  label,
  name,
  placeholder,
  type = 'text',
}: {
  label: string
  name: string
  placeholder?: string
  type?: string
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full bg-background-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10 transition-colors"
      />
    </div>
  )
}
