# Travellers Crib — Tech Stack, Conventions & Patterns

> Reference for any AI model writing code for this project.
> Last updated: 2026-04-12

---

## Monorepo Structure

```
cribcommunity/
├── apps/
│   ├── web/            Public website (Next.js 15, port 3000)
│   └── admin/          Admin dashboard (Next.js 15, port 3001)
├── packages/
│   ├── db/             Prisma schema + singleton client
│   ├── ui/             Shared shadcn/ui components
│   ├── types/          Shared TypeScript interfaces
│   └── lib/            Shared utility functions
├── AI_CONTEXT/
│   ├── tasks/          Task files (build-*.md, write-tests-*.md)
│   ├── design-map.json Component props authority
│   └── stitch-ui-kit.html Stitch visual reference
├── .env                DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_* (repo root)
├── SPEC.md             Full data model + API spec
├── PLAN.md             Remaining tasks checklist
└── STACK.md            This file
```

---

## Tech Stack

| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Next.js App Router | ^15.1.0 |
| Language | TypeScript (strict) | ^5.6.0 |
| Styling | Tailwind CSS | ^3.4.17 |
| Animations | Framer Motion | ^11.15.0 |
| ORM | Prisma | ^5.22.0 |
| Database | Supabase PostgreSQL | — |
| Validation | Zod | ^3.23.8 |
| Icons | lucide-react | ^0.468.0 |
| Component lib | shadcn/ui (new-york style) | — |
| Package manager | pnpm workspaces | — |
| Monorepo orchestration | Turborepo | ^2.3.0 |
| Testing | Vitest | ^2.1.9 |
| Test environment | jsdom (components) / node (API) | — |

---

## Package Aliases

```json
{
  "@crib/db":    "packages/db",
  "@crib/ui":    "packages/ui",
  "@crib/types": "packages/types",
  "@crib/lib":   "packages/lib",
  "@crib/web":   "apps/web",
  "@crib/admin": "apps/admin"
}
```

In `apps/web/tsconfig.json` path aliases:
```json
{
  "@/*":             ["./*"],
  "@test-helpers/*": ["../../packages/db/test-helpers/*"]
}
```

---

## Coding Patterns

### Database Access

**Always** import the prisma singleton — never instantiate PrismaClient directly.

```ts
// ✅ Correct
import { prisma } from '@crib/db'

// ❌ Wrong
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```

Use `@crib/db` in server components and API routes. Use `@crib/types` interfaces in client components and shared code.

### Generating IDs

```ts
id: crypto.randomUUID()   // Node.js built-in, no import needed
```

### Date Handling

All dates stored as `@db.Date` in Prisma (PostgreSQL `DATE` type = UTC midnight).

```ts
// Parse YYYY-MM-DD string to UTC midnight Date
const checkIn = new Date(`${dateStr}T00:00:00.000Z`)

// Format Date back to YYYY-MM-DD
const str = date.toISOString().split('T')[0]
```

Utility functions in `apps/web/lib/availability.ts`:
- `parseDate(str)` — string → UTC Date
- `toDateStr(date)` — Date → YYYY-MM-DD string
- `getDatesInRange(checkIn, checkOut)` — returns array of nightly UTC Dates
- `checkRoomAvailability(roomTypeId, checkIn, checkOut)` — returns `{ available, dates, inventoryRecords }`

### API Route Pattern

```ts
// apps/web/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@crib/db'

const schema = z.object({ field: z.string().min(1) })

export async function GET(req: NextRequest) {
  // Validate query params or body with Zod
  // Return: NextResponse.json({ data: T }, { status: 200 })
  // Error: NextResponse.json({ error: string, details?: object }, { status: 4xx })
}
```

All responses follow `{ data: T }` or `{ error: string }` envelope — never bare objects.

### Next.js 15 Async Params

Dynamic route params are now a Promise — always await them:

```ts
// ✅ Next.js 15
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
}

// ✅ generateMetadata same pattern
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
}
```

### Server vs Client Components

**Server components** (default, no directive):
- All `page.tsx` files
- All data fetching with Prisma
- SectionShell, layout wrappers
- Add `export const dynamic = 'force-dynamic'` to any page that queries the DB (prevents build-time prerender failures without DATABASE_URL)

**Client components** (`'use client'`):
- Any component using `useState`, `useEffect`, `onClick`, Framer Motion
- NavBar (scroll detection), HeroSection (animations), LocationCard, PropertyCard, AmenityBadge, LucideIcon
- AvailabilityCalendar (will fetch client-side), BookingForm

### Component File Locations

```
apps/web/components/
  home/         Homepage-specific: NavBar, HeroSection, SectionShell
  location/     Location/property pages: LocationCard, PropertyCard, AmenityBadge, LucideIcon
  property/     Property detail + booking: RoomTypeCard, AvailabilityCalendar, BookingForm (to build)
  ui/           shadcn/ui installed components (npx shadcn@latest add [name])

packages/ui/src/  Shared components used by both web + admin
```

### Styling Rules

1. **Tailwind CSS only** — no inline styles, no CSS modules
2. Use design tokens (never raw hex values in className):
   - `bg-background-dark`, `bg-surface-dark`, `text-primary`, `text-text-high`, `border-gold-border`
3. Use shared CSS classes from `globals.css`:
   - `.glass-panel` for cards, modals, panels
   - `.btn-primary` for primary CTAs
   - `.btn-secondary` for ghost CTAs
