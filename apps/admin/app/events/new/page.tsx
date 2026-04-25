import { type Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { prisma } from '@crib/db'
import { createEvent } from '../actions'
import { EventFormFields } from '@/components/EventFormFields'

export const metadata: Metadata = { title: 'New Event' }
export const dynamic = 'force-dynamic'

const base = 'w-full bg-surface-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors'

export default async function NewEventPage() {
  const locations = await prisma.location.findMany({
    orderBy: { name: 'asc' },
    include: { properties: { orderBy: { name: 'asc' }, select: { id: true, name: true } } },
  })

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-text-low">
        <Link href="/events" className="hover:text-text-medium transition-colors">Events</Link>
        <ChevronRight size={12} />
        <span className="text-text-medium">New</span>
      </nav>

      <div>
        <h1 className="font-display text-3xl text-text-high mb-1">Add Event</h1>
        <p className="text-text-low text-sm">Create an event and optionally approve it immediately.</p>
      </div>

      <form action={createEvent} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Event Name *</label>
          <input name="name" placeholder="Sunrise Yoga on the Beach" className={base} required />
        </div>

        <EventFormFields locations={locations} />

        <div className="space-y-1.5">
          <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Description</label>
          <textarea name="description" placeholder="Describe the event…" rows={4} className={base} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Start Date & Time *</label>
            <input type="datetime-local" name="start_datetime" className={base} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">End Date & Time *</label>
            <input type="datetime-local" name="end_datetime" className={base} required />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-surface-dark rounded-xl border border-gold-border/20">
          <input type="hidden" name="is_approved" value="false" />
          <input type="checkbox" id="approve_now" name="is_approved" value="true" className="w-4 h-4 accent-primary" />
          <label htmlFor="approve_now" className="text-sm text-text-medium cursor-pointer">
            Approve immediately (appears on public site right away)
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Create Event
          </button>
          <Link href="/events" className="px-5 py-2.5 rounded-xl text-sm text-text-low hover:bg-white/5 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
