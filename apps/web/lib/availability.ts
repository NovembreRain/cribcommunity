import { prisma } from '@crib/db'

/** Returns every UTC-midnight Date from checkIn up to (but not including) checkOut. */
export function getDatesInRange(checkIn: Date, checkOut: Date): Date[] {
  const dates: Date[] = []
  const current = new Date(checkIn)
  while (current < checkOut) {
    dates.push(new Date(current))
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return dates
}

/** Formats a Date as YYYY-MM-DD (UTC). */
export function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0] as string
}

/** Parses a YYYY-MM-DD string to a UTC-midnight Date. */
export function parseDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`)
}

export interface DateAvailability {
  date: string
  available_count: number
}

export interface AvailabilityResult {
  available: boolean
  dates: DateAvailability[]
  /** Raw inventory rows — needed by the booking transaction for decrement. */
  inventoryRecords: Array<{ id: string; date: Date; available_count: number }>
}

/**
 * Checks room inventory for every night in [checkIn, checkOut).
 * A missing RoomInventory row is treated as 0 (unavailable).
 */
export async function checkRoomAvailability(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
): Promise<AvailabilityResult> {
  const nightDates = getDatesInRange(checkIn, checkOut)

  const inventoryRecords = await prisma.roomInventory.findMany({
    where: {
      room_type_id: roomTypeId,
      date: { gte: checkIn, lt: checkOut },
    },
    select: { id: true, date: true, available_count: true },
  })

  const inventoryMap = new Map(
    inventoryRecords.map((r) => [toDateStr(r.date), r]),
  )

  const dates: DateAvailability[] = nightDates.map((d) => {
    const key = toDateStr(d)
    const record = inventoryMap.get(key)
    return {
      date: key,
      available_count: record?.available_count ?? 0,
    }
  })

  const available = dates.every((d) => d.available_count > 0)

  return { available, dates, inventoryRecords }
}
