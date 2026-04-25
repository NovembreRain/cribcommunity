import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@crib/db'

function buildMonthRange(month: string): { gte: Date; lte: Date } | undefined {
  if (!month) return undefined
  const [y, m] = month.split('-').map(Number)
  if (!y || !m) return undefined
  return { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0, 23, 59, 59) }
}

function escape(v: unknown): string {
  const s = String(v ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const month = searchParams.get('month') ?? ''
  const statusFilter = searchParams.get('status') ?? ''
  const monthRange = buildMonthRange(month)

  const bookings = await prisma.booking.findMany({
    where: {
      ...(monthRange ? { created_at: monthRange } : {}),
      ...(statusFilter && statusFilter !== 'all' ? { booking_status: statusFilter } : {}),
    },
    orderBy: { created_at: 'desc' },
    include: {
      property: { select: { name: true } },
      room_type: { select: { name: true } },
    },
  })

  const headers = ['Booking ID', 'Guest Name', 'Email', 'Phone', 'Property', 'Room', 'Check-in', 'Check-out', 'Nights', 'Amount (INR)', 'Payment Status', 'Booking Status', 'Source', 'Created At']

  const rows = bookings.map((b) => {
    const nights = Math.round((b.check_out_date.getTime() - b.check_in_date.getTime()) / 86400000)
    return [
      b.id,
      b.guest_name,
      b.guest_email,
      b.guest_phone ?? '',
      b.property.name,
      b.room_type.name,
      b.check_in_date.toISOString().split('T')[0],
      b.check_out_date.toISOString().split('T')[0],
      nights,
      b.total_amount.toFixed(2),
      b.payment_status,
      b.booking_status,
      b.source ?? '',
      b.created_at.toISOString(),
    ].map(escape).join(',')
  })

  const csv = [headers.join(','), ...rows].join('\n')
  const filename = month ? `bookings-${month}.csv` : 'bookings-all.csv'

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
