import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { prisma } from '@crib/db'
import { updateBlogPost } from '../../actions'
import { ImageUploader } from '@/components/ImageUploader'

export const metadata: Metadata = { title: 'Edit Post' }
export const dynamic = 'force-dynamic'

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [post, categories] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id } }),
    prisma.blogCategory.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!post) notFound()

  const update = updateBlogPost.bind(null, id)

  const fieldBase =
    'w-full bg-surface-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors'

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-text-low">
        <Link href="/blog" className="hover:text-text-medium transition-colors">Blog</Link>
        <ChevronRight size={12} />
        <span className="text-text-medium">{post.title}</span>
        <ChevronRight size={12} />
        <span className="text-text-medium">Edit</span>
      </nav>

      <div>
        <h1 className="font-display text-3xl text-text-high mb-1">Edit Post</h1>
        <p className="text-text-low font-mono text-xs">{post.slug}</p>
      </div>

      <form action={update} className="space-y-5">
        <Field label="Title *" name="title" defaultValue={post.title} />

        <div className="space-y-1.5">
          <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Cover Image</label>
          <ImageUploader name="og_image" defaultValue={post.og_image ? [post.og_image] : []} max={1} folder="blog" singleUrl />
        </div>

        <Field label="Excerpt" name="excerpt" textarea defaultValue={post.excerpt ?? ''} />
        <Field label="Content *" name="content" textarea defaultValue={post.content} rows={12} />

        <div className="space-y-1.5">
          <label htmlFor="category_id" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">
            Category *
          </label>
          <select id="category_id" name="category_id" defaultValue={post.category_id} className={fieldBase}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="status" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">
            Status
          </label>
          <select id="status" name="status" defaultValue={post.status} className={fieldBase}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Save Changes
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
  label, name, defaultValue, textarea, rows,
}: {
  label: string; name: string; defaultValue?: string; textarea?: boolean; rows?: number
}) {
  const base =
    'w-full bg-surface-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors'
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">{label}</label>
      {textarea ? (
        <textarea id={name} name={name} defaultValue={defaultValue ?? ''} rows={rows ?? 4} className={base} />
      ) : (
        <input id={name} name={name} defaultValue={defaultValue ?? ''} className={base} />
      )}
    </div>
  )
}
