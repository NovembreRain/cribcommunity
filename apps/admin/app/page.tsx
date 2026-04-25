import { type Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@crib/db'
import { formatCurrency } from '@crib/lib'
import { MapPin, Building2, Calendar, CalendarDays } from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [locationCount, propertyCount, confirmedBookings, approvedEvents, recentBookings] =
    await Promise.all([
      prisma.location.count(),
      prisma.property.count(),
      prisma.booking.count({ where: { booking_status: 'confirmed' } }),
      prisma.event.count({ where: { is_approved: true } }),
      prisma.booking.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          property: { select: { name: true } },
          room_type: { select: { name: true } },
        },
      }),
    ])

  const stats = [
    { label: 'Locations',         value: locationCount,    icon: MapPin,       href: '/locations' },
    { label: 'Properties',        value: propertyCount,    icon: Building2,    href: '/properties' },
    { label: 'Active Bookings',   value: confirmedBookings,icon: Calendar,     href: '/bookings' },
    { label: 'Approved Events',   value: approvedEvents,   icon: CalendarDays, href: '/events' },
  ]

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="font-display text-3xl text-text-high mb-1">Dashboard</h1>
        <p className="text-text-low text-sm">Overview of Crib Community operations.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-surface-dark rounded-2xl p-5 border border-gold-border/20 hover:border-primary/30 transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-text-low text-xs uppercase tracking-[0.15em] font-medium">{label}</p>
              <Icon size={16} className="text-primary/60 group-hover:text-primary transition-colors" />
            </div>
            <p className="font-display text-3xl text-text-high">{value}</p>
          </Link>
        ))}
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-text-high">Recent Bookings</h2>
          <Link href="/bookings" className="text-xs text-primary hover:underline uppercase tracking-[0.15em]">
            View all →
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="bg-surface-dark rounded-2xl p-8 text-center border border-gold-border/20">
            <p className="text-text-low text-sm">No bookings yet.</p>
          </div>
        ) : (
          <div className="bg-surface-dark rounded-2xl border border-gold-border/20 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-border/20">
                  {['Guest', 'Property', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-text-low text-xs uppercase tracking-[0.1em] font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-border/10">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-text-high font-medium">{b.guest_name}</p>
                      <p className="text-text-low text-xs">{b.guest_email}</p>
                    </td>
                    <td className="px-4 py-3 text-text-medium">{b.property.name}</td>
                    <td className="px-4 py-3 text-text-medium">{b.room_type.name}</td>
                    <td className="px-4 py-3 text-text-low">{b.check_in_date.toISOString().split('T')[0]}</td>
                    <td className="px-4 py-3 text-text-low">{b.check_out_date.toISOString().split('T')[0]}</td>
                    <td className="px-4 py-3 text-text-high font-medium">
                      {formatCurrency(b.total_amount, 'INR', 'en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.booking_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    cancelled:   'bg-red-500/15 text-red-400 border-red-500/20',
    checked_in:  'bg-blue-500/15 text-blue-400 border-blue-500/20',
    checked_out: 'bg-text-low/15 text-text-low border-text-low/20',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status] ?? 'bg-white/10 text-text-low border-white/10'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
