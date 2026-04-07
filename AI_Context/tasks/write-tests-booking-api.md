# TASK: Write Tests — Booking API

## RUN AFTER: build-booking-api.md is complete and verified

## BEFORE YOU START
Read:
- AI_CONTEXT/skills/test-runner.md
- AI_CONTEXT/skills/booking-engine.md
- The actual route files you built in apps/web/app/api/

## GOAL
Write the full test suite for the booking API layer.

---

## FILE 1: Test Seed Helper
File: packages/db/test-helpers/seed-booking.ts

Create reusable seed/cleanup functions:
```ts
export async function seedBookingTestData() {
  // Create: Location > Property > RoomType > Amenities > RoomInventory (next 30 days)
}
export async function cleanBookingTestData() {
  // Delete all seeded test records in reverse order
}
```

---

## FILE 2: Availability Route Tests
File: apps/web/__tests__/api/bookings/availability.test.ts

Tests to write:
- should return available:true when inventory exists for all dates
- should return available:false when any date has available_count = 0
- should return 400 when room_type_id is missing
- should return 400 when check_in is after check_out
- should return 400 when check_in is a past date
- should return correct total_amount (nights × price_per_night)
- should return per-date breakdown array

---

## FILE 3: Booking Creation Tests
File: apps/web/__tests__/api/bookings/create.test.ts

Tests to write:
- should create booking and return booking_id when valid input
- should decrement RoomInventory available_count after booking
- should return 409 when booking overlaps existing confirmed booking
- should NOT return 409 when existing booking is cancelled
- should return 400 when guest_email is invalid format
- should return 400 when property_id and room_type_id don't match
- should return 400 when required fields are missing

---

## FILE 4: Amenity API Tests
File: apps/web/__tests__/api/amenities.test.ts

Tests to write:
- should return popular amenities before non-popular
- should return all amenities grouped by category
- should create custom amenity via POST
- should return 400 when amenity name is empty
- should return 400 when icon is not a valid Lucide name

---

## DONE WHEN
- [ ] Seed/cleanup helpers created and working
- [ ] All tests written and passing
- [ ] Each route has happy path + minimum 2 failure paths tested
- [ ] npx vitest run apps/web/__tests__/api/ exits with 0 errors