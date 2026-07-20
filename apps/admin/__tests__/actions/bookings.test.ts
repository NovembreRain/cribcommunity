// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { prisma } from '@crib/db'
import { updateBookingStatus } from '@/app/bookings/actions'
import {
  seedBookingTestData,
  cleanBookingTestData,
  type TestBookingData,
} from '@test-helpers/seed-booking'

// updateBookingStatus is a Next.js Server Action — revalidatePath needs a
// request-scoped store that doesn't exist under plain vitest execution.
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

function makeFormData(id: string, status: string): FormData {
  const fd = new FormData()
  fd.set('id', id)
  fd.set('status', status)
  return fd
}

describe('updateBookingStatus', () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let testData!: TestBookingData
  let bookingId: string

  beforeAll(async () => {
    testData = await seedBookingTestData({ inventoryCount: 3 })
    const booking = await prisma.booking.create({
      data: {
        id: crypto.randomUUID(),
        property_id: testData.property.id,
        room_type_id: testData.roomType.id,
        guest_name: 'Cancel Tester',
        guest_email: 'test-cancel@example.com',
        check_in_date: new Date(`${testData.checkIn}T00:00:00.000Z`),
        check_out_date: new Date(`${testData.checkOut}T00:00:00.000Z`),
        total_amount: testData.roomType.price_per_night * testData.totalNights,
        payment_status: 'pending',
        booking_status: 'confirmed',
        source: 'web',
      },
    })
    bookingId = booking.id
  })

  afterAll(async () => {
    if (bookingId) await prisma.booking.deleteMany({ where: { id: bookingId } })
    if (testData) await cleanBookingTestData(testData)
  })

  async function inventoryCounts(): Promise<number[]> {
    const rows = await prisma.roomInventory.findMany({
      where: {
        room_type_id: testData.roomType.id,
        date: {
          gte: new Date(`${testData.checkIn}T00:00:00.000Z`),
          lt: new Date(`${testData.checkOut}T00:00:00.000Z`),
        },
      },
      orderBy: { date: 'asc' },
    })
    return rows.map((r) => r.available_count)
  }

  it('restores inventory when a confirmed booking is cancelled', async () => {
    const before = await inventoryCounts()
    await updateBookingStatus(makeFormData(bookingId, 'cancelled'))
    const after = await inventoryCounts()
    after.forEach((count, i) => expect(count).toBe(before[i]! + 1))

    const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } })
    expect(booking.booking_status).toBe('cancelled')
  })

  it('does not double-restore inventory when cancelling an already-cancelled booking', async () => {
    const before = await inventoryCounts()
    await updateBookingStatus(makeFormData(bookingId, 'cancelled'))
    const after = await inventoryCounts()
    expect(after).toEqual(before)
  })

  it('re-reserves inventory when a cancelled booking is reinstated', async () => {
    const before = await inventoryCounts()
    await updateBookingStatus(makeFormData(bookingId, 'confirmed'))
    const after = await inventoryCounts()
    after.forEach((count, i) => expect(count).toBe(before[i]! - 1))
  })

  it('throws and leaves booking_status unchanged when reinstating without available inventory', async () => {
    await updateBookingStatus(makeFormData(bookingId, 'cancelled'))
    await prisma.roomInventory.updateMany({
      where: {
        room_type_id: testData.roomType.id,
        date: {
          gte: new Date(`${testData.checkIn}T00:00:00.000Z`),
          lt: new Date(`${testData.checkOut}T00:00:00.000Z`),
        },
      },
      data: { available_count: 0 },
    })

    await expect(
      updateBookingStatus(makeFormData(bookingId, 'confirmed')),
    ).rejects.toThrow()

    const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } })
    expect(booking.booking_status).toBe('cancelled')
  })

  it('rejects an invalid status value without writing to the database', async () => {
    const before = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } })
    await expect(
      updateBookingStatus(makeFormData(bookingId, 'not-a-real-status')),
    ).rejects.toThrow()
    const after = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } })
    expect(after.booking_status).toBe(before.booking_status)
  })
})
