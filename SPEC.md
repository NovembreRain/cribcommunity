# Travellers Crib — Full Specification

> Source of truth for any AI model continuing work on this project.
> Last updated: 2026-04-12

---

## 1. Product Overview

**Travellers Crib** is a full-stack hostel booking platform serving adventure travellers across India. It combines property listings, real-time availability, and community features (events, blog, jobs). The admin app manages all content.

**Live Supabase project:** `qjjetqtzexiydyfqohih` (ap-northeast-1)

---

## 2. Data Models

All models live in `packages/db/schema.prisma`. Never import `PrismaClient` directly — always use `import { prisma } from '@crib/db'`.

### Location
```
id            String   @id
name          String
slug          String   @unique
description   String?
city          String
state         String
country       String
latitude      Float?
longitude     Float?
manager_name  String?
contact_email String?
contact_phone String?
created_at    DateTime

→ properties  Property[]
→ events      Event[]
```

### Property
```
id             String   @id
location_id    String   → Location
name           String
slug           String   @unique
description    String?
address        String
manager_name   String?
contact_phone  String?
amenities      Json?    (JSONB property-level flags — legacy)
check_in_time  String?
check_out_time String?
created_at     DateTime

→ room_types  RoomType[]
→ bookings    Booking[]
```

### RoomType
```
id              String  @id
property_id     String  → Property
name            String
description     String?
capacity        Int
price_per_night Float
images          Json?   (string[] of image URLs)

→ amenities   RoomTypeAmenity[]
→ inventory   RoomInventory[]
→ bookings    Booking[]
```

### Amenity
```
id         String  @id
name       String
icon       String  (Lucide icon name, kebab-case — e.g. "wifi", "shower-head")
category   String  ("comfort" | "food" | "connectivity" | "security" | "services" | "social" | "transport" | "activities" | "recreation" | "utilities" | "policies")
is_popular Boolean @default(false)

→ room_types  RoomTypeAmenity[]
```
24 amenities seeded. Popular ones: WiFi, Hot Shower, Air Conditioning, Towels, Bar, Breakfast, Shared Kitchen, Swimming Pool, Locker, 24/7 Reception, Laundry, Common Room, Rooftop Terrace, Airport Transfer, Parking, Tours & Trips.

### RoomTypeAmenity (join table)
```
id           String @id
room_type_id String → RoomType (onDelete: Cascade)
amenity_id   String → Amenity  (onDelete: Cascade)
@@unique([room_type_id, amenity_id])
```

### RoomInventory
```
id              String   @id
room_type_id    String   → RoomType
date            DateTime @db.Date   (UTC-midnight, one row per night per room type)
available_count Int

RULE: A missing row means 0 (unavailable). Never store availability as a static field on RoomType.
```

### Booking
```
id             String   @id  (crypto.randomUUID())
property_id    String   → Property
room_type_id   String   → RoomType
guest_name     String
guest_email    String
guest_phone    String?
check_in_date  DateTime @db.Date
check_out_date DateTime @db.Date
total_amount   Float    (price_per_night × nights, rounded to 2dp)
payment_status String   ("pending" | "paid" | "refunded")
booking_status String   ("confirmed" | "cancelled" | "checked_in" | "checked_out")
source         String?  ("web" | "admin" | "ota")
created_at     DateTime
```

**Booking correctness rule:** Inventory is the sole source of truth for availability. No per-booking overlap check — multiple guests can book the same room type (multi-bed hostel). The booking transaction atomically decrements `RoomInventory.available_count` using `UPDATE ... WHERE available_count > 0` to prevent overbooking under concurrent load.

