import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@crib/db'
import { formatDateTime } from '@crib/lib'
import { NavBar } from '@/components/home/NavBar'
import { SectionShell } from '@/components/home/SectionShell'
import { Calendar, MapPin, Users } from 'lucide-react'
import { Footer } from '@/components/home/Footer'
import { FAQSection } from '@/components/home/FAQSection'

export const metadata: Metadata = {
  title: 'Events — Crib Community',
  description: 'Workshops, music nights, wellness sessions and community gatherings across all Crib locations.',
}
export const dynamic = 'force-dynamic'

const EVENT_TYPE_STYLES: Record<string, string> = {
  social:    'bg-blue-500/15 text-blue-400 border-blue-500/20',
  workshop:  'bg-primary/15 text-primary border-primary/20',
  music:     'bg-purple-500/15 text-purple-400 border-purple-500/20',
  wellness:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams

  const [events, faqs] = await Promise.all([
  prisma.event.findMany({
    where: {
      is_approved: true,
      ...(type ? { type } : {}),
    },
    orderBy: { start_datetime: 'asc' },
    include: {
      location: { select: { name: true, city: true } },
      _count: { select: { registrations: true } },
    },
  }),
  prisma.fAQ.findMany({ where: { context: 'events' }, orderBy: { sort_order: 'asc' } }),
])

  const eventTypes = ['social', 'workshop', 'music', 'wellness']
  const upcoming = events.filter((e) => e.start_datetime >= new Date())
  const past = events.filter((e) => e.start_datetime < new Date())

  return (
    <main className="min-h-screen bg-background-dark">
      <NavBar />
      <div className="pt-32" />

      <SectionShell
        eyebrow="Experience"
        title="Events & Gatherings"
        description="Connect with travellers, learn something new, or just vibe — there's always something happening."
        className="bg-background-dark pt-0"
      >
        {/* Type filter tabs */}
        <div className="flex items-center gap-2 mb-10 flex-wrap">
          <Link
            href="/community/events"
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] border transition-colors ${
              !type
                ? 'bg-primary text-white border-primary'
                : 'glass-panel border-gold-border/20 text-text-low hover:text-text-medium'
            }`}
          >
            All
          </Link>
          {eventTypes.map((t) => (
            <Link
              key={t}
              href={`/community/events?type=${t}`}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] border transition-colors ${
                type === t
                  ? 'bg-primary text-white border-primary'
                  : 'glass-panel border-gold-border/20 text-text-low hover:text-text-medium'
              }`}
            >
              {t}
            </Link>
          ))}
        </div>

        {events.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-gold-border/20">
            <p className="text-text-low">No events found{type ? ` for "${type}"` : ''}.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {upcoming.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-[0.15em] text-text-low font-medium">Upcoming</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcoming.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-[0.15em] text-text-low font-medium">Past Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                  {past.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SectionShell>

      {faqs.length > 0 && (
        <FAQSection faqs={faqs} title="Events FAQ" />
      )}
      <Footer />
    </main>
  )
}

function EventCard({
  event,
}: {
  event: {
    id: string
    name: string
    slug: string
    type: string
    start_datetime: Date
    end_datetime: Date
    description: string | null
    location: { name: string; city: string }
    _count: { registrations: number }
  }
}) {
  const isPast = event.start_datetime < new Date()
  const style = EVENT_TYPE_STYLES[event.type] ?? 'bg-white/10 text-text-low border-white/10'

  return (
    <Link
      href={`/community/events/${event.slug}`}
      className="glass-panel rounded-2xl border border-gold-border/20 hover:border-primary/30 transition-colors p-6 space-y-4 block group"
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
          {event.type}
        </span>
        {isPast && (
          <span className="text-text-low text-xs">Past</span>
        )}
      </div>
      <div>
        <h3 className="font-display text-lg text-text-high group-hover:text-primary transition-colors">{event.name}</h3>
        {event.description && (
          <p className="text-text-low text-sm mt-1 line-clamp-2">{event.description}</p>
        )}
      </div>
      <div className="space-y-1.5 text-xs text-text-low">
        <p className="flex items-center gap-2">
          <Calendar size={12} className="text-primary/60 shrink-0" />
          {formatDateTime(event.start_datetime)}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={12} className="text-primary/60 shrink-0" />
          {event.location.name} · {event.location.city}
        </p>
        <p className="flex items-center gap-2">
          <Users size={12} className="text-primary/60 shrink-0" />
          {event._count.registrations} registered
        </p>
      </div>
    </Link>
  )
}

