import { type Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { prisma } from '@crib/db'
import { createProperty } from '../actions'
import { RoomManager } from '@/components/RoomManager'

export const metadata: Metadata = { title: 'New Property' }
export const dynamic = 'force-dynamic'

const base = 'w-full bg-surface-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors'

export default async function NewPropertyPage() {
  const [locations, amenities] = await Promise.all([
    prisma.location.findMany({ orderBy: { name: 'asc' } }),
    prisma.amenity.findMany({ orderBy: [{ is_popular: 'desc' }, { category: 'asc' }, { name: 'asc' }] }),
  ])

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-text-low">
        <Link href="/properties" className="hover:text-text-medium transition-colors">Properties</Link>
        <ChevronRight size={12} />
        <span className="text-text-medium">New</span>
      </nav>

      <div>
        <h1 className="font-display text-3xl text-text-high mb-1">Add Property</h1>
        <p className="text-text-low text-sm">Create a property and add its room types.</p>
      </div>

      <form action={createProperty} className="space-y-8">
        {/* Property details */}
        <section className="space-y-5">
          <h2 className="text-xs uppercase tracking-[0.15em] text-text-low font-bold">Property Details</h2>

          <div className="space-y-1.5">
            <label htmlFor="location_id" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Location *</label>
            <select id="location_id" name="location_id" className={base} required>
              <option value="">Select a location…</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Name *</label>
              <input name="name" placeholder="The Dune House" className={base} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Address *</label>
              <input name="address" placeholder="Vagator Beach Road, Goa" className={base} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Description</label>
            <textarea name="description" placeholder="Describe this property…" rows={4} className={base} />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Check-in</label>
              <input name="check_in_time" placeholder="14:00" className={base} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Check-out</label>
              <input name="check_out_time" placeholder="11:00" className={base} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Manager</label>
              <input name="manager_name" placeholder="Jane Doe" className={base} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Phone</label>
              <input name="contact_phone" placeholder="+91 98765 43210" className={base} />
            </div>
          </div>
        </section>

        {/* Rooms */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xs uppercase tracking-[0.15em] text-text-low font-bold mb-1">Room Types</h2>
            <p className="text-text-low text-xs">Add dormitories, private rooms, tents — each with capacity, price, amenities and photos.</p>
          </div>
          <RoomManager amenities={amenities} />
        </section>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Create Property
          </button>
          <Link href="/properties" className="px-5 py-2.5 rounded-xl text-sm text-text-low hover:bg-white/5 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
