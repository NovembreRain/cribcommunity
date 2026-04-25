import { type Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@crib/db'
import { formatDate } from '@crib/lib'
import { Plus, Pencil, Tag } from 'lucide-react'
import { deleteBlogPost, toggleBlogStatus } from './actions'
import { DeleteButton } from '@/components/DeleteButton'

export const metadata: Metadata = { title: 'Blog' }
export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  draft:     'bg-text-low/15 text-text-low border-text-low/20',
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { published_at: 'desc' },
    include: {
      category: { select: { name: true } },
    },
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-text-high mb-1">Blog</h1>
          <p className="text-text-low text-sm">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/blog/categories" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gold-border/20 text-text-low text-sm font-medium hover:bg-white/5 transition-colors">
            <Tag size={16} />
            Categories
          </Link>
          <Link href="/blog/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus size={16} />
            New Post
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="bg-surface-dark rounded-2xl p-12 text-center border border-gold-border/20">
          <p className="text-text-low text-sm mb-4">No blog posts yet.</p>
          <Link href="/blog/new" className="text-primary text-sm hover:underline">
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="bg-surface-dark rounded-2xl border border-gold-border/20 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-border/20">
                {['Title', 'Category', 'Status', 'Published', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-text-low text-xs uppercase tracking-[0.1em] font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-border/10">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-text-high font-medium">{post.title}</p>
                    <p className="text-text-low text-xs font-mono">{post.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-text-medium">{post.category.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[post.status] ?? 'bg-white/10 text-text-low border-white/10'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-low text-xs">
                    {post.published_at ? formatDate(post.published_at) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <form action={toggleBlogStatus}>
                        <input type="hidden" name="id" value={post.id} />
                        <input type="hidden" name="status" value={post.status === 'published' ? 'draft' : 'published'} />
                        <button
                          type="submit"
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            post.status === 'published'
                              ? 'bg-text-low/10 text-text-low border-text-low/20 hover:bg-text-low/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                        >
                          {post.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                      </form>
                      <Link
                        href={`/blog/${post.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-medium hover:bg-white/5 border border-gold-border/20 transition-colors"
                      >
                        <Pencil size={12} />
                        Edit
                      </Link>
                      <DeleteButton
                        label="Post"
                        action={async () => {
                          'use server'
                          await deleteBlogPost(post.id)
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
