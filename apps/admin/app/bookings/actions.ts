'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@crib/db'

export async function updateBookingStatus(formData: FormData) {
  const id = formData.get('id') as string
  const status = formData.get('status') as string

  await prisma.booking.update({
    where: { id },
    data: { booking_status: status },
  })

  revalidatePath('/bookings')
}
