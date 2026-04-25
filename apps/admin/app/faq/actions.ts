'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@crib/db'

export async function createFaq(formData: FormData) {
  const question = formData.get('question') as string
  const answer = formData.get('answer') as string
  const category = (formData.get('category') as string) || 'general'
  const context = (formData.get('context') as string) || 'general'
  const sort_order = parseInt(formData.get('sort_order') as string, 10) || 0

  await prisma.fAQ.create({
    data: { id: crypto.randomUUID(), question, answer, category, context, sort_order },
  })

  redirect('/faq')
}

export async function updateFaq(id: string, formData: FormData) {
  const question = formData.get('question') as string
  const answer = formData.get('answer') as string
  const category = (formData.get('category') as string) || 'general'
  const context = (formData.get('context') as string) || 'general'
  const sort_order = parseInt(formData.get('sort_order') as string, 10) || 0

  await prisma.fAQ.update({
    where: { id },
    data: { question, answer, category, context, sort_order },
  })

  redirect('/faq')
}

export async function deleteFaq(id: string) {
  await prisma.fAQ.delete({ where: { id } })
  redirect('/faq')
}
