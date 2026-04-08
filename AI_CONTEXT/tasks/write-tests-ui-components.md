# TASK: Write Tests — UI Components

## RUN AFTER: build-availability-calendar.md is complete

## BEFORE YOU START
Read:
- AI_CONTEXT/skills/test-runner.md
- AI_CONTEXT/skills/ui-builder.md
- The actual component files you built

---

## FILE 1: AmenityPill Tests
File: apps/web/__tests__/components/AmenityPill.test.tsx

Tests:
- should render amenity name as text
- should render a Lucide icon when valid icon name is provided
- should not crash when icon name is unknown (fallback gracefully)
- should apply correct Tailwind classes (pill shape)

---

## FILE 2: RoomTypeCard Tests
File: apps/web/__tests__/components/RoomTypeCard.test.tsx

Tests:
- should render room name, capacity, and price
- should render up to 6 amenity pills
- should show "+N more" badge when amenities exceed 6
- should call onSelectRoom with correct roomTypeId on CTA click
- should render all amenity icons without crashing

---

## FILE 3: AvailabilityCalendar Tests
File: apps/web/__tests__/components/AvailabilityCalendar.test.tsx

Mock the API call (GET /api/bookings/availability) in these tests.

Tests:
- should render current month by default
- should disable past dates
- should mark dates red when available_count = 0 (from mocked API)
- should mark dates green when available_count > 0
- should call onRangeSelect with correct ISO strings after both dates selected
- should show loading skeleton while API is fetching
- should show error message when API returns error
- should block selection if any date in range is unavailable

---

## DONE WHEN
- [ ] All component tests written and passing
- [ ] Mocked API responses cover all calendar date states
- [ ] npx vitest run apps/web/__tests__/components/ exits 0 errors