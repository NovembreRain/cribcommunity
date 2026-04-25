import { prisma } from '@crib/db'
import { truncate, formatDateTime, formatDate } from '@crib/lib'
import { NavBar } from '@/components/home/NavBar'
import { Footer } from '@/components/home/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { SectionShell } from '@/components/home/SectionShell'
import { LocationCard } from '@/components/location/LocationCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [locations, events, posts, testimonials] = await Promise.all([
    prisma.location.findMany({
      take: 3,
      orderBy: { name: 'asc' },
      include: {
        properties: {
          take: 1,
          include: {
            room_types: {
              take: 1,
              select: { images: true },
            },
          },
        },
      },
    }),
    prisma.event.findMany({
      where: {
        is_approved: true,
        start_datetime: { gte: new Date() },
      },
      orderBy: { start_datetime: 'asc' },
      take: 3,
      include: { location: { select: { city: true } } },
    }),
    prisma.blogPost.findMany({
      where: { status: 'published' },
      orderBy: { published_at: 'desc' },
      take: 3,
      include: { category: { select: { name: true } } },
    }),
    prisma.testimonial.findMany({ take: 4 }),
  ])

  return (
    <main className="min-h-screen bg-background-dark">
      <NavBar />
      <HeroSection />

      {/* ── OUR LOCATIONS ── */}
      <SectionShell
        eyebrow="Where We Are"
        title="Our Locations"
        description="From ancient temples to coastal cliffs — each Crib is a world unto itself."
        className="bg-background-dark"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.length > 0
            ? locations.map((location, i) => {
                const firstImage = location.properties[0]?.room_types[0]?.images
                const images = Array.isArray(firstImage) ? (firstImage as string[]) : []
                const coverImage = images[0] ?? null
                const tagline = location.description
                  ? truncate(location.description, 70)
                  : `${location.city}, ${location.country}`

                const locationImages = Array.isArray(location.images) ? (location.images as string[]) : []
                return (
                  <LocationCard
                    key={location.id}
                    id={location.id}
                    slug={location.slug}
                    image={coverImage}
                    images={locationImages.length > 0 ? locationImages : coverImage ? [coverImage] : []}
                    name={location.name}
                    city={location.city}
                    country={location.country}
                    tagline={tagline}
                    index={i}
                  />
                )
              })
            : Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="glass-panel rounded-2xl h-80 animate-pulse flex items-end p-6"
                  aria-hidden="true"
                >
                  <div className="space-y-2 w-full">
                    <div className="h-3 w-24 bg-white/10 rounded" />
                    <div className="h-5 w-40 bg-white/10 rounded" />
                  </div>
                </div>
              ))}
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="/locations"
            className="inline-flex items-center text-primary hover:text-accent-amber transition-colors uppercase text-xs tracking-[0.2em] font-bold group border-b border-primary/30 hover:border-primary pb-1"
          >
            View All Locations
            <svg
              className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </SectionShell>

      <div className="max-w-7xl mx-auto px-6">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-gold-border/30 to-transparent" />
      </div>

      {/* ── COMMUNITY ── */}
      <SectionShell
        eyebrow="Life at Crib"
        title="The Community"
        description="Events, stories, and connections that outlast your stay."
        className="bg-background-dark"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Events */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              Upcoming Events
            </p>
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/community/events/${event.slug}`}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-primary text-xs font-bold">
                        {new Date(event.start_datetime).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-high text-sm group-hover:text-primary transition-colors truncate">
                        {event.name}
                      </p>
                      <p className="text-text-low text-xs">
                        {event.location.city} · {formatDateTime(event.start_datetime)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-text-low text-sm">No upcoming events — check back soon.</p>
            )}
            <a
              href="/community/events"
              className="inline-flex items-center text-primary hover:text-accent-amber transition-colors uppercase text-xs tracking-[0.2em] font-bold border-b border-primary/30 hover:border-primary pb-1 mt-2"
            >
              See All Events
            </a>
          </div>

          {/* Blog */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              The Journal
            </p>
            {posts.length > 0 ? (
              <div className="space-y-3">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/community/blog/${post.slug}`}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-surface-dark to-background-dark border border-gold-border/20 flex items-center justify-center shrink-0">
                      <span className="text-primary/30 font-display text-xl italic">C.</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-high text-sm group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </p>
                      <p className="text-text-low text-xs mt-0.5">
                        {post.category.name}
                        {post.published_at ? ` · ${formatDate(post.published_at)}` : ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-text-low text-sm">No posts published yet.</p>
            )}
            <a
              href="/community/blog"
              className="inline-flex items-center text-primary hover:text-accent-amber transition-colors uppercase text-xs tracking-[0.2em] font-bold border-b border-primary/30 hover:border-primary pb-1 mt-2"
            >
              Read the Journal
            </a>
          </div>
        </div>
      </SectionShell>

      <div className="max-w-7xl mx-auto px-6">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-gold-border/30 to-transparent" />
      </div>

      {/* ── TESTIMONIALS ── */}
      <SectionShell
        eyebrow="Voices"
        title="From the Tribe"
        description="Real people. Real stays. Real connections."
        className="bg-background-dark"
      >
        {testimonials.length > 0 ? (
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="glass-panel rounded-2xl p-6 min-w-[280px] snap-start space-y-4 shrink-0 border border-gold-border/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">
                      {t.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-text-high font-medium text-sm">{t.name}</p>
                </div>
                <p className="text-text-medium text-sm leading-relaxed">{t.text}</p>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <span
                      key={s}
                      className={`text-base ${s < t.rating ? 'text-primary' : 'text-white/10'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-12 text-center border border-gold-border/20">
            <p className="text-text-low text-sm">Testimonials coming soon.</p>
          </div>
        )}
      </SectionShell>

      <Footer />
    </main>
  )
}
