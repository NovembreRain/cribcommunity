import { type Metadata } from 'next'
import { prisma } from '@crib/db'
import { truncate } from '@crib/lib'
import { NavBar } from '@/components/home/NavBar'
import { SectionShell } from '@/components/home/SectionShell'
import { LocationCard } from '@/components/location/LocationCard'
import { Footer } from '@/components/home/Footer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Our Locations',
  description:
    'Explore all Crib Community hostel destinations — from Goa beaches to Himalayan peaks.',
}

export default async function LocationsPage() {
  const locations = await prisma.location.findMany({
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
      _count: { select: { properties: true } },
    },
  })

  return (
    <main className="min-h-screen bg-background-dark">
      <NavBar />

      {/* Page header */}
      <div className="pt-32 pb-6 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3 flex items-center gap-3">
            <span className="w-8 h-[2px] bg-gradient-to-r from-primary to-transparent" />
            Destinations
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-text-high mb-4">Our Locations</h1>
          <p className="text-text-medium font-light max-w-xl">
            From ancient temples to coastal cliffs — each Crib is a world unto itself.
          </p>
        </div>
      </div>

      <SectionShell eyebrow="" title="" className="pt-8">
        {locations.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <p className="font-display text-2xl text-text-medium mb-2">Locations coming soon</p>
            <p className="text-text-low text-sm">
              We&apos;re scouting the next great adventure. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location, i) => {
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
            })}
          </div>
        )}
      </SectionShell>

      <Footer />
    </main>
  )
}
