/**
 * Seed / cleanup helpers for booking API tests.
 *
 * ⚠️  These functions write to the real database.
 *     Always call cleanBookingTestData() in afterAll/afterEach.
 *     Requires DATABASE_URL to be set in the environment.
 */

import { prisma } from '../index'

export interface TestBookingData {
  location: { id: string; slug: string }
  property: { id: string; slug: string }
  roomType: { id: string; price_per_night: number }
  amenities: Array<{ id: string }>
  /** First bookable night (tomorrow) — YYYY-MM-DD */
  checkIn: string
  /** Check-out date (checkIn + 3 nights) — YYYY-MM-DD */
  checkOut: string
  totalNights: number
  initialInventoryCount: number
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0] as string
}

function daysFromNow(n: number): Date {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + n)
  return new Date(toDateStr(d) + 'T00:00:00.000Z')
}

/**
 * Creates a full Location → Property → RoomType → Amenities → 30-day inventory chain.
 * All IDs are prefixed with a unique run-scoped UUID so parallel runs don't collide.
 * The check-in window starts tomorrow; the default test window is 3 nights.
 */
export async function seedBookingTestData(
  opts: { inventoryCount?: number } = {},
): Promise<TestBookingData> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example → .env and fill in the Supabase connection string.',
    )
  }

  const runId = crypto.randomUUID().slice(0, 8)
  const initialInventoryCount = opts.inventoryCount ?? 3

  const location = await prisma.location.create({
    data: {
      id: `test-loc-${runId}`,
      name: `Test Location ${runId}`,
      slug: `test-location-${runId}`,
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
    },
  })

  const property = await prisma.property.create({
    data: {
      id: `test-prop-${runId}`,
      location_id: location.id,
      name: `Test Property ${runId}`,
      slug: `test-property-${runId}`,
      address: '1 Test Street',
    },
  })

  const roomType = await prisma.roomType.create({
    data: {
      id: `test-rt-${runId}`,
      property_id: property.id,
      name: 'Test Dorm',
      capacity: 6,
      price_per_night: 999,
    },
  })

  const amenity1 = await prisma.amenity.create({
    data: {
      id: `test-amen-1-${runId}`,
      name: 'WiFi',
      icon: 'wifi',
      category: 'connectivity',
      is_popular: true,
    },
  })

  const amenity2 = await prisma.amenity.create({
    data: {
      id: `test-amen-2-${runId}`,
      name: 'Locker',
      icon: 'lock',
      category: 'security',
      is_popular: false,
    },
  })

  await prisma.roomTypeAmenity.createMany({
    data: [
      { id: `test-rta-1-${runId}`, room_type_id: roomType.id, amenity_id: amenity1.id },
      { id: `test-rta-2-${runId}`, room_type_id: roomType.id, amenity_id: amenity2.id },
    ],
  })

  // Seed 30 days of inventory starting tomorrow
  const inventoryRows = Array.from({ length: 30 }, (_, i) => ({
    id: `test-inv-${runId}-${i}`,
    room_type_id: roomType.id,
    date: daysFromNow(i + 1),
    available_count: initialInventoryCount,
  }))
  await prisma.roomInventory.createMany({ data: inventoryRows })

  const checkIn = toDateStr(daysFromNow(1))
  const checkOut = toDateStr(daysFromNow(4)) // 3 nights

  return {
    location: { id: location.id, slug: location.slug },
    property: { id: property.id, slug: property.slug },
    roomType: { id: roomType.id, price_per_night: roomType.price_per_night },
    amenities: [{ id: amenity1.id }, { id: amenity2.id }],
    checkIn,
    checkOut,
    totalNights: 3,
    initialInventoryCount,
  }
}

/**
 * Deletes all records created by seedBookingTestData in safe reverse order.
 * Call in afterAll / afterEach.
 */
export async function cleanBookingTestData(data: TestBookingData): Promise<void> {
  await prisma.booking.deleteMany({ where: { room_type_id: data.roomType.id } })
  await prisma.roomInventory.deleteMany({ where: { room_type_id: data.roomType.id } })
  await prisma.roomTypeAmenity.deleteMany({ where: { room_type_id: data.roomType.id } })
  await prisma.amenity.deleteMany({
    where: { id: { in: data.amenities.map((a) => a.id) } },
  })
  await prisma.roomType.deleteMany({ where: { id: data.roomType.id } })
  await prisma.property.deleteMany({ where: { id: data.property.id } })
  await prisma.location.deleteMany({ where: { id: data.location.id } })
}
