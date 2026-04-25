'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@crib/db'

export async function registerForEvent(formData: FormData) {
  const event_id = formData.get('event_id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string | null

  if (!event_id || !name || !email) return

  await prisma.eventRegistration.create({
    data: {
      id: crypto.randomUUID(),
      event_id,
      name,
      email,
      phone: phone || null,
    },
  })

  // Get event slug for redirect
  const event = await prisma.event.findUnique({ where: { id: event_id }, select: { slug: true } })
  redirect(`/community/events/${event?.slug ?? ''}?registered=true`)
}
