// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '@crib/db'
import { GET } from '@/app/api/bookings/availability/route'
import {
  seedBookingTestData,
  cleanBookingTestData,
  type TestBookingData,
} from '@test-helpers/seed-booking'

function makeRequest(params: Record<string, string>) {
  const url = new URL('http://localhost/api/bookings/availability')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new NextRequest(url)
}

function daysFromNowStr(n: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().split('T')[0] as string
}

describe('GET /api/bookings/availability', () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let testData!: TestBookingData

  beforeAll(async () => {
    testData = await seedBookingTestData({ inventoryCount: 2 })
  })

  afterAll(async () => {
    if (testData) await cleanBookingTestData(testData)
  })

  it('should return available:true when inventory exists for all dates', async () => {
    const req = makeRequest({
      room_type_id: testData.roomType.id,
      check_in: testData.checkIn,
      check_out: testData.checkOut,
    })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.available).toBe(true)
  })

  it('should return available:false when any date has available_count = 0', async () => {
    // Set one inventory record to 0 for the test window
    await prisma.roomInventory.updateMany({
      where: {
        room_type_id: testData.roomType.id,
        date: new Date(`${testData.checkIn}T00:00:00.000Z`),
      },
      data: { available_count: 0 },
    })

    const req = makeRequest({
      room_type_id: testData.roomType.id,
      check_in: testData.checkIn,
      check_out: testData.checkOut,
    })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.available).toBe(false)

    // Restore for subsequent tests
    await prisma.roomInventory.updateMany({
      where: {
        room_type_id: testData.roomType.id,
        date: new Date(`${testData.checkIn}T00:00:00.000Z`),
      },
      data: { available_count: testData.initialInventoryCount },
    })
  })

  it('should return 400 when room_type_id is missing', async () => {
    const req = makeRequest({
      check_in: testData.checkIn,
      check_out: testData.checkOut,
    })
    const res = await GET(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Invalid query parameters')
  })

  it('should return 400 when check_in is after check_out', async () => {
    const req = makeRequest({
      room_type_id: testData.roomType.id,
      check_in: testData.checkOut,   // reversed
      check_out: testData.checkIn,
    })
    const res = await GET(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('check_out must be after check_in')
  })

  it('should return 400 when check_in is a past date', async () => {
    const yesterday = daysFromNowStr(-1)
    const dayAfterYesterday = daysFromNowStr(0) // today
    const req = makeRequest({
      room_type_id: testData.roomType.id,
      check_in: yesterday,
      check_out: dayAfterYesterday,
    })
    const res = await GET(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('check_in cannot be in the past')
  })

  it('should return correct total_amount (nights × price_per_night)', async () => {
    const req = makeRequest({
      room_type_id: testData.roomType.id,
      check_in: testData.checkIn,
      check_out: testData.checkOut,
    })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    const expected = parseFloat(
      (testData.roomType.price_per_night * testData.totalNights).toFixed(2),
    )
    expect(body.data.total_amount).toBe(expected)
    expect(body.data.total_nights).toBe(testData.totalNights)
    expect(body.data.price_per_night).toBe(testData.roomType.price_per_night)
  })

  it('should return per-date breakdown array with one entry per night', async () => {
    const req = makeRequest({
      room_type_id: testData.roomType.id,
      check_in: testData.checkIn,
      check_out: testData.checkOut,
    })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data.dates)).toBe(true)
    expect(body.data.dates).toHaveLength(testData.totalNights)
    // Each entry has date + available_count
    for (const entry of body.data.dates) {
      expect(entry).toHaveProperty('date')
      expect(entry).toHaveProperty('available_count')
      expect(typeof entry.available_count).toBe('number')
    }
  })
})
