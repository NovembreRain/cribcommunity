'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@crib/db'
import { slugify } from '@crib/lib'

export async function toggleEventApproval(formData: FormData) {
  const id = formData.get('id') as string
  const approved = formData.get('approved') === 'true'

  await prisma.event.update({
    where: { id },
    data: { is_approved: approved },
  })

  revalidatePath('/events')
}

function parseImages(formData: FormData): string[] {
  try {
    const raw = formData.get('images') as string
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

export async function createEvent(formData: FormData) {
  const name = formData.get('name') as string
  const location_id = formData.get('location_id') as string
  const property_id = (formData.get('property_id') as string) || null
  const type = formData.get('type') as string
  const description = formData.get('description') as string | null
  const start_datetime = new Date(formData.get('start_datetime') as string)
  const end_datetime = new Date(formData.get('end_datetime') as string)
  const is_approved = formData.get('is_approved') === 'true'
  const images = parseImages(formData)

  await prisma.event.create({
    data: {
      id: crypto.randomUUID(),
      name,
      slug: slugify(name),
      location_id,
      property_id,
      type,
      description: description || null,
      start_datetime,
      end_datetime,
      is_approved,
      images,
      created_by: 'admin',
    },
  })

  redirect('/events')
}

export async function updateEvent(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const location_id = formData.get('location_id') as string
  const property_id = (formData.get('property_id') as string) || null
  const type = formData.get('type') as string
  const description = formData.get('description') as string | null
  const start_datetime = new Date(formData.get('start_datetime') as string)
  const end_datetime = new Date(formData.get('end_datetime') as string)
  const is_approved = formData.get('is_approved') === 'true'
  const images = parseImages(formData)

  await prisma.event.update({
    where: { id },
    data: {
      name,
      slug: slugify(name),
      location_id,
      property_id,
      type,
      description: description || null,
      start_datetime,
      end_datetime,
      is_approved,
      images,
    },
  })

  redirect('/events')
}

export async function deleteEvent(id: string) {
  await prisma.event.delete({ where: { id } })
  revalidatePath('/events')
}
