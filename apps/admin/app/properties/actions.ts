'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@crib/db'
import { slugify } from '@crib/lib'

// rooms_json = JSON.stringify([{ name, description, capacity, price_per_night, amenity_ids[], images[] }])
async function upsertRoomsForProperty(propertyId: string, roomsJson: string) {
  let rooms: Array<{
    id?: string
    name: string
    description?: string
    capacity: number
    price_per_night: number
    amenity_ids?: string[]
    images?: string[]
  }> = []
  try { rooms = JSON.parse(roomsJson) } catch { return }

  for (const room of rooms) {
    const roomId = room.id ?? crypto.randomUUID()
    await prisma.roomType.upsert({
      where: { id: roomId },
      create: {
        id: roomId,
        property_id: propertyId,
        name: room.name,
        description: room.description ?? null,
        capacity: Number(room.capacity),
        price_per_night: Number(room.price_per_night),
        images: room.images ?? [],
      },
      update: {
        name: room.name,
        description: room.description ?? null,
        capacity: Number(room.capacity),
        price_per_night: Number(room.price_per_night),
        images: room.images ?? [],
      },
    })

    // Replace amenities
    if (room.amenity_ids && room.amenity_ids.length > 0) {
      await prisma.roomTypeAmenity.deleteMany({ where: { room_type_id: roomId } })
      await prisma.roomTypeAmenity.createMany({
        data: room.amenity_ids.map((amenity_id) => ({
          id: crypto.randomUUID(),
          room_type_id: roomId,
          amenity_id,
        })),
        skipDuplicates: true,
      })
    }
  }
}

export async function createProperty(formData: FormData) {
  const name = formData.get('name') as string
  const location_id = formData.get('location_id') as string
  const address = formData.get('address') as string
  const description = formData.get('description') as string | null
  const check_in_time = formData.get('check_in_time') as string | null
  const check_out_time = formData.get('check_out_time') as string | null
  const manager_name = formData.get('manager_name') as string | null
  const contact_phone = formData.get('contact_phone') as string | null
  const rooms_json = (formData.get('rooms_json') as string) || '[]'

  const property = await prisma.property.create({
    data: {
      id: crypto.randomUUID(),
      name,
      slug: slugify(name),
      location_id,
      address,
      description: description || null,
      check_in_time: check_in_time || null,
      check_out_time: check_out_time || null,
      manager_name: manager_name || null,
      contact_phone: contact_phone || null,
    },
  })

  await upsertRoomsForProperty(property.id, rooms_json)
  redirect('/properties')
}

export async function updateProperty(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const location_id = formData.get('location_id') as string
  const address = formData.get('address') as string
  const description = formData.get('description') as string | null
  const check_in_time = formData.get('check_in_time') as string | null
  const check_out_time = formData.get('check_out_time') as string | null
  const manager_name = formData.get('manager_name') as string | null
  const contact_phone = formData.get('contact_phone') as string | null
  const rooms_json = (formData.get('rooms_json') as string) || '[]'

  await prisma.property.update({
    where: { id },
    data: {
      name,
      slug: slugify(name),
      location_id,
      address,
      description: description || null,
      check_in_time: check_in_time || null,
      check_out_time: check_out_time || null,
      manager_name: manager_name || null,
      contact_phone: contact_phone || null,
    },
  })

  await upsertRoomsForProperty(id, rooms_json)
  redirect('/properties')
}

export async function deleteProperty(id: string) {
  // Delete room types (and their amenity joins) first, then bookings that reference them
  const roomTypes = await prisma.roomType.findMany({ where: { property_id: id }, select: { id: true } })
  const roomTypeIds = roomTypes.map((r) => r.id)

  await prisma.$transaction([
    prisma.roomTypeAmenity.deleteMany({ where: { room_type_id: { in: roomTypeIds } } }),
    prisma.roomInventory.deleteMany({ where: { room_type_id: { in: roomTypeIds } } }),
    prisma.booking.deleteMany({ where: { room_type_id: { in: roomTypeIds } } }),
    prisma.roomType.deleteMany({ where: { property_id: id } }),
    prisma.property.delete({ where: { id } }),
  ])
  redirect('/properties')
}
