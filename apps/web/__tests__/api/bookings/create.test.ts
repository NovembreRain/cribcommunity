// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '@crib/db'
import { POST } from '@/app/api/bookings/route'
import {
  seedBookingTestData,
  cleanBookingTestData,
  type TestBookingData,
} from '@test-helpers/seed-booking'

function makePostRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/bookings', () => {
  let testData: TestBookingData

  beforeAll(async () => {
    // Use count=2 so we can cancel-and-rebook in the cancelled-booking test
    testData = await seedBookingTestData({ inventoryCount: 2 })
  })

  afterAll(async () => {
    await cleanBookingTestData(testData)
  })

  it('should create booking and return booking_id when valid input', async () => {
    const req = makePostRequest({
      property_id: testData.property.id,
      room_type_id: testData.roomType.id,
      guest_name: 'Test Guest',
      guest_email: 'test-happy-path@example.com',
      check_in_date: testData.checkIn,
      check_out_date: testData.checkOut,
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data).toHaveProperty('booking_id')
    expect(body.data.status).toBe('confirmed')
    expect(body.data.total_amount).toBe(
      parseFloat((testData.roomType.price_per_night * testData.totalNights).toFixed(2)),
    )
  })

  it('should decrement RoomInventory available_count after booking', async () => {
    // Read inventory before
    const before = await prisma.roomInventory.findMany({
      where: {
        room_type_id: testData.roomType.id,
        date: {
          gte: new Date(`${testData.checkIn}T00:00:00.000Z`),
          lt: new Date(`${testData.checkOut}T00:00:00.000Z`),
        },
      },
      orderBy: { date: 'asc' },
    })
    const countBefore = before[0]?.available_count ?? 0

    const req = makePostRequest({
      property_id: testData.property.id,
      room_type_id: testData.roomType.id,
      guest_name: 'Decrement Tester',
      guest_email: 'test-decrement@example.com',
      check_in_date: testData.checkIn,
      check_out_date: testData.checkOut,
    })
    const res = await POST(req)
    expect(res.status).toBe(201)

    const after = await prisma.roomInventory.findMany({
      where: {
        room_type_id: testData.roomType.id,
        date: {
          gte: new Date(`${testData.checkIn}T00:00:00.000Z`),
          lt: new Date(`${testData.checkOut}T00:00:00.000Z`),
        },
      },
    })
    for (const inv of after) {
      expect(inv.available_count).toBe(countBefore - 1)
    }
  })

  it('should return 409 when booking overlaps existing confirmed booking', async () => {
    // Drain remaining inventory via previous tests — ensure at least one booking exists
    // First confirm there's a confirmed booking by creating one if needed
    await prisma.booking.deleteMany({
      where: {
        room_type_id: testData.roomType.id,
        booking_status: 'confirmed',
        check_in_date: new Date(`${testData.checkIn}T00:00:00.000Z`),
      },
    })
    // Set inventory to 0 so the availability guard triggers
    await prisma.roomInventory.updateMany({
      where: { room_type_id: testData.roomType.id },
      data: { available_count: 0 },
    })
    // Manually insert a confirmed booking to trigger the overlap path
    await prisma.booking.create({
      data: {
        id: crypto.randomUUID(),
        property_id: testData.property.id,
        room_type_id: testData.roomType.id,
        guest_name: 'Existing Guest',
        guest_email: 'test-existing@example.com',
        check_in_date: new Date(`${testData.checkIn}T00:00:00.000Z`),
        check_out_date: new Date(`${testData.checkOut}T00:00:00.000Z`),
        total_amount: 2997,
        payment_status: 'pending',
        booking_status: 'confirmed',
        source: 'web',
      },
    })

    const req = makePostRequest({
      property_id: testData.property.id,
      room_type_id: testData.roomType.id,
      guest_name: 'Overlapping Guest',
      guest_email: 'test-overlap@example.com',
      check_in_date: testData.checkIn,
      check_out_date: testData.checkOut,
    })
    const res = await POST(req)
    expect(res.status).toBe(409)
  })

  it('should NOT return 409 when existing booking is cancelled', async () => {
    // Cancel all confirmed bookings for this room_type
    await prisma.booking.updateMany({
      where: {
        room_type_id: testData.roomType.id,
        booking_status: 'confirmed',
      },
      data: { booking_status: 'cancelled' },
    })
    // Restore inventory to allow the new booking
    await prisma.roomInventory.updateMany({
      where: { room_type_id: testData.roomType.id },
      data: { available_count: testData.initialInventoryCount },
    })

    const req = makePostRequest({
      property_id: testData.property.id,
      room_type_id: testData.roomType.id,
      guest_name: 'New Guest',
      guest_email: 'test-after-cancel@example.com',
      check_in_date: testData.checkIn,
      check_out_date: testData.checkOut,
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })

  it('should return 400 when guest_email is invalid format', async () => {
    const req = makePostRequest({
      property_id: testData.property.id,
      room_type_id: testData.roomType.id,
      guest_name: 'Bad Email Guest',
      guest_email: 'not-an-email',
      check_in_date: testData.checkIn,
      check_out_date: testData.checkOut,
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Validation failed')
  })

  it('should return 400 when property_id and room_type_id do not match', async () => {
    const req = makePostRequest({
      property_id: 'non-existent-property-id',
      room_type_id: testData.roomType.id,
      guest_name: 'Mismatch Guest',
      guest_email: 'test-mismatch@example.com',
      check_in_date: testData.checkIn,
      check_out_date: testData.checkOut,
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Room type not found for this property')
  })

  it('should return 400 when required fields are missing', async () => {
    const req = makePostRequest({
      // Missing: property_id, room_type_id, check_in_date, check_out_date
      guest_name: 'Incomplete Guest',
      guest_email: 'test-incomplete@example.com',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Validation failed')
    expect(body.details).toBeDefined()
  })
})
