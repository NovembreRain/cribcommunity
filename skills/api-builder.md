# SKILL: API Builder

## PURPOSE
Build Next.js App Router API route handlers — typed, validated, real DB only.

## ROUTE LOCATIONS
- Public → apps/web/app/api/[module]/route.ts
- Admin → apps/admin/app/api/[module]/route.ts

## STANDARD ROUTE TEMPLATE
```ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@travellers-crib/db'

const inputSchema = z.object({ ... })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = inputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const result = await db.[model].[operation](...)
    return NextResponse.json({ data: result }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## HIERARCHY FETCH RULE
When any route needs property data, always include the full hierarchy:
```ts
include: {
  location: true,
  roomTypes: {
    include: {
      amenities: { include: { amenity: true } }
    }
  }
}
```

## RULES
- ALWAYS validate with Zod first
- ALWAYS import db from @travellers-crib/db
- ALWAYS return { data: ... } on success, { error: ... } on failure
- ALWAYS use correct HTTP status codes
- NEVER return raw Prisma errors
- NEVER skip auth check on admin routes
- ALWAYS type return shapes — no `any`

## MODULES + ROUTES
| Module | Route | Methods |
|--------|-------|---------|
| Bookings | /api/bookings | POST |
| Availability | /api/bookings/availability | GET |
| Properties | /api/properties/[slug] | GET |
| Room Types | /api/properties/[slug]/rooms | GET |
| Amenities | /api/amenities | GET |
| Events | /api/events | GET, POST |
| Event Registration | /api/events/[id]/register | POST |
| Contact | /api/contact | POST |
| Applications | /api/applications | POST |