import { type Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
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

// Use design-system tokens only — no hardcoded tailwind colours
const EVENT_TYPE_STYLES: Record<string, { badge: string; dot: string }> = {
  social:   { badge: 'bg-primary/10 text-primary border-primary/20',         dot: 'bg-primary' },
  workshop: { badge: 'bg-gold-border/20 text-text-medium border-gold-border/30', dot: 'bg-gold-border' },
  music:    { badge: 'bg-white/10 text-text-high border-white/15',            dot: 'bg-white/60' },
  wellness: { badge: 'bg-primary/10 text-primary border-primary/15',          dot: 'bg-primary/70' },
}
const TYPE_LABELS: Record<string, string> = {
  social: 'Social', workshop: 'Workshop', music: 'Music', wellness: 'Wellness',
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams

  const [events, faqs] = await Promise.all([
    prisma.event.findMany({
      where: { is_approved: true, ...(type ? { type } : {}) },
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
  const past     = events.filter((e) => e.start_datetime < new Date())

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
        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-10 flex-wrap">
          {[null, ...eventTypes].map((t) => (
            <Link
              key={t ?? 'all'}
              href={t ? `/community/events?type=${t}` : '/community/events'}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] border transition-colors ${
                (!type && !t) || type === t
                  ? 'bg-primary text-white border-primary shadow-glow'
                  : 'glass-panel border-gold-border/20 text-text-low hover:text-text-medium hover:border-primary/20'
              }`}
            >
              {t ? (TYPE_LABELS[t] ?? t) : 'All'}
            </Link>
          ))}
        </div>

        {events.length === 0 ? (
          <div className="glass-panel rounded-2xl p-16 text-center border border-gold-border/10">
            <p className="text-text-low text-sm">
              No events found{type ? ` for "${TYPE_LABELS[type] ?? type}"` : ''}.
            </p>
            {type && (
              <Link href="/community/events" className="text-primary text-xs hover:underline mt-3 inline-block">
                View all events →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {upcoming.length > 0 && (
              <div className="space-y-5">
                <p className="text-xs uppercase tracking-[0.2em] text-text-low font-bold flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-primary/40" />
                  Upcoming
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcoming.map((event, i) => (
                    <EventCard key={event.id} event={event} delay={i} />
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div className="space-y-5">
                <p className="text-xs uppercase tracking-[0.2em] text-text-low font-bold flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-white/15" />
                  Past Events
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
                  {past.map((event, i) => (
                    <EventCard key={event.id} event={event} delay={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SectionShell>

      {faqs.length > 0 && <FAQSection faqs={faqs} title="Events FAQ" />}
      <Footer />
    </main>
  )
}

function EventCard({
  event,
  delay,
}: {
  event: {
    id: string
    name: string
    slug: string
    type: string
    images: unknown
    start_datetime: Date
    end_datetime: Date
    description: string | null
    location: { name: string; city: string }
    _count: { registrations: number }
  }
  delay: number
}) {
  const style = EVENT_TYPE_STYLES[event.type] ?? {
    badge: 'bg-white/10 text-text-low border-white/10',
    dot: 'bg-white/40',
  }
  const images = Array.isArray(event.images) ? (event.images as string[]) : []
  const coverImage = images[0] ?? null

  return (
    <Link
      href={`/community/events/${event.slug}`}
      className="glass-panel rounded-2xl border border-gold-border/15 hover:border-primary/30 transition-all duration-300 overflow-hidden group block hover:-translate-y-0.5 hover:shadow-glow"
      style={{ animationDelay: `${delay * 0.06}s` }}
    >
      {/* Cover image */}
      <div className="relative h-44 bg-surface-dark overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={event.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-dark to-background-dark flex items-end p-4">
            <span className="text-gold-border/20 font-display text-6xl italic leading-none">
              {event.name[0]}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark/60 to-transparent" />
        {/* Type badge over image */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${style.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {TYPE_LABELS[event.type] ?? event.type}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 space-y-3">
        <h3 className="font-display text-lg text-text-high group-hover:text-primary transition-colors leading-tight line-clamp-2">
          {event.name}
        </h3>
        {event.description && (
          <p className="text-text-low text-sm leading-relaxed line-clamp-2">{event.description}</p>
        )}
        <div className="space-y-1.5 pt-1 border-t border-gold-border/10">
          <p className="flex items-center gap-2 text-xs text-text-low">
            <Calendar size={11} className="text-primary/60 shrink-0" />
            {formatDateTime(event.start_datetime)}
          </p>
          <p className="flex items-center gap-2 text-xs text-text-low">
            <MapPin size={11} className="text-primary/60 shrink-0" />
            {event.location.name} · {event.location.city}
          </p>
          <p className="flex items-center gap-2 text-xs text-text-low">
            <Users size={11} className="text-primary/60 shrink-0" />
            {event._count.registrations} registered
          </p>
        </div>
      </div>
    </Link>
  )
}
