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

## → Next: Module C — Admin App

### C1 — Admin Layout + Sidebar (~25 min)
**Files:** `apps/admin/app/layout.tsx`, `apps/admin/components/AdminSidebar.tsx`, `apps/admin/middleware.ts`
- Sidebar nav: Dashboard, Locations, Properties, Bookings, Events, Blog, Jobs, Enquiries, FAQ, Users
- Topbar: current page title + logout button placeholder
- Auth guard via middleware: redirect to /login if no session (use next-auth or simple cookie check for now)
- Style: `surface-dark` sidebar, `gold-border/20` dividers, Ethereal Glow tokens
- Install `next-auth@beta` in apps/admin

### C2 — Admin Dashboard (~20 min)
**File:** `apps/admin/app/page.tsx`
- Parallel Prisma counts:
  ```ts
  const [locations, properties, confirmedBookings, events] = await Promise.all([
    prisma.location.count(),
    prisma.property.count(),
    prisma.booking.count({ where: { booking_status: 'confirmed' } }),
    prisma.event.count({ where: { is_approved: true } }),
  ])
  ```
- Stat cards: Locations, Properties, Active Bookings, Events
- Recent bookings table: last 10, columns: guest name, property, check-in/out, total, status

### C3 — Locations CRUD (~25 min)
**Files:** `apps/admin/app/locations/page.tsx`, `.../new/page.tsx`, `.../[id]/edit/page.tsx`
- Table: name, slug, city, country, property count
- Create/edit form: name, slug (auto from name via `slugify()`), city, state, country, description
- Server actions for create + update + delete

### C4 — Properties + RoomType Management (~30 min)
**Files:** `apps/admin/app/properties/page.tsx`, `.../[id]/page.tsx`, `.../[id]/rooms/new/page.tsx`
- Properties table with location filter
- Property detail: show room types list
- New room form: name, description, capacity, price_per_night, images (URL inputs), amenity multi-select
- Amenity multi-select: populate from GET /api/amenities, popular shown first, custom add option

### C5 — Bookings Management (~20 min)
**File:** `apps/admin/app/bookings/page.tsx`
- Table: guest, email, property, room type, check-in/out, amount, payment status, booking status
- Filter by: status, property, date range
- Server actions: update booking_status (confirmed → checked_in → checked_out / cancelled)

### C6 — Events Management (~25 min)
**Files:** `apps/admin/app/events/page.tsx`, `.../new/page.tsx`
- Table with approve/reject actions (updates `is_approved`)
- Create event: name, slug, type (social/workshop/music/wellness), location_id, description, start/end datetime
- EventProposal review panel (proposals from public)

### C7 — Blog Management (~25 min)
**Files:** `apps/admin/app/blog/page.tsx`, `.../new/page.tsx`, `.../[id]/edit/page.tsx`
- List posts with status filter (draft/published)
- Create/edit: title, slug, excerpt, content (textarea), category, featured_media_id, status, published_at

### C8 — Jobs, Enquiries, FAQ (~20 min each)
**Jobs** `apps/admin/app/jobs/` — list + create + view applications table
**Enquiries** `apps/admin/app/enquiries/` — table + status update (new → responded → closed)
**FAQ** `apps/admin/app/faq/` — list + create + sort_order drag or up/down buttons

---

## Module D: Community Pages (Public)

### D1 — Events Listing + Detail (~25 min)
**Files:** `apps/web/app/community/events/page.tsx`, `.../[slug]/page.tsx`
- Listing: only `is_approved = true`, filter by type
- Detail: description, datetime, location, registration form (creates EventRegistration)

### D2 — Blog Listing + Article (~20 min)
**Files:** `apps/web/app/community/blog/page.tsx`, `.../[slug]/page.tsx`
- Published posts only, sorted by `published_at desc`, category filter tabs
- Article: title, content, published date, category tag

### D3 — Our Story Page (~15 min)
**File:** `apps/web/app/community/our-story/page.tsx`
- Timeline of TimelineEvent records ordered by sort_order
- Placeholder if no data

### D4 — Jobs + Careers (~20 min)
**Files:** `apps/web/app/community/jobs/page.tsx`, `.../[slug]/page.tsx`
- Active jobs (valid_through > today or null)
- Application form → creates JobApplication

---

## Module E: Remaining Public Pages

### E1 — Contact / Enquiry Page (~15 min)
**File:** `apps/web/app/contact/page.tsx`
- Form: name, email, phone, message, intent
- Submit → POST /api/enquiries (add new API route)

### E2 — Homepage Placeholder Replacements (~20 min)
**File:** `apps/web/app/page.tsx`
- Community section: real EventCard × 3 + BlogCard × 3 from DB
- Testimonials section: real TestimonialCard × 4 from DB

### E3 — Footer Component (~15 min)
**File:** `apps/web/components/home/Footer.tsx`
- Extract repeated footer into reusable component
- Replace inline footers in /, /locations, /locations/[slug], /properties/[slug]

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
