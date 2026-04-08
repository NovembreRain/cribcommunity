# TASK: Build Booking API

## BEFORE YOU START
Read and internalize:
- AI_CONTEXT/system.md
- AI_CONTEXT/skills/booking-engine.md
- AI_CONTEXT/skills/api-builder.md
- packages/db/schema.prisma
  Focus on: Location, Property, RoomType, Amenity, RoomTypeAmenity, RoomInventory, Booking

Confirm the full hierarchy: Location > Property > RoomType > Amenity
Summarize the Booking model fields before writing any code.

## GOAL
Build three API routes for the full booking flow.

---

## ROUTE 1: Get Property with Room Types + Amenities
GET /api/properties/[slug]

Logic:
1. Fetch Property by slug
2. Include: location, roomTypes → amenities → amenity (icon, name, category)
3. Sort amenities: is_popular first, then by category

Output:
```json
{
  "data": {
    "id": "...",
    "name": "...",
    "location": { "name": "...", "city": "..." },
    "roomTypes": [
      {
        "id": "...",
        "name": "...",
        "capacity": 4,
        "price_per_night": 999,
        "amenities": [
          { "id": "...", "name": "Free WiFi", "icon": "Wifi", "category": "connectivity" }
        ]
      }
    ]
  }
}
```

---

## ROUTE 2: Check Availability
GET /api/bookings/availability

Input (query params): room_type_id, check_in (YYYY-MM-DD), check_out (YYYY-MM-DD)

Logic:
1. Validate query params with Zod
2. Verify room_type_id belongs to a valid RoomType
3. Query RoomInventory for all dates between check_in and check_out - 1
4. Return available: true/false + per-date breakdown

Output:
```json
{
  "data": {
    "available": true,
    "price_per_night": 999,
    "total_nights": 3,
    "total_amount": 2997,
    "dates": [
      { "date": "2026-04-10", "available_count": 2 }
    ]
  }
}
```

---

## ROUTE 3: Create Booking
POST /api/bookings

Input:
- property_id, room_type_id
- guest_name, guest_email, guest_phone
- check_in_date, check_out_date

Logic:
1. Validate with Zod
2. Verify property_id > room_type_id relationship is valid in DB
3. Run availability check (reuse Route 2 logic)
4. Run overlap check on Booking table
5. If clear → create Booking + decrement RoomInventory (Prisma transaction)
6. Return booking record

Output:
```json
{
  "data": {
    "booking_id": "...",
    "status": "confirmed",
    "total_amount": 2997,
    "check_in_date": "2026-04-10",
    "check_out_date": "2026-04-13"
  }
}
```

---

## ROUTE 4: Get Amenities List (for Admin Picker)
GET /api/amenities

Logic:
1. Fetch all Amenities
2. Sort: is_popular = true first, then by category alphabetically

Output:
```json
{
  "data": {
    "popular": [ { "id": "...", "name": "Free WiFi", "icon": "Wifi", "category": "connectivity" } ],
    "all": [ ... ]
  }
}
```

---

## CONSTRAINTS
- Use packages/db — no direct Prisma imports
- No mock data
- Prisma transactions for multi-write operations
- Return { error: "..." } with correct status on failure

## DONE WHEN
- [ ] GET /api/properties/[slug] returns full hierarchy with amenity icons
- [ ] GET /api/bookings/availability returns real RoomInventory data
- [ ] POST /api/bookings validates, checks overlap, creates booking + decrements inventory
- [ ] GET /api/amenities returns popular + all, sorted correctly
- [ ] All routes reject bad input with 400 + Zod error details


---

## ✅ POST-BUILD VERIFICATION
After completing this task, run before moving on:

1. Run tests for this module:
   npx vitest run --reporter=verbose [relevant test path]

2. Run regression check on all previously built modules:
   Execute AI_CONTEXT/tasks/run-tests.md

3. If all pass → confirm with:
   "All tests passing. Safe to proceed to next task."

4. If any fail → fix before proceeding. Do not build on broken ground.