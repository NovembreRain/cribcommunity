import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@crib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  const property = await prisma.property.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      address: true,
      check_in_time: true,
      check_out_time: true,
      amenities: true,
      location: {
        select: { id: true, name: true, city: true, country: true },
      },
      room_types: {
        select: {
          id: true,
          name: true,
          description: true,
          capacity: true,
          price_per_night: true,
          images: true,
          amenities: {
            select: {
              amenity: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                  category: true,
                  is_popular: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  // Reshape room types — flatten amenities and sort: popular first, then by category
  const data = {
    ...property,
    room_types: property.room_types.map((rt) => ({
      ...rt,
      amenities: rt.amenities
        .map((rta) => rta.amenity)
        .sort((a, b) => {
          if (a.is_popular !== b.is_popular) return a.is_popular ? -1 : 1
          return a.category.localeCompare(b.category)
        }),
    })),
  }

  return NextResponse.json({ data })
}
