import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@crib/db'

// Lucide icon names are kebab-case lowercase, e.g. "wifi", "shower-head"
const LUCIDE_ICON_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

const createAmenitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  icon: z.string().regex(LUCIDE_ICON_RE, 'Icon must be a valid Lucide icon name (kebab-case lowercase, e.g. "wifi", "shower-head")'),
  category: z.string().min(1, 'Category is required'),
  is_popular: z.boolean().optional().default(false),
})

export async function GET() {
  const amenities = await prisma.amenity.findMany({
    select: { id: true, name: true, icon: true, category: true, is_popular: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })

  const popular = amenities.filter((a) => a.is_popular)
  // All amenities sorted: popular first, then by category
  const all = [
    ...amenities.filter((a) => a.is_popular),
    ...amenities.filter((a) => !a.is_popular),
  ]

  return NextResponse.json({ data: { popular, all } })
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createAmenitySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { name, icon, category, is_popular } = parsed.data

  const amenity = await prisma.amenity.create({
    data: {
      id: crypto.randomUUID(),
      name,
      icon,
      category,
      is_popular,
    },
    select: { id: true, name: true, icon: true, category: true, is_popular: true },
  })

  return NextResponse.json({ data: amenity }, { status: 201 })
}
