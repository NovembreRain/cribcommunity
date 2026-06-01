import { prisma } from '@crib/db'
import { truncate, formatDateTime, formatDate } from '@crib/lib'
import { NavBar } from '@/components/home/NavBar'
import { Footer } from '@/components/home/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { SectionShell } from '@/components/home/SectionShell'
import { LocationCard } from '@/components/location/LocationCard'
import { LucideIcon } from '@/components/location/LucideIcon'
import Image from 'next/image'
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
          include: { room_types: { take: 1, select: { images: true } } },
        },
      },
    }),
    prisma.event.findMany({
      where: { is_approved: true, start_datetime: { gte: new Date() } },
      orderBy: { start_datetime: 'asc' },
      take: 3,
      include: { location: { select: { city: true, images: true } } },
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

      {/* ── LOCATIONS ────────────────────────────────────────────── */}
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
                const locationImages = Array.isArray(location.images)
                  ? (location.images as string[])
                  : []
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
                <div key={i} className="glass-panel rounded-2xl h-80 animate-pulse" aria-hidden="true" />
              ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/locations"
            className="inline-flex items-center gap-2 text-primary hover:text-accent-amber transition-colors uppercase text-xs tracking-[0.2em] font-bold group border-b border-primary/30 hover:border-primary pb-1"
          >
            View All Locations
            <LucideIcon name="arrow-right" size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </SectionShell>

      <Divider />

      {/* ── EVENTS ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-background-dark">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-gradient-to-r from-primary to-transparent" />
                Life at Crib
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-text-high mb-2">
                Events &amp; Gatherings
              </h2>
              <p className="text-text-medium font-light max-w-md text-sm">
                Connect with travellers, learn something new, or just vibe.
              </p>
            </div>
            <Link
              href="/community/events"
              className="hidden md:inline-flex items-center gap-2 text-primary hover:text-accent-amber transition-colors uppercase text-xs tracking-[0.2em] font-bold shrink-0 border-b border-primary/30 hover:border-primary pb-1 group"
            >
              See All Events
              <LucideIcon name="arrow-right" size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="glass-panel rounded-2xl p-16 text-center border border-gold-border/10">
              <p className="text-text-low text-sm">No upcoming events — check back soon.</p>
            </div>
          ) : (
            <>
              {/* Desktop: 3-panel asymmetric grid */}
              <div className="hidden lg:grid lg:grid-cols-[3fr_2fr] gap-4 h-[380px]">
                {events[0] && (
                  <EventCard event={events[0]} featured />
                )}
                <div className="grid grid-rows-2 gap-4 h-full">
                  {events.slice(1, 3).map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                  {events.length < 2 && (
                    <Link
                      href="/community/events"
                      className="glass-panel rounded-2xl border border-gold-border/10 flex items-center justify-center group hover:border-primary/20 transition-colors"
                    >
                      <span className="text-text-low text-sm group-hover:text-primary transition-colors">
                        Browse all events →
                      </span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Mobile: stacked cards */}
              <div className="lg:hidden grid grid-cols-1 gap-4">
                {events.slice(0, 2).map((e) => (
                  <EventCard key={e.id} event={e} mobileHeight />
                ))}
              </div>
            </>
          )}

          <div className="md:hidden text-center">
            <Link
              href="/community/events"
              className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-[0.2em] border-b border-primary/30 pb-1"
            >
              See All Events <LucideIcon name="arrow-right" size={13} />
            </Link>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── JOURNAL ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-background-dark">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-gradient-to-r from-primary to-transparent" />
                The Journal
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-text-high mb-2">
                Stories from the Road
              </h2>
              <p className="text-text-medium font-light max-w-md text-sm">
                Guides, perspectives, and tales from Crib travellers and staff.
              </p>
            </div>
            <Link
              href="/community/blog"
              className="hidden md:inline-flex items-center gap-2 text-primary hover:text-accent-amber transition-colors uppercase text-xs tracking-[0.2em] font-bold shrink-0 border-b border-primary/30 hover:border-primary pb-1 group"
            >
              Read the Journal
              <LucideIcon name="arrow-right" size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="glass-panel rounded-2xl p-16 text-center border border-gold-border/10">
              <p className="text-text-low text-sm">No posts published yet — check back soon.</p>
            </div>
          ) : (
            <>
              {/* Desktop: featured wide + two smaller */}
              <div className="hidden lg:grid lg:grid-cols-[2fr_1fr_1fr] gap-4 h-[380px]">
                {posts[0] && <BlogCard post={posts[0]} featured />}
                {posts.slice(1, 3).map((p) => (
                  <BlogCard key={p.id} post={p} />
                ))}
              </div>

              {/* Mobile: stacked */}
              <div className="lg:hidden grid grid-cols-1 gap-4">
                {posts.slice(0, 2).map((p) => (
                  <BlogCard key={p.id} post={p} mobileHeight />
                ))}
              </div>
            </>
          )}

          <div className="md:hidden text-center">
            <Link
              href="/community/blog"
              className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-[0.2em] border-b border-primary/30 pb-1"
            >
              Read the Journal <LucideIcon name="arrow-right" size={13} />
            </Link>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <SectionShell
        eyebrow="Voices"
        title="From the Tribe"
        description="Real people. Real stays. Real connections."
        className="bg-background-dark"
      >
        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="glass-panel rounded-2xl p-7 border border-gold-border/15 space-y-4 hover:border-gold-border/30 transition-colors"
              >
                {/* Decorative quote mark */}
                <span className="font-display text-6xl text-primary/15 leading-none select-none block -mb-2">
                  &ldquo;
                </span>
                <p className="text-text-medium text-sm leading-relaxed">{t.text}</p>
                <div className="flex items-center justify-between pt-1 border-t border-gold-border/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-xs">
                        {t.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-text-high font-medium text-sm">{t.name}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <LucideIcon
                        key={s}
                        name="star"
                        size={12}
                        className={s < t.rating ? 'text-primary fill-primary' : 'text-white/10'}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-12 text-center border border-gold-border/10">
            <p className="text-text-low text-sm">Testimonials coming soon.</p>
          </div>
        )}
      </SectionShell>

      <Footer />
    </main>
  )
}

