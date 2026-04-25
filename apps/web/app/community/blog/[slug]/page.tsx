import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@crib/db'
import { formatDate } from '@crib/lib'
import Image from 'next/image'
import { NavBar } from '@/components/home/NavBar'
import { ChevronRight } from 'lucide-react'
import { Footer } from '@/components/home/Footer'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: { slug, status: 'published' },
    select: { title: true, meta_description: true, excerpt: true },
  })
  if (!post) return {}
  return {
    title: `${post.title} — Crib Community`,
    description: post.meta_description ?? post.excerpt ?? undefined,
  }
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: { slug, status: 'published' },
    include: { category: true },
  })
  if (!post) notFound()

  return (
    <main className="min-h-screen bg-background-dark">
      <NavBar />
      <div className="pt-32" />

      <article className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-text-low">
          <Link href="/community/blog" className="hover:text-text-medium transition-colors">Journal</Link>
          <ChevronRight size={12} />
          <span className="text-primary">{post.category.name}</span>
        </nav>

        {/* Cover image */}
        {post.og_image && (
          <div className="relative w-full h-72 rounded-2xl overflow-hidden">
            <Image src={post.og_image} alt={post.title} fill sizes="(max-width: 768px) 100vw, 672px" className="object-cover" />
          </div>
        )}

        {/* Header */}
        <header className="space-y-4">
          <span className="text-xs text-primary uppercase tracking-[0.15em] font-bold">
            {post.category.name}
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-text-high leading-tight">{post.title}</h1>
          {post.excerpt && (
            <p className="text-text-medium text-lg leading-relaxed">{post.excerpt}</p>
          )}
          <p className="text-text-low text-xs">
            {post.published_at ? formatDate(post.published_at) : ''}
          </p>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gold-border/30 to-transparent" />
        </header>

        {/* Content */}
        <div className="prose prose-invert prose-sm max-w-none text-text-medium leading-relaxed space-y-4">
          {post.content.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>

      <div className="max-w-2xl mx-auto px-6 pb-12">
        <Link
          href="/community/blog"
          className="inline-flex items-center text-primary hover:text-accent-amber transition-colors uppercase text-xs tracking-[0.2em] font-bold border-b border-primary/30 hover:border-primary pb-1"
        >
          ← Back to Journal
        </Link>
      </div>

      <Footer />
    </main>
  )
}
