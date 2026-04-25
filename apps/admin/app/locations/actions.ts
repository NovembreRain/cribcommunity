'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@crib/db'
import { slugify } from '@crib/lib'

function parseImages(formData: FormData): string[] {
  try {
    const raw = formData.get('images') as string
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function createLocation(formData: FormData) {
  const name = formData.get('name') as string
  const city = formData.get('city') as string
  const state = formData.get('state') as string
  const country = (formData.get('country') as string) || 'India'
  const description = formData.get('description') as string | null
  const manager_name = formData.get('manager_name') as string | null
  const contact_email = formData.get('contact_email') as string | null
  const contact_phone = formData.get('contact_phone') as string | null
  const images = parseImages(formData)

  await prisma.location.create({
    data: {
      id: crypto.randomUUID(),
      name,
      slug: slugify(name),
      city,
      state,
      country,
      images,
      description: description || null,
      manager_name: manager_name || null,
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
    },
  })

  redirect('/locations')
}

export async function updateLocation(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const city = formData.get('city') as string
  const state = formData.get('state') as string
  const country = (formData.get('country') as string) || 'India'
  const description = formData.get('description') as string | null
  const manager_name = formData.get('manager_name') as string | null
  const contact_email = formData.get('contact_email') as string | null
  const contact_phone = formData.get('contact_phone') as string | null
  const images = parseImages(formData)

  await prisma.location.update({
    where: { id },
    data: {
      name,
      slug: slugify(name),
      city,
      state,
      country,
      images,
      description: description || null,
      manager_name: manager_name || null,
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
    },
  })

  redirect('/locations')
}

export async function deleteLocation(id: string) {
  const propertyCount = await prisma.property.count({ where: { location_id: id } })
  if (propertyCount > 0) {
    redirect(`/locations?error=has_properties&count=${propertyCount}`)
  }
  await prisma.location.delete({ where: { id } })
  redirect('/locations')
}
