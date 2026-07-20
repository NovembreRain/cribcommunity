/**
 * Idempotently backfills RoomInventory so every RoomType is bookable for the
 * next WINDOW_DAYS days from today. Only missing dates are created (at the
 * room's full capacity) — existing rows, including ones already decremented
 * by real bookings, are never touched.
 *
 * Run this periodically (the original one-time seed silently expires once
 * its date window is in the past — that's what caused the site-wide "no
 * availability" outage this script fixes).
 *
 * Usage: pnpm --filter @crib/db db:seed-inventory
 */
import { prisma } from '../src/index'

const WINDOW_DAYS = 365

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0] as string
}

function utcMidnight(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`)
}

async function main() {
  const roomTypes = await prisma.roomType.findMany({
    select: { id: true, name: true, capacity: true },
  })
  const today = utcMidnight(toDateStr(new Date()))

  let totalCreated = 0
  for (const rt of roomTypes) {
    const existing = await prisma.roomInventory.findMany({
      where: { room_type_id: rt.id, date: { gte: today } },
      select: { date: true },
    })
    const existingDates = new Set(existing.map((r) => toDateStr(r.date)))

    const rows: Array<{ id: string; room_type_id: string; date: Date; available_count: number }> = []
    for (let i = 0; i < WINDOW_DAYS; i++) {
      const d = new Date(today)
      d.setUTCDate(d.getUTCDate() + i)
      const dateStr = toDateStr(d)
      if (existingDates.has(dateStr)) continue
      rows.push({
        id: crypto.randomUUID(),
        room_type_id: rt.id,
        date: d,
        available_count: rt.capacity,
      })
    }

    if (rows.length > 0) {
      await prisma.roomInventory.createMany({ data: rows })
      totalCreated += rows.length
    }
    console.log(
      `${rt.name}: +${rows.length} day(s) backfilled (${existingDates.size} already present)`,
    )
  }

  console.log(`\nDone. ${totalCreated} RoomInventory row(s) created across ${roomTypes.length} room type(s).`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
