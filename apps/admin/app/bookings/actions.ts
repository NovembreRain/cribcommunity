'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@crib/db'

const VALID_STATUSES = ['confirmed', 'cancelled', 'checked_in', 'checked_out'] as const
type BookingStatus = (typeof VALID_STATUSES)[number]

function isValidStatus(status: string): status is BookingStatus {
  return (VALID_STATUSES as readonly string[]).includes(status)
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0] as string
}

/** Every UTC-midnight date from checkIn up to (but not including) checkOut. */
function nightsBetween(checkIn: Date, checkOut: Date): Date[] {
  const nights: Date[] = []
  const current = new Date(checkIn)
  while (current < checkOut) {
    nights.push(new Date(current))
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return nights
}

export async function updateBookingStatus(formData: FormData) {
  const id = formData.get('id') as string
  const status = formData.get('status') as string

  if (!isValidStatus(status)) {
    throw new Error(`Invalid booking status: ${status}`)
  }

  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUniqueOrThrow({
      where: { id },
      select: {
        booking_status: true,
        room_type_id: true,
        check_in_date: true,
        check_out_date: true,
      },
    })

    const wasCancelled = booking.booking_status === 'cancelled'
    const willBeCancelled = status === 'cancelled'

    if (!wasCancelled && willBeCancelled) {
      // Cancelling frees up the nights it held — restore inventory so the
      // room can actually be rebooked for these dates.
      await tx.roomInventory.updateMany({
        where: {
          room_type_id: booking.room_type_id,
          date: { gte: booking.check_in_date, lt: booking.check_out_date },
        },
        data: { available_count: { increment: 1 } },
      })
    } else if (wasCancelled && !willBeCancelled) {
      // Reinstating a cancelled booking — re-reserve the nights, but only if
      // nothing else has since taken them.
      const nights = nightsBetween(booking.check_in_date, booking.check_out_date)
      const inventory = await tx.roomInventory.findMany({
        where: {
          room_type_id: booking.room_type_id,
          date: { gte: booking.check_in_date, lt: booking.check_out_date },
        },
      })
      const byDate = new Map(inventory.map((r) => [toDateStr(r.date), r]))

      for (const night of nights) {
        const row = byDate.get(toDateStr(night))
        if (!row || row.available_count <= 0) {
          throw new Error(
            'Cannot reinstate this booking — no inventory remains for one or more of its nights.',
          )
        }
      }
      for (const row of inventory) {
        await tx.roomInventory.update({
          where: { id: row.id },
          data: { available_count: { decrement: 1 } },
        })
      }
    }

    await tx.booking.update({ where: { id }, data: { booking_status: status } })
  })

  revalidatePath('/bookings')
}