### Other Models (not yet built)
- **Media**: id, url, type, alt_text, uploaded_by, created_at
- **HomeHero**: id, title, subtitle, button_text, button_link, media_id
- **Testimonial**: id, name, text, rating, avatar_media_id
- **GalleryMedia**: id, media_url, media_type, sort_order
- **Event**: id, location_id, name, slug, type, description, start_datetime, end_datetime, is_approved, created_by
- **EventRegistration**: id, event_id, name, email, phone, created_at
- **EventProposal**: id, applicant_name, applicant_phone, applicant_email, proposal_details, status
- **BlogCategory**: id, name, slug
- **BlogPost**: id, title, slug, excerpt, content, author_id, category_id, featured_media_id, status, published_at, meta_title, meta_description, og_image
- **Job**: id, title, slug, location, salary_range, description, valid_through, created_at
- **JobApplication**: id, job_id, applicant_name, email, phone, resume_url, talent_description, created_at
- **Enquiry**: id, name, email, phone, message, intent, source, status, response_deadline, created_at
- **FAQ**: id, question, answer, category, sort_order
- **User**: id, email, password_hash, role ("USER" | "EDITOR" | "ADMIN" | "SUPER_ADMIN"), created_at
- **TimelineEvent**: id, year, title, description, sort_order, media_id
- **PageView**, **EventTracking**: analytics

---

## 3. API Endpoints

All routes live in `apps/web/app/api/`. Every handler validates with Zod. All responses: `{ data: T }` on success or `{ error: string, details?: object }` on failure.

### GET /api/properties/[slug]
Returns full property with location, room types, and flat amenity arrays (popular first).
- 200: `{ data: { id, name, slug, description, address, check_in_time, check_out_time, amenities, location: { id, name, city, country }, room_types: [{ id, name, description, capacity, price_per_night, images, amenities: Amenity[] }] } }`
- 404: `{ error: "Property not found" }`

### GET /api/bookings/availability
Query params: `room_type_id` (required), `check_in` (YYYY-MM-DD), `check_out` (YYYY-MM-DD)
- 200: `{ data: { available: boolean, price_per_night: number, total_nights: number, total_amount: number, dates: [{ date: string, available_count: number }] } }`
- 400: `{ error: "Invalid query parameters" | "check_out must be after check_in" | "check_in cannot be in the past" }`

### POST /api/bookings
Body: `{ property_id, room_type_id, guest_name, guest_email, guest_phone?, check_in_date, check_out_date }`
- 201: `{ data: { booking_id, status, total_amount, check_in_date, check_out_date } }`
- 400: `{ error: "Validation failed", details }` | `{ error: "check_out_date must be after check_in_date" }` | `{ error: "check_in_date cannot be in the past" }` | `{ error: "Room type not found for this property" }`
- 409: `{ error: "No availability for the selected dates", dates? }`

### GET /api/amenities
Returns all amenities grouped.
- 200: `{ data: { popular: Amenity[], all: Amenity[] } }` (popular-first order in `all`)

### POST /api/amenities
Body: `{ name, icon (kebab-case Lucide name), category, is_popular? }`
- 201: `{ data: Amenity }`
- 400: `{ error: "Validation failed", details }`

---

## 4. Modules & User Flows

### Public Website (apps/web)

