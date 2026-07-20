import { notFound } from 'next/navigation'
import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@crib/db'
import { truncate } from '@crib/lib'
import { NavBar } from '@/components/home/NavBar'
import { PropertyBookingPanel } from '@/components/property/PropertyBookingPanel'
import { LucideIcon } from '@/components/location/LucideIcon'
import { Footer } from '@/components/home/Footer'
import { FAQSection } from '@/components/home/FAQSection'
import { JsonLd } from '@/components/JsonLd'

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
    description: property.description
      ? truncate(property.description, 155)
      : `Book your stay at ${property.name} in ${property.location.city}, ${property.location.country}.`,
  }
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params

  const [property, faqs] = await Promise.all([
  prisma.property.findUnique({
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
  }),
  prisma.fAQ.findMany({ where: { context: 'property' }, orderBy: { sort_order: 'asc' } }),
])

  if (!property) notFound()

  // Resolve hero image from first room type's first image
  const allImages = property.room_types.flatMap((rt) => {
    const imgs = Array.isArray(rt.images) ? (rt.images as string[]) : []
    return imgs
  })
  const heroImage = allImages[0] ?? null

  // Shape room types for the booking panel (flatten amenities + pass images)
  const roomTypes = property.room_types.map((rt) => ({
    id: rt.id,
    name: rt.name,
    description: rt.description,
    capacity: rt.capacity,
    price_per_night: rt.price_per_night,
    images: Array.isArray(rt.images) ? (rt.images as string[]) : [],
    amenities: rt.amenities
      .map((rta) => rta.amenity)
      .sort((a, b) => {
        if (a.is_popular !== b.is_popular) return a.is_popular ? -1 : 1
        return a.category.localeCompare(b.category)
      })
      .map((a) => ({ name: a.name, icon: a.icon })),
  }))

  const lowestPrice = roomTypes[0]?.price_per_night ?? 0
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const uniqueAmenities = Array.from(new Set(roomTypes.flatMap((rt) => rt.amenities.map((a) => a.name))))

  const lodgingSchema = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: property.name,
    description: property.description ?? undefined,
    url: `${appUrl}/properties/${property.slug}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.location.city,
      addressRegion: property.location.state,
      addressCountry: property.location.country,
    },
    checkinTime: property.check_in_time ?? undefined,
    checkoutTime: property.check_out_time ?? undefined,
    amenityFeature: uniqueAmenities.map((name) => ({
      '@type': 'LocationFeatureSpecification',
      name,
      value: true,
    })),
    priceRange: lowestPrice > 0 ? `₹${lowestPrice.toLocaleString('en-IN')}+` : undefined,
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Locations', item: `${appUrl}/locations` },
      { '@type': 'ListItem', position: 2, name: property.location.name, item: `${appUrl}/locations/${property.location.slug}` },
      { '@type': 'ListItem', position: 3, name: property.name, item: `${appUrl}/properties/${property.slug}` },
    ],
  }

  return (
    <main className="min-h-screen bg-background-dark">
      <JsonLd data={lodgingSchema} />
      <JsonLd data={breadcrumbSchema} />
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

      {faqs.length > 0 && (
        <FAQSection faqs={faqs} title="Property FAQ" />
      )}
      <Footer />
    </main>
  )
}
