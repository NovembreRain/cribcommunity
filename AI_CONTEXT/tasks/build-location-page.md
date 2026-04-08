# TASK: Build Location Page

## BEFORE YOU START
Read:
- AI_CONTEXT/system.md
- AI_CONTEXT/skills/ui-builder.md
- AI_CONTEXT/skills/api-builder.md
- AI_CONTEXT/design-map.json (LocationCard, PropertyCard, HeroSection)
- packages/db/schema.prisma (Location, Property, RoomType, Amenity, Media)

Confirm existing components in apps/web/components/location/ before creating anything.

## GOAL
Build /locations and /locations/[locationSlug] with real data + amenity preview.

---

## PAGE 1: /locations
File: apps/web/app/locations/page.tsx

Data: All Locations, include _count of properties
Layout: Grid of LocationCards — image, name, city/state, property count, CTA

---

## PAGE 2: /locations/[locationSlug]
File: apps/web/app/locations/[locationSlug]/page.tsx

Data:
- Location by slug
- Include: Properties → RoomTypes → Amenities → Amenity
- If not found → notFound()

Layout:
- Hero: location name + cover image
- Description
- Properties grid — each PropertyCard shows:
  - name, address
  - Top 4 popular amenities as icon pills (from first RoomType)
  - Starting price (lowest price_per_night across all room types)
  - CTA → /properties/[propertySlug]

---

## DATA RULES
- Server components only — no useEffect for initial data
- Fetch via packages/db directly in async page.tsx
- Images via Next.js Image + Media table media_id

## DONE WHEN
- [ ] /locations renders all locations with real DB data
- [ ] /locations/[locationSlug] shows location + properties
- [ ] Each property card shows amenity icon pills
- [ ] Starting price calculated from real RoomType data
- [ ] notFound() works for invalid slugs
- [ ] SEO metadata correct on both pages

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