**Homepage /**
- Server component, `force-dynamic`
- NavBar (glass pill, fixed) + HeroSection (video background) + LocationCards (3, real DB) + Community placeholder + Testimonials placeholder + Footer

**Locations /locations**
- Server component, `force-dynamic`
- All locations from DB, grid of `LocationCard` components
- Empty state if no locations

**Location Detail /locations/[locationSlug]**
- Server component, `force-dynamic`, `notFound()` for invalid slugs
- Dynamic metadata (title = location name)
- Hero banner with first property image + location description
- Grid of `PropertyCard` — each shows: image, amenity pills (top 4 popular), starting price (cheapest room type), "New" badge (no reviews system yet)
- PropertyCard links to `/properties/[slug]` (not yet built)

**Property Detail /properties/[slug]** ← NOT YET BUILT
- Fetches via GET /api/properties/[slug]
- PropertyHeader: name, location, hero image
- Gallery of room images
- RoomTypeCard × n — each with amenity pills and "Check Availability" CTA
- AvailabilityCalendar (client component) — calls GET /api/bookings/availability
- BookingButton — submits POST /api/bookings

**Booking Flow** ← NOT YET BUILT
- Date selection via AvailabilityCalendar
- Guest details form
- Confirmation page

### Admin App (apps/admin) ← NOT YET BUILT
Modules: Locations, Properties (with RoomType management), Bookings, Events, Blog, Jobs, Enquiries, FAQ, Users.

---

## 5. Seeded Data

### Locations (5 total)
| Name | Slug | City | State |
|------|------|------|-------|
| Crib Goa | goa | Anjuna | Goa |
| Crib Manali | manali | Manali | Himachal Pradesh |
| Crib Rishikesh | rishikesh | Rishikesh | Uttarakhand |
| Auroville | *(pre-existing)* | — | Tamil Nadu |
| Mahabalipuram | *(pre-existing)* | — | Tamil Nadu |

### Properties (6 seeded)
Dune House (goa), Saltwater Social (goa), The Pine Nest (manali), Summit Base Camp (manali), The River Monk (rishikesh), Ganga Flow Hostel (rishikesh)

Each has 2 RoomTypes (dorm + private), 5 amenity links each. Images are Unsplash URLs.

---

## 6. Design System — Ethereal Glow

### Colours
| Token | Hex | Usage |
|-------|-----|-------|
| `background-dark` | #0A0E14 | Page background |
| `surface-dark` | #151922 | Cards, modals |
| `primary` | #E67E22 | CTAs, eyebrows, accents |
| `accent-amber` | #F39C12 | Hover states |
| `gold-border` | #8C6A43 | Borders, dividers |
| `text-high` | #FFFFFF | Headings, primary text |
| `text-medium` | #D1D1D1 | Body text |
| `text-low` | #8E8E8E | Meta text, labels |

### Typography
- **Headings**: Playfair Display → `font-display` (CSS var `--font-playfair`)
- **Body**: Outfit → `font-sans` (CSS var `--font-outfit`)
- **Eyebrow pattern**: `text-xs uppercase tracking-[0.2em] text-primary font-bold` + optional `w-8 h-[2px] bg-gradient-to-r from-primary to-transparent` bar before text

### Reusable CSS Classes (globals.css)
```
.glass-panel   → rgba(21,25,34,0.6) bg + backdrop-blur-10 + 1px rgba(140,106,67,0.3) border
.btn-primary   → gradient fill (#E67E22 → #F1C40F), glow shadow, rounded-full
.btn-secondary → ghost, gold border, rounded-full
```

### Animations (Framer Motion)
```ts
const EASE = [0.25, 0.1, 0.25, 1]
const DURATION = 0.4
const STAGGER = 0.08  // delay per child

// Standard entrance
initial: { opacity: 0, y: 16 }
animate/whileInView: { opacity: 1, y: 0 }
transition: { duration: DURATION, ease: EASE }
// Stagger: delay = index * STAGGER
// viewport: { once: true }
```
Only use `opacity` and `transform` — never animate `width`/`height`.

---

## 7. Testing

**Framework:** Vitest 2.1.9  
**Environment:** `@vitest-environment node` annotation on API test files  
**DB:** Real Supabase (no mocks for DB — integration tests only)  
**Env loading:** `apps/web/__tests__/setup.ts` manually parses `../../.env` into `process.env`  
**Test run:** `cd apps/web && npx vitest run --reporter=verbose`  
**Current state:** 19/19 tests passing

Test files:
- `__tests__/api/amenities.test.ts` — 5 tests
- `__tests__/api/bookings/availability.test.ts` — 7 tests
- `__tests__/api/bookings/create.test.ts` — 7 tests
- `__tests__/setup.ts` — .env loader
- `packages/db/test-helpers/seed-booking.ts` — Location→Property→RoomType→Inventory seed chain

**Rule:** Feature is NOT done until tests pass. Never start a new task without running the full suite first.
