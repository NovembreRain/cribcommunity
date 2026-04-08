import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, Prisma } from '@crib/db'
import { checkRoomAvailability, parseDate } from '@/lib/availability'

const bookingSchema = z.object({
  property_id: z.string().min(1),
  room_type_id: z.string().min(1),
  guest_name: z.string().min(2),
  guest_email: z.string().email(),
  guest_phone: z.string().optional(),
  check_in_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  check_out_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const {
    property_id,
    room_type_id,
    guest_name,
    guest_email,
    guest_phone,
    check_in_date,
    check_out_date,
  } = parsed.data

  const checkIn = parseDate(check_in_date)
  const checkOut = parseDate(check_out_date)

  if (checkIn >= checkOut) {
    return NextResponse.json(
      { error: 'check_out_date must be after check_in_date' },
      { status: 400 },
    )
  }

  // Verify room_type belongs to property
  const roomType = await prisma.roomType.findFirst({
    where: { id: room_type_id, property_id },
    select: { id: true, price_per_night: true },
  })

  if (!roomType) {
    return NextResponse.json(
      { error: 'Room type not found for this property' },
      { status: 400 },
    )
  }

  // Step 3: Check inventory availability
  const { available, dates } = await checkRoomAvailability(room_type_id, checkIn, checkOut)
  if (!available) {
    return NextResponse.json(
      { error: 'No availability for the selected dates', dates },
      { status: 409 },
    )
  }

  // Step 4: Overlap check on Booking table (belt-and-suspenders guard)
  const overlappingBooking = await prisma.booking.findFirst({
    where: {
      room_type_id,
      booking_status: { not: 'cancelled' },
      check_in_date: { lt: checkOut },
      check_out_date: { gt: checkIn },
    },
    select: { id: true },
  })

  if (overlappingBooking) {
    return NextResponse.json(
      { error: 'No availability for the selected dates' },
      { status: 409 },
    )
  }

  // Step 5: Transaction — re-verify inventory then create booking + decrement
  const totalNights = dates.length
  const totalAmount = parseFloat((roomType.price_per_night * totalNights).toFixed(2))

  let booking: { id: string; booking_status: string; total_amount: number; check_in_date: Date; check_out_date: Date }

  try {
    booking = await prisma.$transaction(
      async (tx) => {
        // Re-fetch inventory inside transaction to prevent race conditions
        const inventory = await tx.roomInventory.findMany({
          where: {
            room_type_id,
            date: { gte: checkIn, lt: checkOut },
          },
          select: { id: true, date: true, available_count: true },
        })

        // Verify all dates still have availability
        const nightCount = dates.length
        if (inventory.length < nightCount) {
          throw new Error('INVENTORY_UNAVAILABLE')
        }
        const allAvailable = inventory.every((r) => r.available_count > 0)
        if (!allAvailable) {
          throw new Error('INVENTORY_UNAVAILABLE')
        }

        // Create booking
        const newBooking = await tx.booking.create({
          data: {
            id: crypto.randomUUID(),
            property_id,
            room_type_id,
            guest_name,
            guest_email,
            guest_phone: guest_phone ?? null,
            check_in_date: checkIn,
            check_out_date: checkOut,
            total_amount: totalAmount,
            payment_status: 'pending',
            booking_status: 'confirmed',
            source: 'web',
          },
          select: {
            id: true,
            booking_status: true,
            total_amount: true,
            check_in_date: true,
            check_out_date: true,
          },
        })

        // Decrement inventory for each night
        for (const inv of inventory) {
          await tx.roomInventory.update({
            where: { id: inv.id },
            data: { available_count: { decrement: 1 } },
          })
        }

        return newBooking
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (message === 'INVENTORY_UNAVAILABLE') {
      return NextResponse.json(
        { error: 'No availability for the selected dates' },
        { status: 409 },
      )
    }
    // Serialization failure from concurrent transaction
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2034'
    ) {
      return NextResponse.json(
        { error: 'Booking conflict — please try again' },
        { status: 409 },
      )
    }
    throw err
  }

  return NextResponse.json(
    {
      data: {
        booking_id: booking.id,
        status: booking.booking_status,
        total_amount: booking.total_amount,
        check_in_date: booking.check_in_date.toISOString().split('T')[0],
        check_out_date: booking.check_out_date.toISOString().split('T')[0],
      },
    },
    { status: 201 },
  )
}
