import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@crib/db'
import { formatDate } from '@crib/lib'
import { NavBar } from '@/components/home/NavBar'
import { MapPin, Banknote, ChevronRight } from 'lucide-react'
import { applyForJob } from './actions'
import { Footer } from '@/components/home/Footer'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const job = await prisma.job.findUnique({ where: { slug }, select: { title: true } })
  if (!job) return {}
  return { title: `${job.title} — Crib Community` }
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const job = await prisma.job.findUnique({ where: { slug } })
  if (!job) notFound()

  const isExpired = job.valid_through && job.valid_through < new Date()

  return (
    <main className="min-h-screen bg-background-dark">
      <NavBar />
      <div className="pt-32" />

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <nav className="flex items-center gap-1.5 text-xs text-text-low">
          <Link href="/community/jobs" className="hover:text-text-medium transition-colors">Careers</Link>
          <ChevronRight size={12} />
          <span className="text-text-medium">{job.title}</span>
        </nav>

        <div className="space-y-3">
          <h1 className="font-display text-4xl text-text-high">{job.title}</h1>
          <div className="flex items-center gap-4 text-xs text-text-low flex-wrap">
            <span className="flex items-center gap-1.5">
              <MapPin size={12} className="text-primary/60" />
              {job.location}
            </span>
            {job.salary_range && (
              <span className="flex items-center gap-1.5">
                <Banknote size={12} className="text-primary/60" />
                {job.salary_range}
              </span>
            )}
            {job.valid_through && (
              <span className="text-text-low">Apply by {formatDate(job.valid_through)}</span>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-gold-border/20">
          <div className="text-text-medium text-sm leading-relaxed space-y-4">
            {job.description.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        {!isExpired && (
          <div className="glass-panel rounded-2xl p-6 border border-gold-border/20 space-y-5">
            <h2 className="font-display text-xl text-text-high">Apply for this Role</h2>
            <form action={applyForJob} className="space-y-4">
              <input type="hidden" name="job_id" value={job.id} />
              <Field label="Full Name *" name="applicant_name" placeholder="Jane Doe" />
              <Field label="Email *" name="email" placeholder="jane@example.com" />
              <Field label="Phone" name="phone" placeholder="+91 98765 43210" />
              <Field label="Resume URL *" name="resume_url" placeholder="https://drive.google.com/..." />
              <div className="space-y-1.5">
                <label htmlFor="talent_description" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">
                  Why Crib? Tell us about yourself.
                </label>
                <textarea
                  id="talent_description"
                  name="talent_description"
                  placeholder="What makes you a great fit for the Crib culture…"
                  rows={5}
                  className="w-full bg-background-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl text-sm font-bold tracking-[0.1em] uppercase transition-colors"
              >
                Submit Application
              </button>
            </form>
          </div>
        )}

        {isExpired && (
          <div className="glass-panel rounded-2xl p-6 border border-gold-border/20 text-center">
            <p className="text-text-low text-sm">This position is no longer accepting applications.</p>
            <Link href="/community/jobs" className="text-primary text-sm hover:underline mt-2 inline-block">
              View open roles →
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}

function Field({ label, name, placeholder }: { label: string; name: string; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        className="w-full bg-background-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors"
      />
    </div>
  )
}
