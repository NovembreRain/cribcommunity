'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@crib/db'

export async function updateEnquiryStatus(formData: FormData) {
  const id = formData.get('id') as string
  const status = formData.get('status') as string

  await prisma.enquiry.update({
    where: { id },
    data: { status },
  })

  revalidatePath('/enquiries')
}
