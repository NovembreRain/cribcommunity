'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@crib/db'
import { slugify } from '@crib/lib'

export async function createJob(formData: FormData) {
  const title = formData.get('title') as string
  const location = formData.get('location') as string
  const description = formData.get('description') as string
  const salary_range = formData.get('salary_range') as string | null
  const valid_through_str = formData.get('valid_through') as string | null

  await prisma.job.create({
    data: {
      id: crypto.randomUUID(),
      title,
      slug: slugify(title),
      location,
      description,
      salary_range: salary_range || null,
      valid_through: valid_through_str ? new Date(valid_through_str) : null,
    },
  })

  redirect('/jobs')
}

export async function updateJob(id: string, formData: FormData) {
  const title = formData.get('title') as string
  const location = formData.get('location') as string
  const description = formData.get('description') as string
  const salary_range = formData.get('salary_range') as string | null
  const valid_through_str = formData.get('valid_through') as string | null

  await prisma.job.update({
    where: { id },
    data: {
      title,
      slug: slugify(title),
      location,
      description,
      salary_range: salary_range || null,
      valid_through: valid_through_str ? new Date(valid_through_str) : null,
    },
  })

  redirect('/jobs')
}

export async function deleteJob(id: string) {
  await prisma.job.delete({ where: { id } })
  redirect('/jobs')
}
