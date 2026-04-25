'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@crib/db'
import { slugify } from '@crib/lib'

export async function createBlogCategory(formData: FormData) {
  const name = formData.get('name') as string
  await prisma.blogCategory.create({
    data: { id: crypto.randomUUID(), name, slug: slugify(name) },
  })
  revalidatePath('/blog/categories')
}

export async function deleteBlogCategory(id: string) {
  await prisma.blogCategory.delete({ where: { id } })
  revalidatePath('/blog/categories')
}

export async function toggleBlogStatus(formData: FormData) {
  const id = formData.get('id') as string
  const status = formData.get('status') as string

  await prisma.blogPost.update({
    where: { id },
    data: {
      status,
      published_at: status === 'published' ? new Date() : null,
    },
  })

  revalidatePath('/blog')
}

export async function deleteBlogPost(id: string) {
  await prisma.blogPost.delete({ where: { id } })
  redirect('/blog')
}

export async function createBlogPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const excerpt = formData.get('excerpt') as string | null
  const category_id = formData.get('category_id') as string
  const author_id = formData.get('author_id') as string
  const status = formData.get('status') as string
  const og_image = (formData.get('og_image') as string) || null

  await prisma.blogPost.create({
    data: {
      id: crypto.randomUUID(),
      title,
      slug: slugify(title),
      content,
      excerpt: excerpt || null,
      category_id,
      author_id,
      status,
      og_image,
      published_at: status === 'published' ? new Date() : null,
    },
  })

  redirect('/blog')
}

export async function updateBlogPost(id: string, formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const excerpt = formData.get('excerpt') as string | null
  const category_id = formData.get('category_id') as string
  const status = formData.get('status') as string
  const og_image = (formData.get('og_image') as string) || null

  const existing = await prisma.blogPost.findUnique({ where: { id }, select: { status: true, published_at: true } })
  const wasPublished = existing?.status === 'published'
  const isPublishing = status === 'published'

  await prisma.blogPost.update({
    where: { id },
    data: {
      title,
      slug: slugify(title),
      content,
      excerpt: excerpt || null,
      category_id,
      status,
      og_image,
      published_at: isPublishing && !wasPublished ? new Date() : (isPublishing ? existing?.published_at : null),
    },
  })

  redirect('/blog')
}
