# TASK: Build Availability Calendar UI

## BEFORE YOU START
Read:
- AI_CONTEXT/system.md
- AI_CONTEXT/skills/ui-builder.md
- AI_CONTEXT/skills/booking-engine.md
- AI_CONTEXT/design-map.json (find Calendar component)
- packages/db/schema.prisma (RoomInventory, RoomType, Amenity)

Confirm: what calendar component exists in packages/ui?
Do not start until confirmed.

## GOAL
Build availability calendar + room type card with amenity pills on the property page.

---

## COMPONENT 1: AmenityPill
File: packages/ui/AmenityPill.tsx

```tsx
interface AmenityPillProps {
  name: string
  icon: string  // Lucide icon name
}
```

Render: Lucide icon (dynamic) + name label as a rounded pill
Style: bg-gray-100, text-sm, rounded-full, flex items-center gap-1.5 px-3 py-1.5

---

## COMPONENT 2: RoomTypeCard
File: apps/web/components/property/RoomTypeCard.tsx

```tsx
interface RoomTypeCardProps {
  roomType: {
    id: string
    name: string
    capacity: number
    price_per_night: number
    amenities: { name: string; icon: string; category: string }[]
  }
  onSelectRoom: (roomTypeId: string) => void
}
```

Layout:
- Room name + capacity badge
- Price per night
- Amenity pills row (flex-wrap): show first 6, then "+N more" badge
- "Check Availability" CTA button

---

## COMPONENT 3: AvailabilityCalendar
File: apps/web/components/property/AvailabilityCalendar.tsx

```tsx
interface AvailabilityCalendarProps {
  roomTypeId: string
  pricePerNight: number
  onRangeSelect: (checkIn: string, checkOut: string, totalAmount: number) => void
}
```

Behaviour:
- Monthly calendar view
- Date color coding:
  - Green → available_count > 0
  - Red → available_count = 0
  - Grey → past date (unselectable)
- User selects check_in then check_out
- On selection → call GET /api/bookings/availability
- Show total nights + total amount below calendar
- Unavailable dates in selected range → inline error, block proceeding

States: Loading skeleton | Error message | Empty (prompt to select dates)

---

## RULES
- Use existing calendar from packages/ui if it exists
- AmenityPill must use Lucide dynamic imports — never hardcode icon components
- No mock data for availability or amenities
- Tailwind only

## DONE WHEN
- [ ] AmenityPill renders Lucide icon + name correctly for any icon string
- [ ] RoomTypeCard shows amenities as pills with "+N more" overflow
- [ ] Calendar renders real RoomInventory data
- [ ] Date range selection calls availability API
- [ ] onRangeSelect fires with correct ISO strings + calculated total

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