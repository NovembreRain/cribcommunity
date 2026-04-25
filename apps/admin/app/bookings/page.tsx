import { type Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@crib/db'
import { formatCurrency, formatDate } from '@crib/lib'
import { updateBookingStatus } from './actions'
import { StatusSelect } from '@/components/StatusSelect'
import { Download } from 'lucide-react'

export const metadata: Metadata = { title: 'Bookings' }
export const dynamic = 'force-dynamic'

const STATUS_OPTIONS = ['confirmed', 'cancelled', 'checked_in', 'checked_out']
const STATUS_STYLES: Record<string, string> = {
  confirmed:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  cancelled:   'bg-red-500/15 text-red-400 border-red-500/20',
  checked_in:  'bg-blue-500/15 text-blue-400 border-blue-500/20',
  checked_out: 'bg-text-low/15 text-text-low border-text-low/20',
}

const LIMIT_OPTIONS = [20, 50, 100, 'all'] as const

function buildMonthRange(month: string): { gte: Date; lte: Date } | undefined {
  if (!month) return undefined
  const [y, m] = month.split('-').map(Number)
  if (!y || !m) return undefined
  const gte = new Date(y, m - 1, 1)
  const lte = new Date(y, m, 0, 23, 59, 59)
  return { gte, lte }
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; limit?: string; status?: string; property_id?: string }>
}) {
  const { month, limit: limitStr, status: statusFilter, property_id } = await searchParams
  const limit = limitStr === 'all' ? undefined : Math.min(Number(limitStr) || 20, 500)
  const monthRange = month ? buildMonthRange(month) : undefined

  const where = {
    ...(monthRange ? { created_at: monthRange } : {}),
    ...(statusFilter && statusFilter !== 'all' ? { booking_status: statusFilter } : {}),
    ...(property_id ? { property_id } : {}),
  }

  const [bookings, totalCount, properties] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: [{ property_id: 'asc' }, { created_at: 'desc' }],
      ...(limit ? { take: limit } : {}),
      include: {
        property: { select: { id: true, name: true } },
        room_type: { select: { name: true } },
      },
    }),
    prisma.booking.count({ where }),
    prisma.property.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  // Build month options for the last 12 months
  const monthOptions: { value: string; label: string }[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    monthOptions.push({ value, label })
  }

  const totalRevenue = bookings
    .filter((b) => b.booking_status !== 'cancelled')
    .reduce((sum, b) => sum + b.total_amount, 0)

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-text-high mb-1">Bookings</h1>
          <p className="text-text-low text-sm">
            Showing {bookings.length} of {totalCount} booking{totalCount !== 1 ? 's' : ''}
            {month ? ` · ${monthOptions.find((m) => m.value === month)?.label ?? month}` : ''}
          </p>
        </div>
        {/* CSV download */}
        <Link
          href={`/bookings/export?month=${month ?? ''}&status=${statusFilter ?? ''}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gold-border/20 text-text-low text-sm hover:bg-white/5 transition-colors"
        >
          <Download size={15} />
          Export CSV
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex items-center gap-3 flex-wrap">
        <select name="month" defaultValue={month ?? ''} className="bg-surface-dark border border-gold-border/20 rounded-xl px-4 py-2 text-sm text-text-medium focus:outline-none focus:border-primary/40">
          <option value="">All time</option>
          {monthOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select name="status" defaultValue={statusFilter ?? ''} className="bg-surface-dark border border-gold-border/20 rounded-xl px-4 py-2 text-sm text-text-medium focus:outline-none focus:border-primary/40">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>

        <select name="property_id" defaultValue={property_id ?? ''} className="bg-surface-dark border border-gold-border/20 rounded-xl px-4 py-2 text-sm text-text-medium focus:outline-none focus:border-primary/40">
          <option value="">All properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select name="limit" defaultValue={limitStr ?? '20'} className="bg-surface-dark border border-gold-border/20 rounded-xl px-4 py-2 text-sm text-text-medium focus:outline-none focus:border-primary/40">
          {LIMIT_OPTIONS.map((l) => (
            <option key={l} value={l}>{l === 'all' ? 'Show all' : `${l} per page`}</option>
          ))}
        </select>

        <button type="submit" className="px-4 py-2 rounded-xl bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors">
          Apply
        </button>
        <Link href="/bookings" className="px-4 py-2 text-text-low text-sm hover:text-text-medium transition-colors">
          Clear
        </Link>
      </form>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATUS_OPTIONS.map((status) => {
          const count = bookings.filter((b) => b.booking_status === status).length
          return (
            <div key={status} className="bg-surface-dark rounded-2xl p-4 border border-gold-border/20">
              <p className="text-text-low text-xs uppercase tracking-[0.1em] mb-2">{status.replace('_', ' ')}</p>
              <p className="font-display text-2xl text-text-high">{count}</p>
            </div>
          )
        })}
      </div>

      {bookings.length > 0 && (
        <div className="bg-surface-dark rounded-xl p-4 border border-gold-border/20 flex items-center justify-between">
          <p className="text-text-low text-sm">Revenue (non-cancelled)</p>
          <p className="font-display text-xl text-primary">{formatCurrency(totalRevenue, 'INR', 'en-IN')}</p>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-surface-dark rounded-2xl p-12 text-center border border-gold-border/20">
          <p className="text-text-low text-sm">No bookings found for the selected filters.</p>
        </div>
      ) : (
        <div className="bg-surface-dark rounded-2xl border border-gold-border/20 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-gold-border/20">
                {['Guest', 'Property / Room', 'Check-in → Check-out', 'Amount', 'Payment', 'Status', 'Update'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-text-low text-xs uppercase tracking-[0.1em] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-border/10">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-text-high font-medium">{b.guest_name}</p>
                    <p className="text-text-low text-xs">{b.guest_email}</p>
                    {b.guest_phone && <p className="text-text-low text-xs">{b.guest_phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-text-medium">{b.property.name}</p>
                    <p className="text-text-low text-xs">{b.room_type.name}</p>
                  </td>
                  <td className="px-4 py-3 text-text-low text-xs">
                    <p>{formatDate(b.check_in_date)}</p>
                    <p>→ {formatDate(b.check_out_date)}</p>
                  </td>
                  <td className="px-4 py-3 text-text-high font-medium">
                    {formatCurrency(b.total_amount, 'INR', 'en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[b.payment_status] ?? 'bg-white/10 text-text-low border-white/10'}`}>
                      {b.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[b.booking_status] ?? 'bg-white/10 text-text-low border-white/10'}`}>
                      {b.booking_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateBookingStatus}>
                      <input type="hidden" name="id" value={b.id} />
                      <StatusSelect name="status" defaultValue={b.booking_status} options={STATUS_OPTIONS} />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
