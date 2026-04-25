'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@crib/db'

export async function applyForJob(formData: FormData) {
  const job_id = formData.get('job_id') as string
  const applicant_name = formData.get('applicant_name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string | null
  const resume_url = formData.get('resume_url') as string
  const talent_description = formData.get('talent_description') as string | null

  if (!job_id || !applicant_name || !email || !resume_url) return

  await prisma.jobApplication.create({
    data: {
      id: crypto.randomUUID(),
      job_id,
      applicant_name,
      email,
      phone: phone || null,
      resume_url,
      talent_description: talent_description || null,
    },
  })

  const job = await prisma.job.findUnique({ where: { id: job_id }, select: { slug: true } })
  redirect(`/community/jobs/${job?.slug ?? ''}?applied=true`)
}
