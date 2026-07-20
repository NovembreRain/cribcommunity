import { type Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@crib/db'
import { formatDate } from '@crib/lib'
import { NavBar } from '@/components/home/NavBar'
import { SectionShell } from '@/components/home/SectionShell'
import { Footer } from '@/components/home/Footer'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Travel guides and stories from Crib Community — things to do in Auroville and Pondicherry, hostel life, and the people who make it home.',
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
        titleAs="h1"
        description="Travel guides, perspectives, and tales from Crib Community's Auroville hostels and the travellers who pass through."
        className="bg-background-dark pt-0"
      >
        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 mb-10 flex-wrap">
            <Link
              href="/community/blog"
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] border transition-colors ${
                !category
                  ? 'bg-primary text-white border-primary shadow-glow'
                  : 'glass-panel border-gold-border/20 text-text-low hover:text-text-medium hover:border-primary/20'
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
                    ? 'bg-primary text-white border-primary shadow-glow'
                    : 'glass-panel border-gold-border/20 text-text-low hover:text-text-medium hover:border-primary/20'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="glass-panel rounded-2xl p-16 text-center border border-gold-border/10">
            <p className="text-text-low text-sm">No posts published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/community/blog/${post.slug}`}
                className="glass-panel rounded-2xl border border-gold-border/15 hover:border-primary/30 transition-all duration-300 overflow-hidden group block hover:-translate-y-0.5 hover:shadow-glow"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Cover image */}
                <div className="relative h-48 bg-surface-dark overflow-hidden">
                  {post.og_image ? (
                    <Image
                      src={post.og_image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-surface-dark to-background-dark flex items-end p-5">
                      <span className="text-gold-border/15 font-display text-8xl italic leading-none select-none">
                        {post.title[0]}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark/50 to-transparent" />
                  {/* Category chip */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center rounded-full bg-background-dark/70 backdrop-blur-sm border border-gold-border/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {post.category.name}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-2.5">
                  <h3 className="font-display text-lg text-text-high group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-text-low text-sm leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="text-text-low/60 text-xs pt-1 border-t border-gold-border/10">
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
