import { type Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { prisma } from '@crib/db'
import { createBlogPost } from '../actions'
import { ImageUploader } from '@/components/ImageUploader'

export const metadata: Metadata = { title: 'New Post' }
export const dynamic = 'force-dynamic'

export default async function NewBlogPostPage() {
  const [categories, users] = await Promise.all([
    prisma.blogCategory.findMany({ orderBy: { name: 'asc' } }),
    prisma.user.findMany({ orderBy: { email: 'asc' }, select: { id: true, email: true } }),
  ])

  const fieldBase =
    'w-full bg-surface-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors'

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-text-low">
        <Link href="/blog" className="hover:text-text-medium transition-colors">Blog</Link>
        <ChevronRight size={12} />
        <span className="text-text-medium">New Post</span>
      </nav>

      <div>
        <h1 className="font-display text-3xl text-text-high mb-1">New Post</h1>
      </div>

      <form action={createBlogPost} className="space-y-5">
        <Field label="Title *" name="title" placeholder="Why Goa is the perfect hostel destination" />

        <div className="space-y-1.5">
          <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Cover Image</label>
          <ImageUploader name="og_image" max={1} folder="blog" singleUrl />
        </div>
        <Field label="Excerpt" name="excerpt" textarea placeholder="Short description shown in listings…" />
        <Field label="Content *" name="content" textarea placeholder="Write your post in plain text or markdown…" rows={12} />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="category_id" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">
              Category *
            </label>
            <select id="category_id" name="category_id" className={fieldBase}>
              <option value="" disabled>Select category…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="author_id" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">
              Author *
            </label>
            <select id="author_id" name="author_id" className={fieldBase}>
              <option value="" disabled>Select author…</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="status" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">
            Status
          </label>
          <select id="status" name="status" defaultValue="draft" className={fieldBase}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Create Post
          </button>
          <Link href="/blog" className="px-5 py-2.5 rounded-xl text-sm text-text-low hover:bg-white/5 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  name,
  placeholder,
  textarea,
  rows,
}: {
  label: string
  name: string
  placeholder?: string
  textarea?: boolean
  rows?: number
}) {
  const base =
    'w-full bg-surface-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors'

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">
        {label}
      </label>
      {textarea ? (
        <textarea id={name} name={name} placeholder={placeholder} rows={rows ?? 4} className={base} />
      ) : (
        <input id={name} name={name} placeholder={placeholder} className={base} />
      )}
    </div>
  )
}
