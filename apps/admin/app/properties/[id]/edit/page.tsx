import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { prisma } from '@crib/db'
import { updateProperty } from '../../actions'
import { RoomManager } from '@/components/RoomManager'

export const metadata: Metadata = { title: 'Edit Property' }
export const dynamic = 'force-dynamic'

const base = 'w-full bg-surface-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors'

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [property, locations, amenities] = await Promise.all([
    prisma.property.findUnique({
      where: { id },
      include: {
        room_types: {
          include: { amenities: { select: { amenity_id: true } } },
          orderBy: { price_per_night: 'asc' },
        },
      },
    }),
    prisma.location.findMany({ orderBy: { name: 'asc' } }),
    prisma.amenity.findMany({ orderBy: [{ is_popular: 'desc' }, { category: 'asc' }, { name: 'asc' }] }),
  ])
  if (!property) notFound()

  const update = updateProperty.bind(null, id)

  const defaultRooms = property.room_types.map((rt) => ({
    id: rt.id,
    name: rt.name,
    description: rt.description ?? '',
    capacity: rt.capacity,
    price_per_night: rt.price_per_night,
    amenity_ids: rt.amenities.map((a) => a.amenity_id),
    images: Array.isArray(rt.images) ? (rt.images as string[]) : [],
  }))

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-text-low">
        <Link href="/properties" className="hover:text-text-medium transition-colors">Properties</Link>
        <ChevronRight size={12} />
        <span className="text-text-medium">{property.name}</span>
        <ChevronRight size={12} />
        <span className="text-text-medium">Edit</span>
      </nav>

      <div>
        <h1 className="font-display text-3xl text-text-high mb-1">Edit Property</h1>
        <p className="text-text-low font-mono text-xs">{property.slug}</p>
      </div>

      <form action={update} className="space-y-8">
        <section className="space-y-5">
          <h2 className="text-xs uppercase tracking-[0.15em] text-text-low font-bold">Property Details</h2>

          <div className="space-y-1.5">
            <label htmlFor="location_id" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Location *</label>
            <select id="location_id" name="location_id" defaultValue={property.location_id} className={base}>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Name *</label>
              <input name="name" defaultValue={property.name} className={base} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Address *</label>
              <input name="address" defaultValue={property.address} className={base} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Description</label>
            <textarea name="description" defaultValue={property.description ?? ''} rows={4} className={base} />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Check-in</label>
              <input name="check_in_time" defaultValue={property.check_in_time ?? ''} placeholder="14:00" className={base} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Check-out</label>
              <input name="check_out_time" defaultValue={property.check_out_time ?? ''} placeholder="11:00" className={base} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Manager</label>
              <input name="manager_name" defaultValue={property.manager_name ?? ''} className={base} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Phone</label>
              <input name="contact_phone" defaultValue={property.contact_phone ?? ''} className={base} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xs uppercase tracking-[0.15em] text-text-low font-bold mb-1">Room Types</h2>
            <p className="text-text-low text-xs">Add or edit room types. Changes save on form submit.</p>
          </div>
          <RoomManager amenities={amenities} defaultRooms={defaultRooms} />
        </section>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Save Changes
          </button>
          <Link href="/properties" className="px-5 py-2.5 rounded-xl text-sm text-text-low hover:bg-white/5 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
