'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@crib/db'

const VALID_ROLES = ['USER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN']

export async function updateUserRole(formData: FormData) {
  const id = formData.get('id') as string
  const role = formData.get('role') as string
  if (!id || !VALID_ROLES.includes(role)) return
  await prisma.user.update({ where: { id }, data: { role } })
  revalidatePath('/users')
}

export async function createUser(formData: FormData) {
  const email = (formData.get('email') as string).trim().toLowerCase()
  const role = (formData.get('role') as string) || 'USER'
  if (!email || !VALID_ROLES.includes(role)) return
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return
  await prisma.user.create({
    data: { id: crypto.randomUUID(), email, role },
  })
  revalidatePath('/users')
}
