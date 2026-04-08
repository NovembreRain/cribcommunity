# PROJECT: Travellers Crib — Hostel Booking Platform

## MONOREPO STRUCTURE (CRITICAL)
- Turborepo monorepo
- apps/web → Public website (Next.js App Router)
- apps/admin → Admin dashboard (separate Next.js app)
- packages/ui → Shared components (authoritative — do not modify without instruction)
- packages/db → Prisma schema + DB logic (authoritative)
- packages/types → Shared TypeScript types (authoritative)
- packages/lib → Shared utilities

## DESIGN SOURCE OF TRUTH
- Google Stitch MCP = visual authority (colors, spacing, typography, layout)
- AI_CONTEXT/design-map.json = component prop authority
- AI_CONTEXT/design-screenshots/ = reference images
- Workflow for every UI component:
  1. Check design-map.json for props
  2. Fetch screen from Stitch MCP for visual spec
  3. Assemble — never freestyle
- NEVER invent UI that doesn't exist in Stitch
- NEVER add animations not specified in design-map.json or system.md animation rules

## HERO VIDEO (HOMEPAGE)
- The homepage hero is a full-screen background VIDEO, not an image
- Video file is in the repo at: AI_Context/hero/hero-loop-cc
- Must use HTML5 <video> tag: autoPlay muted loop playsInline
- Never replace with next/image or a static image fallback as primary
- Overlay text + CTA sits on top of the video
- Video must be responsive and cover the full viewport

## UI LIBRARIES
- shadcn/ui → component library (installed, use these first before any custom component)
  - All shadcn components live in: apps/web/components/ui/
  - Install new shadcn components via: npx shadcn@latest add [component]
  - NEVER rebuild what shadcn already provides (Button, Dialog, Card, Input, Badge, etc.)

- Framer Motion → animations only
  - Use for: page transitions, scroll reveals, hover effects, modal enters
  - DO NOT animate layout-breaking properties (width, height) — use transform/opacity only
  - Animations must feel premium and subtle — nothing flashy or bouncy
  - Standard easing: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  - Entrance pattern: opacity 0→1 + y 16→0
  - Stagger children by 0.08s maximum

## ANIMATION PHILOSOPHY
- Subtle > dramatic
- Fast > slow (200–400ms for most animations)
- Every animation must serve a purpose (guide attention, confirm action, show hierarchy)
- No animation on critical path actions (booking submit, form validation)

## DATABASE (PRISMA)
- ORM: Prisma
- Schema: packages/db/schema.prisma
- NEVER write raw SQL unless explicitly asked
- NEVER modify the schema without explicit instruction
- Key models: Location, Property, RoomType, Amenity, RoomTypeAmenity,
  RoomInventory, Booking, Event, EventRegistration, BlogPost,
  Enquiry, Job, Media

## LOCATION > PROPERTY > ROOM TYPE HIERARCHY (CRITICAL)
- Location has many Properties
- Property has many RoomTypes
- RoomType has many Amenities (via RoomTypeAmenity join table)
- Amenity has: id, name, icon (Lucide icon name), category, is_popular
- When fetching a property → always include RoomTypes → always include Amenities
- When displaying a RoomType → always render amenity icons

## AMENITY SYSTEM RULES
- Popular amenities are pre-seeded in the Amenity table (is_popular = true)
- Admin can add custom amenities — these also go into the Amenity table
- Amenity icons use Lucide React icon names (stored as string in DB)
- RoomTypeAmenity is the join table: room_type_id + amenity_id
- Amenity icon display: icon component + label, rendered as pill/badge UI

## AVAILABILITY RULE (CRITICAL)
- Availability is stored in RoomInventory (room_type_id + date + available_count)
- NEVER treat availability as a static field on RoomType
- Booking requires: property_id, room_type_id, guest details, check_in_date, check_out_date

## FRONTEND RULES
- Next.js App Router (app/ directory)
- Tailwind CSS only — no inline styles
- All DB access via packages/db — never import Prisma client directly in components
- Types from packages/types — reuse, never redeclare

## ADMIN RULES
- Admin = apps/admin (completely separate app)
- Modules: home, locations, properties, bookings, events, blog, jobs, enquiries, faq, users
- RoomType management lives under the Properties module
- Amenity management: dropdown of is_popular amenities + custom input option
- Auth required for all admin routes

## GOLDEN RULES
- NEVER create mock data
- ALWAYS use real Prisma queries through packages/db
- ALWAYS reuse components from packages/ui before creating new ones
- ALWAYS follow the folder structure above
- NEVER import across apps
- Production-ready TypeScript only — no pseudocode, no placeholders
## TESTING RULES
- NEVER start a new build task without running run-tests.md first
- ALWAYS write tests immediately after completing each build task
- ALWAYS run the full test suite before ending a session
- A feature is NOT done until its tests pass

## OUTPUT FORMAT
- TypeScript only
- Zod validation on all API routes
- Return typed responses
- Handle loading, error, and empty states always

## SUPABASE MCP
- Supabase MCP is live and connected
- Check existing tables via MCP before writing schema.prisma
- All DB changes go through Prisma migrations only

## HERO VIDEO
- Video is at: AI_CONTEXT/hero/ → move to apps/web/public/videos/hero.mp4
- Homepage hero = HTML5 video, NOT next/image
- <video autoPlay muted loop playsInline className="w-full h-full object-cover">
- Never replace with an image component