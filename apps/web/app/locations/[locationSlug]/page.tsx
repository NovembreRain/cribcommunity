import { notFound } from 'next/navigation'
import { type Metadata } from 'next'
import { prisma } from '@crib/db'
import { truncate } from '@crib/lib'
import { NavBar } from '@/components/home/NavBar'
import { SectionShell } from '@/components/home/SectionShell'
import { PropertyCard } from '@/components/location/PropertyCard'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ locationSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locationSlug } = await params
  const location = await prisma.location.findUnique({
    where: { slug: locationSlug },
    select: { name: true, city: true, country: true, description: true },
  })
  if (!location) return { title: 'Location Not Found' }
  return {
    title: location.name,
    description:
      location.description ??
      `Explore hostels and experiences in ${location.city}, ${location.country}.`,
  }
}

export default async function LocationDetailPage({ params }: Props) {
  const { locationSlug } = await params

  const location = await prisma.location.findUnique({
    where: { slug: locationSlug },
    include: {
      properties: {
        include: {
          room_types: {
            orderBy: { price_per_night: 'asc' },
            select: {
              id: true,
              name: true,
              price_per_night: true,
              images: true,
              amenities: {
                select: {
                  amenity: {
                    select: { id: true, name: true, icon: true, is_popular: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!location) notFound()

  // Build PropertyCard data for each property
  const propertyCards = location.properties.map((property) => {
    const cheapestRoom = property.room_types[0]
    const allImages = property.room_types.flatMap((rt) => {
      const imgs = Array.isArray(rt.images) ? (rt.images as string[]) : []
      return imgs
    })

    // Collect all amenities across room types, deduplicate, prefer popular
    const seen = new Set<string>()
    const popularAmenities: Array<{ name: string; icon: string }> = []
    for (const rt of property.room_types) {
      for (const rta of rt.amenities) {
        const a = rta.amenity
        if (!seen.has(a.id) && a.is_popular) {
          seen.add(a.id)
          popularAmenities.push({ name: a.name, icon: a.icon })
        }
      }
    }

    return {
      id: property.id,
      slug: property.slug,
      image: allImages[0] ?? null,
      locationName: location.name,
      title: property.name,
      rating: null as number | null,
      reviewCount: 0,
      priceFrom: cheapestRoom?.price_per_night ?? 0,
      currency: 'INR',
      description: property.description,
      amenities: popularAmenities.slice(0, 4),
    }
  })

  const heroImage = propertyCards[0]?.image ?? null

  return (
    <main className="min-h-screen bg-background-dark">
      <NavBar />

      {/* Hero banner */}
      <div className="relative pt-20 min-h-[50vh] flex items-end overflow-hidden">
        {heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt={location.name}
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          />
        )}
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/60 to-background-dark/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark/40 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16 w-full">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3 flex items-center gap-2">
            <span className="w-6 h-[2px] bg-gradient-to-r from-primary to-transparent" />
            {location.city}, {location.state}, {location.country}
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-text-high mb-4">
            {location.name}
          </h1>
          {location.description && (
            <p className="text-text-medium font-light max-w-2xl text-lg leading-relaxed">
              {location.description}
            </p>
          )}
        </div>
      </div>

      {/* Properties grid */}
      <SectionShell
        eyebrow="Properties"
        title={`Stay in ${location.name.replace('Crib ', '')}`}
        description={`${propertyCards.length} ${propertyCards.length === 1 ? 'property' : 'properties'} — each one handpicked for the experience it gives you.`}
        className="bg-background-dark"
      >
        {propertyCards.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <p className="font-display text-2xl text-text-medium mb-2">Properties coming soon</p>
            <p className="text-text-low text-sm">
              We&apos;re setting up camp. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {propertyCards.map((prop, i) => (
              <PropertyCard key={prop.id} {...prop} index={i} />
            ))}
          </div>
        )}
      </SectionShell>

      {/* Footer */}
      <footer className="border-t border-gold-border/20 py-12 px-6 mt-8">
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
