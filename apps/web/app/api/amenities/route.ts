import { NextResponse } from 'next/server'
import { prisma } from '@crib/db'

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
