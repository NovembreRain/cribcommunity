# SKILL: Test Runner

## PURPOSE
Write and run tests after every build phase. Verify current build works.
Verify nothing previously built is broken. Block progress if tests fail.

## TESTING STACK
- Unit + Integration tests → Vitest
- API route tests → Vitest + supertest (or native fetch mocks)
- React component tests → Vitest + React Testing Library
- E2E tests → Playwright
- DB test isolation → Prisma test client with seeded test DB

## FILE LOCATIONS
travellers-crib/
├── packages/db/
│ └── seed-test.ts ← test data seeder
├── apps/web/
│ └── _tests_/
│ ├── api/ ← API route tests
│ ├── components/ ← component tests
│ └── e2e/ ← Playwright E2E tests
├── apps/admin/
│ └── _tests_/
│ ├── api/
│ └── components/
└── vitest.config.ts ← root config

text

## TEST LAYERS (run in this order every time)

### Layer 1 — Unit Tests (fastest, run first)
Test pure logic in isolation:
- Booking overlap check function
- Availability calculation (nights × price)
- Date range validation
- Amenity sorting logic (popular first)
- Zod schema validation (valid + invalid inputs)

### Layer 2 — Integration Tests (API routes)
Test each API route against a real test DB:
- Correct response shape
- Correct status codes
- DB state after mutations (booking created, inventory decremented)
- Auth rejection on admin routes

### Layer 3 — Component Tests (UI)
Test React components with mocked data:
- AmenityPill renders correct Lucide icon
- RoomTypeCard shows "+N more" overflow correctly
- AvailabilityCalendar disables past dates
- AmenityPicker checkbox selection updates state

### Layer 4 — E2E Tests (Playwright, run last)
Test full user flows:
- Property page loads with room types + amenity pills
- Date selection on calendar triggers availability fetch
- Booking form submits and shows confirmation
- Admin: room type create with amenities saves correctly

## TEST WRITING RULES
- NEVER test with mock DB — use real Prisma test client
- ALWAYS seed a clean test state before each test suite
- ALWAYS clean up after tests (delete seeded records)
- ALWAYS test the happy path AND at least 2 failure paths
- NEVER skip testing edge cases on booking overlap logic
- Name tests as: "should [expected behaviour] when [condition]"

## STANDARD TEST STRUCTURE (Vitest)
```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db } from '@travellers-crib/db'

describe('[Module]: [Feature]', () => {
  beforeEach(async () => {
    await seedTestData()
  })

  afterEach(async () => {
    await cleanTestData()
  })

  it('should [expected result] when [condition]', async () => {
    // Arrange
    const input = { ... }
    // Act
    const result = await [function](input)
    // Assert
    expect(result).toMatchObject({ ... })
  })
})
```

## REGRESSION RULE (CRITICAL)
Before starting any new task:
→ Run ALL existing tests first
→ If any test fails → fix it before touching new code
→ Never build on top of broken functionality

## WHAT TO TEST PER MODULE

### Booking API
- ✅ Availability returns correct dates from RoomInventory
- ✅ Availability returns false when available_count = 0
- ✅ Booking creation decrements RoomInventory
- ✅ Overlapping booking is rejected with 409
- ✅ Invalid dates rejected with 400
- ✅ Missing fields rejected with 400
- ✅ Property > RoomType relationship validated

### Amenity System
- ✅ GET /api/amenities returns popular ones first
- ✅ POST /api/amenities creates custom amenity
- ✅ RoomType saves with correct amenity join records
- ✅ AmenityPill renders correct icon for each amenity

### Location + Property Pages
- ✅ /locations renders all locations
- ✅ /locations/[slug] returns 404 for invalid slug
- ✅ Property card shows starting price (lowest room type)
- ✅ Amenity pills show on property cards

### Admin
- ✅ Unauthenticated request to admin API returns 401
- ✅ Editor role cannot access bookings module
- ✅ Room type form saves to both RoomType and RoomTypeAmenity tables
- ✅ Booking status update via PATCH reflects in list view