// ── Shared divider ────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="h-[1px] bg-gradient-to-r from-transparent via-gold-border/30 to-transparent" />
    </div>
  )
}

// ── Event card ────────────────────────────────────────────────────────────────
function EventCard({
  event,
  featured = false,
  mobileHeight = false,
}: {
  event: {
    id: string
    name: string
    slug: string
    type: string
    images: unknown
    start_datetime: Date
    location: { city: string; images: unknown }
  }
  featured?: boolean
  mobileHeight?: boolean
}) {
  const eventImgs = Array.isArray(event.images) ? (event.images as string[]) : []
  const locImgs = Array.isArray(event.location.images) ? (event.location.images as string[]) : []
  const cover = eventImgs[0] ?? locImgs[0] ?? null

  return (
    <Link
      href={`/community/events/${event.slug}`}
      className={`relative block overflow-hidden rounded-2xl group h-full ${mobileHeight ? 'h-56' : ''}`}
    >
      {/* Background */}
      {cover ? (
        <Image
          src={cover}
          alt={event.name}
          fill
          sizes={featured ? '(max-width: 1024px) 100vw, 60vw' : '40vw'}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-surface-dark to-background-dark" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark/95 via-background-dark/30 to-black/20" />

      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        {/* Top: type badge */}
        <div>
          <span className="inline-flex items-center rounded-full bg-background-dark/70 backdrop-blur-sm border border-gold-border/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            {event.type}
          </span>
        </div>

        {/* Bottom: title + meta */}
        <div>
          <p
            className={`font-display text-text-high leading-tight group-hover:text-primary/90 transition-colors mb-2 ${
              featured ? 'text-2xl md:text-3xl italic' : 'text-lg'
            }`}
          >
            {event.name}
          </p>
          <div className="flex items-center gap-3 text-xs text-text-low/80">
            <span className="flex items-center gap-1">
              <LucideIcon name="calendar" size={11} className="text-primary/60" />
              {formatDateTime(event.start_datetime)}
            </span>
            <span className="flex items-center gap-1">
              <LucideIcon name="map-pin" size={11} className="text-primary/60" />
              {event.location.city}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Blog card ─────────────────────────────────────────────────────────────────
function BlogCard({
  post,
  featured = false,
  mobileHeight = false,
}: {
  post: {
    id: string
    title: string
    slug: string
    og_image: string | null
    excerpt: string | null
    published_at: Date | null
    category: { name: string }
  }
  featured?: boolean
  mobileHeight?: boolean
}) {
  return (
    <Link
      href={`/community/blog/${post.slug}`}
      className={`relative block overflow-hidden rounded-2xl group h-full ${mobileHeight ? 'h-56' : ''}`}
    >
      {/* Background */}
      {post.og_image ? (
        <Image
          src={post.og_image}
          alt={post.title}
          fill
          sizes={featured ? '(max-width: 1024px) 100vw, 50vw' : '25vw'}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-surface-dark to-background-dark flex items-end p-6">
          <span className="text-gold-border/10 font-display text-9xl italic leading-none select-none">
            {post.title[0]}
          </span>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark/95 via-background-dark/30 to-black/20" />

      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        {/* Top: category chip */}
        <div>
          <span className="inline-flex items-center rounded-full bg-background-dark/70 backdrop-blur-sm border border-gold-border/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            {post.category.name}
          </span>
        </div>

        {/* Bottom: title + date */}
        <div>
          <p
            className={`font-display text-text-high leading-tight group-hover:text-primary/90 transition-colors mb-1.5 ${
              featured ? 'text-2xl md:text-3xl italic' : 'text-lg'
            }`}
          >
            {post.title}
          </p>
          {featured && post.excerpt && (
            <p className="text-text-medium/70 text-sm leading-relaxed line-clamp-2 mb-2">
              {post.excerpt}
            </p>
          )}
          <p className="text-text-low/70 text-xs">
            {post.published_at ? formatDate(post.published_at) : ''}
          </p>
        </div>
      </div>
    </Link>
  )
}
