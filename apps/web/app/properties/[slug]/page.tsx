import { notFound } from 'next/navigation'
import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@crib/db'
import { NavBar } from '@/components/home/NavBar'
import { PropertyBookingPanel } from '@/components/property/PropertyBookingPanel'
import { LucideIcon } from '@/components/location/LucideIcon'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const property = await prisma.property.findUnique({
    where: { slug },
    select: { name: true, description: true, location: { select: { city: true, country: true } } },
  })
  if (!property) return { title: 'Property Not Found' }
  return {
    title: property.name,
    description:
      property.description ??
      `Book your stay at ${property.name} in ${property.location.city}, ${property.location.country}.`,
  }
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params

  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
      location: {
        select: { id: true, name: true, slug: true, city: true, state: true, country: true },
      },
      room_types: {
        orderBy: { price_per_night: 'asc' },
        include: {
          amenities: {
            include: {
              amenity: {
                select: { id: true, name: true, icon: true, category: true, is_popular: true },
              },
            },
          },
        },
      },
    },
  })

  if (!property) notFound()

  // Resolve hero image from first room type's first image
  const allImages = property.room_types.flatMap((rt) => {
    const imgs = Array.isArray(rt.images) ? (rt.images as string[]) : []
    return imgs
  })
  const heroImage = allImages[0] ?? null

  // Shape room types for the booking panel (flatten amenities)
  const roomTypes = property.room_types.map((rt) => ({
    id: rt.id,
    name: rt.name,
    description: rt.description,
    capacity: rt.capacity,
    price_per_night: rt.price_per_night,
    amenities: rt.amenities
      .map((rta) => rta.amenity)
      .sort((a, b) => {
        if (a.is_popular !== b.is_popular) return a.is_popular ? -1 : 1
        return a.category.localeCompare(b.category)
      })
      .map((a) => ({ name: a.name, icon: a.icon })),
  }))

  const lowestPrice = roomTypes[0]?.price_per_night ?? 0

  return (
    <main className="min-h-screen bg-background-dark">
      <NavBar />

      {/* Hero */}
      <div className="relative pt-20 h-[60vh] min-h-[420px] flex items-end overflow-hidden">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={property.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-dark to-background-dark" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-background-dark/20" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-10 w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-text-low mb-4" aria-label="Breadcrumb">
            <Link href="/locations" className="hover:text-primary transition-colors">
              Locations
            </Link>
            <LucideIcon name="chevron-right" size={12} className="text-text-low/40" />
            <Link
              href={`/locations/${property.location.slug}`}
              className="hover:text-primary transition-colors"
            >
              {property.location.name}
            </Link>
            <LucideIcon name="chevron-right" size={12} className="text-text-low/40" />
            <span className="text-text-medium">{property.name}</span>
          </nav>

          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2 flex items-center gap-1.5">
            <LucideIcon name="map-pin" size={11} />
            {property.location.city}, {property.location.state}
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-text-high mb-3">
            {property.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-medium">
            <span className="flex items-center gap-1.5">
              <LucideIcon name="map-pin" size={14} className="text-text-low" />
              {property.address}
            </span>
            {property.check_in_time && (
              <span className="flex items-center gap-1.5 text-text-low">
                <LucideIcon name="clock" size={14} />
                Check-in {property.check_in_time} · Check-out {property.check_out_time}
              </span>
            )}
            {lowestPrice > 0 && (
              <span className="text-primary font-bold">
                From ₹{lowestPrice.toLocaleString('en-IN')}/night
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
        {/* About */}
        {property.description && (
          <section>
            <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-4 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-gradient-to-r from-primary to-transparent" />
              About
            </h2>
            <p className="text-text-medium font-light max-w-2xl leading-relaxed text-lg">
              {property.description}
            </p>
          </section>
        )}

        {/* Booking panel — room selection + calendar + form */}
        <section>
          <PropertyBookingPanel propertyId={property.id} roomTypes={roomTypes} />
        </section>
      </div>

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
