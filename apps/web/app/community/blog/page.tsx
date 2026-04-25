import { type Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@crib/db'
import { formatDate, truncate } from '@crib/lib'
import { NavBar } from '@/components/home/NavBar'
import { SectionShell } from '@/components/home/SectionShell'
import { Footer } from '@/components/home/Footer'

export const metadata: Metadata = {
  title: 'Journal — Crib Community',
  description: 'Stories, guides, and perspectives from life on the road.',
}
export const dynamic = 'force-dynamic'

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams

  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        status: 'published',
        ...(category ? { category: { slug: category } } : {}),
      },
      orderBy: { published_at: 'desc' },
      include: { category: true },
    }),
    prisma.blogCategory.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <main className="min-h-screen bg-background-dark">
      <NavBar />
      <div className="pt-32" />

      <SectionShell
        eyebrow="The Journal"
        title="Stories from the Road"
        description="Guides, perspectives, and tales from Crib travellers and staff."
        className="bg-background-dark pt-0"
      >
        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 mb-10 flex-wrap">
            <Link
              href="/community/blog"
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] border transition-colors ${
                !category
                  ? 'bg-primary text-white border-primary'
                  : 'glass-panel border-gold-border/20 text-text-low hover:text-text-medium'
              }`}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/community/blog?category=${c.slug}`}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] border transition-colors ${
                  category === c.slug
                    ? 'bg-primary text-white border-primary'
                    : 'glass-panel border-gold-border/20 text-text-low hover:text-text-medium'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-gold-border/20">
            <p className="text-text-low">No posts published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/community/blog/${post.slug}`}
                className="glass-panel rounded-2xl border border-gold-border/20 hover:border-primary/30 transition-colors overflow-hidden group block"
              >
                {/* Image placeholder area */}
                <div className="h-44 bg-gradient-to-br from-surface-dark to-background-dark flex items-center justify-center">
                  <span className="text-primary/20 font-display text-5xl italic">C.</span>
                </div>
                <div className="p-5 space-y-3">
                  <span className="text-xs text-primary uppercase tracking-[0.15em] font-bold">
                    {post.category.name}
                  </span>
                  <h3 className="font-display text-lg text-text-high group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-text-low text-sm leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="text-text-low text-xs">
                    {post.published_at ? formatDate(post.published_at) : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionShell>

      <Footer />
    </main>
  )
}
