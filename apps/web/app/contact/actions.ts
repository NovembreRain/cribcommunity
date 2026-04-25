'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@crib/db'

export async function submitEnquiry(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string | null
  const message = formData.get('message') as string
  const intent = formData.get('intent') as string | null

  if (!name || !email || !message) return

  await prisma.enquiry.create({
    data: {
      id: crypto.randomUUID(),
      name,
      email,
      phone: phone || null,
      message,
      intent: intent || null,
      source: 'web',
    },
  })

  redirect('/contact?sent=true')
}