4. Utility: `cn()` from `@/lib/utils` (re-exported from `@crib/ui`)

### Framer Motion Pattern

```tsx
'use client'
import { motion } from 'framer-motion'

const EASE = [0.25, 0.1, 0.25, 1] as const

// Card with stagger
<motion.div
  initial={{ opacity: 0, y: 16 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.4, ease: EASE, delay: index * 0.08 }}
>
```

### Dynamic Lucide Icons

The DB stores icon names as kebab-case strings (e.g. `"shower-head"`, `"wifi"`). Convert to PascalCase to look up in the `icons` registry:

```tsx
// apps/web/components/location/LucideIcon.tsx
import { icons } from 'lucide-react'

function toPascalCase(kebab: string) {
  return kebab.split('-').map(p => p[0].toUpperCase() + p.slice(1)).join('')
}

const Icon = icons[toPascalCase(name)] ?? icons['Circle']
return <Icon {...props} />
```

### Shared Utility Functions (`@crib/lib`)

```ts
formatCurrency(amount, currency?, locale?)  // → "$120" / "₹1,200"
formatDate(date, options?)                  // → "8 April 2026"
slugify(text)                               // → "hello-world"
truncate(text, maxLength)                   // → "Hello wor…"
calcNights(checkIn, checkOut)               // → number
calcBookingTotal(pricePerNight, nights)     // → number
buildSeoTitle(pageTitle)                    // → "Goa | Crib Community"
```

### Shared Types (`@crib/types`)

Use in client components and API response shapes — never import `@prisma/client` in components.

Key composite types:
```ts
PropertyWithLocation       // Property + { location: Location }
RoomTypeWithAmenities      // RoomType + { amenities: Array<{ amenity: Amenity }> }
ApiResponse<T>             // { data: T | null, error: string | null }
PaginatedResponse<T>       // { data: T[], total, page, pageSize, hasMore }
```

---

## Testing Conventions

```
apps/web/__tests__/
  api/           Integration tests (node environment, real Supabase)
    amenities.test.ts
    bookings/
      availability.test.ts
      create.test.ts
  components/    Unit tests (jsdom environment, mock API calls)
    *.test.tsx
  setup.ts       Manually parses ../../.env into process.env
```

### API Test Pattern

```ts
// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '@crib/db'
import { POST } from '@/app/api/[resource]/route'
import { seedX, cleanX } from '@test-helpers/seed-x'

describe('POST /api/[resource]', () => {
  let testData!: TestData

  beforeAll(async () => { testData = await seedX() })
  afterAll(async () => { if (testData) await cleanX(testData) })

  it('should ...', async () => {
    const req = new NextRequest('http://localhost/api/...', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ... }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data).toHaveProperty('id')
  })
})
```

### Seed Helper Pattern

```ts
// packages/db/test-helpers/seed-[resource].ts
export interface Test[Resource]Data {
  location: { id: string }
  property: { id: string; slug: string }
  // ... all created records needed by tests
}

export async function seed[Resource]TestData(opts?): Promise<Test[Resource]Data> {
  // INSERT Location → Property → RoomType → RoomInventory in order
  // Use crypto.randomUUID() for all IDs
}

export async function clean[Resource]TestData(data: Test[Resource]Data) {
  // DELETE in reverse FK order (most-derived first)
}
```

---

## Environment Variables

File: `.env` at repo root (`/Users/khotraj/cribcommunity/.env`)

```
DATABASE_URL="postgresql://postgres.[PROJECT]:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_ADMIN_URL="http://localhost:3001"
AUTH_SECRET="..."
```

**Critical:** `DATABASE_URL` uses the transaction pooler (`port 6543`, `?pgbouncer=true`). The direct URL (`port 5432`) is DNS-unreachable from the current network — only the pooler works. Prisma uses the pooler for queries and `directUrl` for schema introspection/migrations.

**Vitest:** `apps/web/__tests__/setup.ts` manually reads `.env` because `envDir` in vitest.config.ts only loads for `import.meta.env`, not `process.env`.

---

## Supabase MCP

Connected. Use for:
- Running SQL: `mcp__supabase__execute_sql`
- Applying migrations: `mcp__supabase__apply_migration`
- Checking tables: `mcp__supabase__list_tables`
- Generating types: `mcp__supabase__generate_typescript_types`

RLS is currently disabled on all tables. Enable before production.

---

## Common Mistakes to Avoid

| Mistake | Correct approach |
|---------|-----------------|
| `new PrismaClient()` in a component | `import { prisma } from '@crib/db'` |
| `Prisma.TransactionIsolationLevel.Serializable` | Default ReadCommitted + atomic `UPDATE ... WHERE count > 0` |
| Booking overlap check via `booking.findFirst` | Inventory `available_count` is the sole source of truth |
| `params.slug` (sync) in Next.js 15 | `const { slug } = await params` (async) |
| Inline styles or raw hex values | Tailwind tokens only |
| Static prerender with DB queries | Add `export const dynamic = 'force-dynamic'` |
| Importing `@prisma/client` in components | Use `@crib/types` interfaces instead |
| Mocking the database in tests | Real Supabase integration tests only |
| Animating `width`/`height` | Only `opacity` + `transform` (Framer Motion) |
| Creating a new component without checking packages/ui | Check `packages/ui/src/` first |
