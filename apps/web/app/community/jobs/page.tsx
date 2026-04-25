import { type Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@crib/db'
import { formatDate } from '@crib/lib'
import { NavBar } from '@/components/home/NavBar'
import { SectionShell } from '@/components/home/SectionShell'
import { MapPin, Banknote, Clock } from 'lucide-react'
import { Footer } from '@/components/home/Footer'
import { FAQSection } from '@/components/home/FAQSection'

export const metadata: Metadata = {
  title: 'Careers — Crib Community',
  description: 'Work where others come to escape. Join the Crib Community team.',
}
export const dynamic = 'force-dynamic'

export default async function JobsPage() {
  const [jobs, faqs] = await Promise.all([
    prisma.job.findMany({
    where: {
      OR: [
        { valid_through: null },
        { valid_through: { gte: new Date() } },
      ],
    },
    orderBy: { created_at: 'desc' },
    }),
    prisma.fAQ.findMany({ where: { context: 'careers' }, orderBy: { sort_order: 'asc' } }),
  ])

  return (
    <main className="min-h-screen bg-background-dark">
      <NavBar />
      <div className="pt-32" />

      <SectionShell
        eyebrow="Join Us"
        title="Work at Crib"
        description="Help build the community. Open roles across all our locations."
        className="bg-background-dark pt-0"
      >
        {jobs.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-gold-border/20">
            <p className="text-text-low">No open positions right now — check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/community/jobs/${job.slug}`}
                className="glass-panel rounded-2xl border border-gold-border/20 hover:border-primary/30 transition-colors p-6 block group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-display text-xl text-text-high group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
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
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-primary/60" />
                          Apply by {formatDate(job.valid_through)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex items-center text-primary uppercase text-xs tracking-[0.15em] font-bold shrink-0">
                    Apply →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionShell>

      {faqs.length > 0 && (
        <FAQSection faqs={faqs} title="Careers FAQ" />
      )}
      <Footer />
    </main>
  )
}
