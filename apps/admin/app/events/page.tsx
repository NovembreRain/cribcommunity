import { type Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@crib/db'
import { formatDateTime } from '@crib/lib'
import { toggleEventApproval } from './actions'
import { Plus } from 'lucide-react'

export const metadata: Metadata = { title: 'Events' }
export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { start_datetime: 'desc' },
    include: {
      location: { select: { name: true } },
      _count: { select: { registrations: true } },
    },
  })

  const pending = events.filter((e) => !e.is_approved)
  const approved = events.filter((e) => e.is_approved)

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-text-high mb-1">Events</h1>
          <p className="text-text-low text-sm">{pending.length} pending · {approved.length} approved</p>
        </div>
        <Link href="/events/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={16} />
          Add Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-surface-dark rounded-2xl p-12 text-center border border-gold-border/20">
          <p className="text-text-low text-sm">No events yet.</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-lg text-text-high">Pending Approval</h2>
              <EventTable events={pending} />
            </section>
          )}
          {approved.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-lg text-text-high">Approved</h2>
              <EventTable events={approved} />
            </section>
          )}
        </>
      )}
    </div>
  )
}

function EventTable({
  events,
}: {
  events: Array<{
    id: string
    name: string
    slug: string
    type: string
    start_datetime: Date
    end_datetime: Date
    is_approved: boolean
    location: { name: string }
    _count: { registrations: number }
  }>
}) {
  return (
    <div className="bg-surface-dark rounded-2xl border border-gold-border/20 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gold-border/20">
            {['Name', 'Location', 'Type', 'Start', 'Registrations', 'Actions'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-text-low text-xs uppercase tracking-[0.1em] font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gold-border/10">
          {events.map((e) => (
            <tr key={e.id} className="hover:bg-white/2 transition-colors">
              <td className="px-4 py-3">
                <p className="text-text-high font-medium">{e.name}</p>
                <p className="text-text-low text-xs font-mono">{e.slug}</p>
              </td>
              <td className="px-4 py-3 text-text-medium">{e.location.name}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary border-primary/20">
                  {e.type}
                </span>
              </td>
              <td className="px-4 py-3 text-text-low text-xs">{formatDateTime(e.start_datetime)}</td>
              <td className="px-4 py-3 text-text-low">{e._count.registrations}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/events/${e.id}/edit`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gold-border/20 text-text-low hover:bg-white/5 transition-colors"
                  >
                    Edit
                  </Link>
                  <form action={toggleEventApproval}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="approved" value={e.is_approved ? 'false' : 'true'} />
                    <button
                      type="submit"
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        e.is_approved
                          ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                      }`}
                    >
                      {e.is_approved ? 'Revoke' : 'Approve'}
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
