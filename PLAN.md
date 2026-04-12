# Travellers Crib — Remaining Build Plan

> Every task is ~30 min. Run `npx vitest run --reporter=verbose` before starting each task and after completing it.
> Last updated: 2026-04-12

---

## ✅ Completed

- [x] Monorepo scaffold (Turborepo, pnpm workspaces, apps/web + apps/admin, packages/*)
- [x] Homepage hero (NavBar, HeroSection video, SectionShell, placeholder sections)
- [x] Booking API (4 routes: GET /api/properties/[slug], GET /api/bookings/availability, POST /api/bookings, GET+POST /api/amenities)
- [x] Booking API tests (19 tests — amenities × 5, availability × 7, create × 7)
- [x] Location pages (LucideIcon, AmenityBadge, LocationCard, PropertyCard, /locations, /locations/[slug])
- [x] Seed data (3 locations × 2 properties × 2 room types × 5 amenities in Supabase)

---

## Module A: Property Detail Page

### A1 — Property Page Shell (~20 min)
**File:** `apps/web/app/properties/[slug]/page.tsx`
- Server component, `force-dynamic`, `notFound()` guard
- Fetch via `prisma.property.findUnique({ where: { slug }, include: { location, room_types: { include: { amenities: { include: { amenity } } } } } })`
- Order room types by `price_per_night asc`
- Dynamic metadata: `title = property.name`, `description = property.description`
- Render: NavBar + hero image (first room type image or gradient) + property name/address + location breadcrumb (link back to `/locations/[slug]`) + room types section + Footer
- Pass room type data down to `RoomTypeCard` + `AvailabilityCalendar` (built in A2)

### A2 — RoomTypeCard Component (~20 min)
**File:** `apps/web/components/property/RoomTypeCard.tsx`
- Client component (`'use client'` — has CTA click handler)
- Props: `{ roomType: { id, name, capacity, price_per_night, amenities: { name, icon }[] }, onSelectRoom: (id: string) => void }`
- Layout: room name + capacity badge + `formatCurrency(price_per_night)` + amenity pills row (first 6, then "+N more" badge if overflow) + "Check Availability" button
- Amenity pills: reuse `AmenityBadge` from `apps/web/components/location/AmenityBadge.tsx`
- Style: `glass-panel rounded-2xl p-6`, button uses `.btn-primary`

### A3 — AvailabilityCalendar Component (~30 min)
**File:** `apps/web/components/property/AvailabilityCalendar.tsx`
- Client component (`'use client'`)
- Props: `{ roomTypeId: string, pricePerNight: number, onRangeSelect: (checkIn: string, checkOut: string, totalAmount: number) => void }`
- Monthly grid calendar, one month visible at a time
- Fetch `GET /api/bookings/availability?room_type_id=X&check_in=Y&check_out=Z` when month changes or range selected
- Date states: past (grey, disabled) | unavailable (red, `available_count = 0`) | available (green) | selected-range (primary/orange fill)
- Two-click selection: first click = check_in, second click = check_out
- Show loading skeleton while fetching, error message on failure
- On valid range: show summary (N nights × price = total), call `onRangeSelect`
- Block submission if any date in range is unavailable

### A4 — Booking Form + Confirmation (~25 min)
**File:** `apps/web/components/property/BookingForm.tsx`
- Client component with controlled form state
- Collects: `guest_name`, `guest_email`, `guest_phone?`
- Shows: selected dates, room name, total amount (from parent state)
- Submit: `POST /api/bookings`, handle loading + error states
- On 201: show confirmation panel (`booking_id`, dates, total) — no redirect needed

---

## Module B: UI Component Tests

### B1 — RoomTypeCard Tests (~20 min)
**File:** `apps/web/__tests__/components/RoomTypeCard.test.tsx`
- Environment: `@vitest-environment jsdom`
- Tests:
  - renders room name, capacity, and formatted price
  - renders up to 6 amenity pills; hides overflow as "+N more"
  - calls `onSelectRoom` with correct `roomTypeId` on CTA click
  - renders all amenity icons without crashing (including unknown icon names)

### B2 — AvailabilityCalendar Tests (~25 min)
**File:** `apps/web/__tests__/components/AvailabilityCalendar.test.tsx`
- Environment: `@vitest-environment jsdom`
- Mock `fetch` for `GET /api/bookings/availability` responses
- Tests:
  - renders current month by default
  - disables past dates (unclickable)
  - marks dates red when `available_count = 0`
  - marks dates green when `available_count > 0`
  - calls `onRangeSelect` with correct ISO strings after both dates selected
  - shows loading skeleton while fetch in-flight
  - shows error message when API returns non-200
  - blocks `onRangeSelect` when any date in range is unavailable

### B3 — LocationCard + PropertyCard Tests (~20 min)
**File:** `apps/web/__tests__/components/LocationCard.test.tsx`  
**File:** `apps/web/__tests__/components/PropertyCard.test.tsx`
- Environment: `@vitest-environment jsdom`
- LocationCard tests: renders name/city/country, renders fallback gradient when `image=null`, links to `/locations/[slug]`
- PropertyCard tests: renders title/price/amenities, shows "New" badge when `rating=null`, shows star rating when `rating` is a number, truncates description at 90 chars

---

## Module C: Admin App

### C1 — Admin Layout + Auth Guard (~25 min)
**File:** `apps/admin/app/layout.tsx` (replace scaffold)
**File:** `apps/admin/middleware.ts`
- Install next-auth in apps/admin: `pnpm add next-auth@beta`
- Protect all `/` routes — redirect to `/login` if unauthenticated
- Admin layout: sidebar nav + topbar (username, logout) + main content area
- Sidebar links: Dashboard, Locations, Properties, Bookings, Events, Blog, Jobs, Enquiries, FAQ, Users
- Style: surface-dark bg, gold-border dividers, matching Ethereal Glow tokens

### C2 — Admin Dashboard (~20 min)
**File:** `apps/admin/app/page.tsx`
- Server component — fetch summary counts in parallel:
  ```ts
  const [locations, properties, bookings, events] = await Promise.all([
    prisma.location.count(),
    prisma.property.count(),
    prisma.booking.count({ where: { booking_status: 'confirmed' } }),
    prisma.event.count({ where: { is_approved: true } }),
  ])
  ```
- Stat cards: Total Locations, Total Properties, Active Bookings, Upcoming Events
- Recent bookings table (last 10, columns: guest, property, dates, amount, status)

### C3 — Locations CRUD (~25 min)
**File:** `apps/admin/app/locations/page.tsx` — table of all locations + "Add Location" button  
**File:** `apps/admin/app/locations/new/page.tsx` — create form  
**File:** `apps/admin/app/locations/[id]/edit/page.tsx` — edit form  
**API:** Add `PUT /api/admin/locations/[id]` and `DELETE /api/admin/locations/[id]` to apps/admin  
- Form fields: name, slug (auto-generated from name), city, state, country, description, contact info
- Slug auto-generated via `slugify(name)` from `@crib/lib`, editable

### C4 — Properties + RoomType Management (~30 min)
**File:** `apps/admin/app/properties/page.tsx` — table with location filter  
**File:** `apps/admin/app/properties/[id]/page.tsx` — property detail with RoomType list  
**File:** `apps/admin/app/properties/[id]/rooms/new/page.tsx` — add RoomType form  
- RoomType form: name, description, capacity, price_per_night, images (URL inputs), amenity multi-select
- Amenity multi-select: pre-populated from GET /api/amenities (popular shown first), with custom add option

### C5 — Bookings Management (~20 min)
**File:** `apps/admin/app/bookings/page.tsx`
- Table: guest name, email, property, room type, check-in/out, amount, payment status, booking status
- Filters: date range, status, property
- Actions: mark as checked_in, checked_out, cancelled
- No new API needed — use `prisma.booking` directly in server action

### C6 — Events Management (~25 min)
**File:** `apps/admin/app/events/page.tsx` — table with approve/reject actions  
**File:** `apps/admin/app/events/new/page.tsx` — create event form  
- Fields: name, slug, type (social/workshop/music/wellness), location_id, description, start/end datetime
- Approve/reject event proposals from EventProposal table

### C7 — Blog Management (~25 min)
**File:** `apps/admin/app/blog/page.tsx` — list posts with status filter  
**File:** `apps/admin/app/blog/new/page.tsx` — create post  
**File:** `apps/admin/app/blog/[id]/edit/page.tsx` — edit post  
- Fields: title, slug, excerpt, content (textarea), category, featured_media_id, status, published_at
- Rich text: use a simple `<textarea>` for now (no WYSIWYG)

### C8 — Jobs, Enquiries, FAQ (~20 min each)
**Jobs** `apps/admin/app/jobs/` — list + create + view applications  
**Enquiries** `apps/admin/app/enquiries/` — list with status update (new → responded → closed)  
**FAQ** `apps/admin/app/faq/` — list + create + reorder by sort_order  

---

## Module D: Community Pages (Public)

### D1 — Events Listing + Detail (~25 min)
**File:** `apps/web/app/community/events/page.tsx`  
**File:** `apps/web/app/community/events/[slug]/page.tsx`
- Events listing: filter by location, type; only `is_approved = true`
- Event detail: description, datetime, location name, register form (creates EventRegistration)
- Event proposal form on listing page

### D2 — Blog Listing + Article (~20 min)
**File:** `apps/web/app/community/blog/page.tsx`  
**File:** `apps/web/app/community/blog/[slug]/page.tsx`
- Listing: published posts only, sorted by `published_at desc`, category filter tabs
- Article: title, content, author, published date, featured image, category tag

### D3 — Our Story Page (~15 min)
**File:** `apps/web/app/community/our-story/page.tsx`
- Hero section + timeline of TimelineEvent records (ordered by sort_order)
- Static-ish page — if no DB data, render placeholder

### D4 — Jobs + Careers (~20 min)
**File:** `apps/web/app/community/jobs/page.tsx`
**File:** `apps/web/app/community/jobs/[slug]/page.tsx`
- Jobs listing: active jobs (valid_through > today or null)
- Job detail: description, location, salary range, application form (creates JobApplication)

---

## Module E: Remaining Public Pages

### E1 — Contact / Enquiry Page (~15 min)
**File:** `apps/web/app/contact/page.tsx`
- Form: name, email, phone, message, intent (booking/partnership/general)
- Submit creates Enquiry record via POST /api/enquiries (new route)

### E2 — Homepage — Replace Placeholders (~20 min)
**File:** `apps/web/app/page.tsx` (update existing)
- Community section: replace placeholder with real EventCard × 3 + BlogCard × 3 from DB
- Testimonials section: replace placeholder with real TestimonialCard × 4 from DB

### E3 — Footer Component (~15 min)
**File:** `apps/web/components/home/Footer.tsx`
- Extract the copy-pasted footer into a reusable component
- Props from design-map.json: `brand, tagline, navColumns, socialLinks, newsletterEnabled, copyrightText`
- Replace inline footers in all 3 pages (/locations, /locations/[slug], /)

---

## Module F: Infrastructure

### F1 — Environment + Auth Setup (~20 min)
- Add `NEXTAUTH_SECRET` and `NEXTAUTH_URL` to `.env`
- Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` if needed for client queries
- Document all required env vars in a `.env.example` at repo root

### F2 — RLS Policies (~20 min)
- Enable Row Level Security on all Supabase tables via Supabase MCP
- Public read: Location, Property, RoomType, Amenity, RoomTypeAmenity, RoomInventory, Event, BlogPost, FAQ, Job
- Authenticated write: all admin operations via service role key

### F3 — Error Boundaries + Loading States (~15 min)
**Files:** `apps/web/app/error.tsx`, `apps/web/app/loading.tsx`, `apps/web/app/not-found.tsx`
- Global error boundary with "Something went wrong" UI
- Global loading: spinner or skeleton matching the dark theme
- Custom 404 page with a link back to /locations

---

## Execution Order

```
A1 → A2 → A3 → A4   (property detail + booking flow)
B1 → B2 → B3         (UI tests — run after A)
C1 → C2 → C3 → C4 → C5 → C6 → C7 → C8  (admin)
D1 → D2 → D3 → D4   (community)
E1 → E2 → E3         (remaining public pages)
F1 → F2 → F3         (infra — can be done at any time)
```

**Rule:** Run `npx vitest run --reporter=verbose` (from `apps/web`) before and after every task. A task is only done when its tests pass.
