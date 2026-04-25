import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@crib/db'
import { formatDateTime } from '@crib/lib'
import { NavBar } from '@/components/home/NavBar'
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react'
import { registerForEvent } from './actions'
import { Footer } from '@/components/home/Footer'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const event = await prisma.event.findUnique({ where: { slug }, select: { name: true, description: true } })
  if (!event) return {}
  return {
    title: `${event.name} — Crib Community`,
    description: event.description ?? undefined,
  }
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await prisma.event.findUnique({
    where: { slug, is_approved: true },
    include: {
      location: { select: { name: true, city: true, state: true } },
      _count: { select: { registrations: true } },
    },
  })
  if (!event) notFound()

  const isPast = event.start_datetime < new Date()

  return (
    <main className="min-h-screen bg-background-dark">
      <NavBar />
      <div className="pt-32" />

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-text-low">
          <Link href="/community/events" className="hover:text-text-medium transition-colors">Events</Link>
          <ChevronRight size={12} />
          <span className="text-text-medium">{event.name}</span>
        </nav>

        {/* Header */}
        <div className="space-y-4">
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-primary/15 text-primary border-primary/20">
            {event.type}
          </span>
          <h1 className="font-display text-4xl text-text-high">{event.name}</h1>
          {event.description && (
            <p className="text-text-medium text-lg leading-relaxed">{event.description}</p>
          )}
        </div>

        {/* Details */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-gold-border/20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-text-low text-xs uppercase tracking-[0.1em] mb-1">Date & Time</p>
                <p className="text-text-high">{formatDateTime(event.start_datetime)}</p>
                <p className="text-text-low text-xs">→ {formatDateTime(event.end_datetime)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-text-low text-xs uppercase tracking-[0.1em] mb-1">Location</p>
                <p className="text-text-high">{event.location.name}</p>
                <p className="text-text-low text-xs">{event.location.city}, {event.location.state}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users size={16} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-text-low text-xs uppercase tracking-[0.1em] mb-1">Registrations</p>
                <p className="text-text-high">{event._count.registrations} people</p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration form */}
        {!isPast && (
          <div className="glass-panel rounded-2xl p-6 border border-gold-border/20 space-y-5">
            <h2 className="font-display text-xl text-text-high">Register for this Event</h2>
            <form action={registerForEvent} className="space-y-4">
              <input type="hidden" name="event_id" value={event.id} />
              <Field label="Your Name *" name="name" placeholder="Jane Doe" />
              <Field label="Email *" name="email" placeholder="jane@example.com" />
              <Field label="Phone" name="phone" placeholder="+91 98765 43210" />
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl text-sm font-bold tracking-[0.1em] uppercase transition-colors"
              >
                Register Now
              </button>
            </form>
          </div>
        )}

        {isPast && (
          <div className="glass-panel rounded-2xl p-6 border border-gold-border/20 text-center">
            <p className="text-text-low text-sm">This event has already taken place.</p>
            <Link href="/community/events" className="text-primary text-sm hover:underline mt-2 inline-block">
              View upcoming events →
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}

function Field({ label, name, placeholder }: { label: string; name: string; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        className="w-full bg-background-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors"
      />
    </div>
  )
}
