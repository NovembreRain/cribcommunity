import { type Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Trash2 } from 'lucide-react'
import { prisma } from '@crib/db'
import { createBlogCategory, deleteBlogCategory } from '../actions'
import { DeleteButton } from '@/components/DeleteButton'

export const metadata: Metadata = { title: 'Blog Categories' }
export const dynamic = 'force-dynamic'

const base = 'w-full bg-surface-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors'

export default async function BlogCategoriesPage() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { posts: true } } },
  })

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-text-low">
        <Link href="/blog" className="hover:text-text-medium transition-colors">Blog</Link>
        <ChevronRight size={12} />
        <span className="text-text-medium">Categories</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-text-high mb-1">Blog Categories</h1>
          <p className="text-text-low text-sm">{categories.length} categories</p>
        </div>
      </div>

      {/* Add new */}
      <form action={createBlogCategory} className="flex gap-3">
        <input name="name" placeholder="e.g. Travel Tips" className={base} required />
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap">
          Add Category
        </button>
      </form>

      {categories.length === 0 ? (
        <div className="bg-surface-dark rounded-2xl p-12 text-center border border-gold-border/20">
          <p className="text-text-low text-sm">No categories yet — add one above.</p>
        </div>
      ) : (
        <div className="bg-surface-dark rounded-2xl border border-gold-border/20 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-border/20">
                {['Name', 'Slug', 'Posts', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-text-low text-xs uppercase tracking-[0.1em] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-border/10">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-text-high font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-text-low font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3 text-text-low">{c._count.posts}</td>
                  <td className="px-4 py-3">
                    <DeleteButton
                      label="Category"
                      action={async () => { 'use server'; await deleteBlogCategory(c.id) }}
                    />
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
