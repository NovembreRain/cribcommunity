import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@crib/db'
import { checkRoomAvailability, parseDate } from '@/lib/availability'

const querySchema = z.object({
  room_type_id: z.string().min(1),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
})

export async function GET(req: NextRequest) {
  const raw = Object.fromEntries(req.nextUrl.searchParams.entries())
  const parsed = querySchema.safeParse(raw)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { room_type_id, check_in, check_out } = parsed.data
  const checkIn = parseDate(check_in)
  const checkOut = parseDate(check_out)

  if (checkIn >= checkOut) {
    return NextResponse.json(
      { error: 'check_out must be after check_in' },
      { status: 400 },
    )
  }

  const todayUTC = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00.000Z')
  if (checkIn < todayUTC) {
    return NextResponse.json(
      { error: 'check_in cannot be in the past' },
      { status: 400 },
    )
  }

  const roomType = await prisma.roomType.findUnique({
    where: { id: room_type_id },
    select: { id: true, price_per_night: true },
  })

  if (!roomType) {
    return NextResponse.json({ error: 'Room type not found' }, { status: 404 })
  }

  const { available, dates } = await checkRoomAvailability(room_type_id, checkIn, checkOut)
  const totalNights = dates.length
  const totalAmount = parseFloat((roomType.price_per_night * totalNights).toFixed(2))

  return NextResponse.json({
    data: {
      available,
      price_per_night: roomType.price_per_night,
      total_nights: totalNights,
      total_amount: totalAmount,
      dates,
    },
  })
}
