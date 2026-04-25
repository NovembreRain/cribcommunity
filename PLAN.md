# Travellers Crib — Remaining Build Plan

> Every task is ~30 min. Run `npx vitest run --reporter=verbose` before starting each task and after completing it.
> Last updated: 2026-04-13

---

## ✅ Completed

- [x] Monorepo scaffold (Turborepo, pnpm workspaces, apps/web + apps/admin, packages/*)
- [x] Homepage hero (NavBar, HeroSection video, SectionShell, placeholder sections)
- [x] Booking API — GET /api/properties/[slug], GET /api/bookings/availability, POST /api/bookings, GET+POST /api/amenities
- [x] Booking API tests — 19 tests (amenities × 5, availability × 7, create × 7)
- [x] Location pages — LucideIcon, AmenityBadge, LocationCard, PropertyCard, /locations, /locations/[locationSlug]
- [x] Seed data — 3 locations (Goa/Manali/Rishikesh) + 6 properties + 12 room types + 60 amenity links
- [x] **Module A** — Property detail: RoomTypeCard, AvailabilityCalendar, BookingForm, PropertyBookingPanel, /properties/[slug]
- [x] **Module B** — UI component tests: RoomTypeCard × 6, LocationCard × 7, PropertyCard × 9, AvailabilityCalendar × 10
- [x] jsdom stubs for framer-motion (IntersectionObserver + ResizeObserver in setup.ts)
- [x] @testing-library/react + jest-dom installed

**Test count: 51/51 passing across 7 test files**

---

## ✅ Module C — Admin App (Complete)

- [x] C1 — Sidebar + layout (`apps/admin/app/layout.tsx`, `components/AdminSidebar.tsx`)
- [x] C2 — Dashboard (`apps/admin/app/page.tsx`) — stat cards + recent bookings table
- [x] C3 — Locations CRUD (`/locations`, `/locations/new`, `/locations/[id]/edit`, server actions)
- [x] C4 — Properties CRUD (`/properties`, `/properties/new`, `/properties/[id]/edit`, server actions)
- [x] C5 — Bookings (`/bookings`) — table + status update via server action
- [x] C6 — Events (`/events`) — approve/revoke per event
- [x] C7 — Blog (`/blog`, `/blog/new`) — list + create + publish/unpublish + delete
- [x] C8 — Jobs (`/jobs`, `/jobs/new`), Enquiries (`/enquiries`), FAQ (`/faq`, `/faq/new`), Users (`/users`)

**Admin build: 18 routes, 0 TypeScript errors**

---

---

## ✅ Module D — Community Pages (Complete)

- [x] D1 — Events: `/community/events` (filter by type) + `/community/events/[slug]` (registration form → EventRegistration)
- [x] D2 — Blog: `/community/blog` (category filter) + `/community/blog/[slug]` (article view)
- [x] D3 — Our Story: `/community/our-story` (timeline from DB, vertical line layout)
- [x] D4 — Jobs: `/community/jobs` + `/community/jobs/[slug]` (application form → JobApplication)

---

## ✅ Module E — Remaining Public Pages (Complete)

- [x] E1 — Contact page `/contact` — form (name/email/phone/message/intent) → server action → prisma.enquiry.create
- [x] E2 — Error boundary (`app/error.tsx`), loading state (`app/loading.tsx`), 404 (`app/not-found.tsx`)
- [ ] E3 — Footer component extraction (inline footer still duplicated across pages — low priority)
- [ ] E4 — Homepage community/testimonials section: replace placeholders with real DB data

---

---

## Module F: Infrastructure

### F1 — Error Boundaries + Loading States (~15 min)
**Files:** `apps/web/app/error.tsx`, `apps/web/app/loading.tsx`, `apps/web/app/not-found.tsx`
- Dark-themed global error page, loading skeleton, custom 404

### F2 — RLS Policies (~20 min)
- Enable Row Level Security on all Supabase tables via `mcp__supabase__apply_migration`
- Public read: Location, Property, RoomType, Amenity, Event (approved), BlogPost (published), FAQ, Job
- Write: service role only

### F3 — .env.example + README (~10 min)
**File:** `.env.example` at repo root
- Document all required variables with descriptions (no real secrets)

---

## Execution Order

```
C1 → C2 → C3 → C4 → C5 → C6 → C7 → C8   (admin)
D1 → D2 → D3 → D4                          (community)
E1 → E2 → E3                               (remaining public)
F1 → F2 → F3                               (infra — any time)
```

**Rule:** Run `npx vitest run --reporter=verbose` (from `apps/web`) before and after every task.
