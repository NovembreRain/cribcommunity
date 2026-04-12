import { prisma } from '@crib/db'
import { truncate } from '@crib/lib'
import { NavBar } from '@/components/home/NavBar'

export const dynamic = 'force-dynamic'
import { HeroSection } from '@/components/home/HeroSection'
import { SectionShell } from '@/components/home/SectionShell'
import { LocationCard } from '@/components/location/LocationCard'

/**
 * Homepage — /
 *
 * Design authority: AI_CONTEXT/stitch-ui-kit.html
 * Props authority:  AI_CONTEXT/design-map.json
 *
 * Sections:
 *  1. NavBar (fixed, glass pill)
 *  2. HeroSection (full-viewport video + Framer Motion entrance)
 *  3. Our Locations (placeholder grid — data task: build-location-page.md)
 *  4. Community (placeholder grid — data task: build-community-pages.md)
 *  5. Testimonials (placeholder row — data task: build-testimonials.md)
 */
export default async function HomePage() {
  const locations = await prisma.location.findMany({
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
  })

  return (
    <main className="min-h-screen bg-background-dark">
      <NavBar />
      <HeroSection />

      {/* ── OUR LOCATIONS ──────────────────────────────────────────
          Placeholder — replace when build-location-page.md is executed.
          Will render LocationCard × n from DB.
      ─────────────────────────────────────────────────────────── */}
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

                return (
                  <LocationCard
                    key={location.id}
                    id={location.id}
                    slug={location.slug}
                    image={coverImage}
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

        {/* View all link — exact Stitch hyperlink pattern */}
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

      {/* Subtle section divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-gold-border/30 to-transparent" />
      </div>

      {/* ── COMMUNITY ──────────────────────────────────────────────
          Placeholder — replace when community pages are built.
          Will render EventCard + BlogCard from DB.
      ─────────────────────────────────────────────────────────── */}
      <SectionShell
        eyebrow="Life at Crib"
        title="The Community"
        description="Events, stories, and connections that outlast your stay."
        className="bg-background-dark"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Events placeholder */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              Upcoming Events
            </p>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-white/10 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-32 bg-white/10 rounded" />
                    <div className="h-2 w-20 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
            <a
              href="/community/events"
              className="inline-flex items-center text-primary hover:text-accent-amber transition-colors uppercase text-xs tracking-[0.2em] font-bold group border-b border-primary/30 hover:border-primary pb-1 mt-2"
            >
              See All Events
            </a>
          </div>

          {/* Blog placeholder */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              The Journal
            </p>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 animate-pulse">
                  <div className="w-16 h-12 rounded-lg bg-white/10 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-36 bg-white/10 rounded" />
                    <div className="h-2 w-24 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
            <a
              href="/community/blog"
              className="inline-flex items-center text-primary hover:text-accent-amber transition-colors uppercase text-xs tracking-[0.2em] font-bold group border-b border-primary/30 hover:border-primary pb-1 mt-2"
            >
              Read the Journal
            </a>
          </div>
        </div>
      </SectionShell>

      <div className="max-w-7xl mx-auto px-6">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-gold-border/30 to-transparent" />
      </div>

      {/* ── TESTIMONIALS ───────────────────────────────────────────
          Placeholder — replace when testimonials seeded in DB.
          Will render TestimonialCard × n from DB.
      ─────────────────────────────────────────────────────────── */}
      <SectionShell
        eyebrow="Voices"
        title="From the Tribe"
        description="Real people. Real stays. Real connections."
        className="bg-background-dark"
      >
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="glass-panel rounded-2xl p-6 min-w-[280px] snap-start space-y-4 animate-pulse shrink-0"
              aria-hidden="true"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div className="space-y-1.5">
                  <div className="h-3 w-20 bg-white/10 rounded" />
                  <div className="h-2 w-14 bg-white/5 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 w-full bg-white/10 rounded" />
                <div className="h-2.5 w-4/5 bg-white/10 rounded" />
                <div className="h-2.5 w-3/5 bg-white/10 rounded" />
              </div>
              {/* Star rating placeholder */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <div key={s} className="w-3 h-3 rounded-sm bg-primary/40" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* ── FOOTER PLACEHOLDER ─────────────────────────────────── */}
      <footer className="border-t border-gold-border/20 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <span className="text-white font-display text-2xl font-bold italic tracking-tighter">
              Crib
            </span>
            <span className="text-primary not-italic text-4xl leading-none font-display">.</span>
          </div>
          <p className="text-text-low text-xs uppercase tracking-widest">
            © {new Date().getFullYear()} Crib Community — All rights reserved
          </p>
          <nav className="flex gap-6" aria-label="Footer navigation">
            {['Locations', 'Events', 'Blog', 'Contact'].map((link) => (
              <a
                key={link}
                href={`/${link.toLowerCase()}`}
                className="text-xs font-bold uppercase tracking-widest text-text-low hover:text-primary transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  )
}
