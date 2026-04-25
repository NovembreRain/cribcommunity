import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { prisma } from '@crib/db'
import { updateJob } from '../../actions'

export const metadata: Metadata = { title: 'Edit Job' }
export const dynamic = 'force-dynamic'

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [job, locations] = await Promise.all([
    prisma.job.findUnique({ where: { id } }),
    prisma.location.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!job) notFound()

  const update = updateJob.bind(null, id)
  const base =
    'w-full bg-surface-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors'

  const validThrough = job.valid_through
    ? job.valid_through.toISOString().split('T')[0]
    : ''

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-text-low">
        <Link href="/jobs" className="hover:text-text-medium transition-colors">Jobs</Link>
        <ChevronRight size={12} />
        <span className="text-text-medium">{job.title}</span>
        <ChevronRight size={12} />
        <span className="text-text-medium">Edit</span>
      </nav>
      <h1 className="font-display text-3xl text-text-high">Edit Job</h1>

      <form action={update} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Title *</label>
          <input id="title" name="title" defaultValue={job.title} className={base} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="location" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Location *</label>
          <select id="location" name="location" defaultValue={job.location} className={base}>
            <option value="">Select location…</option>
            {locations.map((l) => (
              <option key={l.id} value={`${l.city}, ${l.state}`}>{l.name} — {l.city}</option>
            ))}
            <option value="Remote">Remote</option>
            <option value="Multiple Locations">Multiple Locations</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="salary_range" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Salary Range</label>
          <input id="salary_range" name="salary_range" defaultValue={job.salary_range ?? ''} className={base} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="description" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Description *</label>
          <textarea id="description" name="description" defaultValue={job.description} rows={6} className={base} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="valid_through" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Valid Through</label>
          <input type="date" id="valid_through" name="valid_through" defaultValue={validThrough} className={base} />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Save Changes
          </button>
          <Link href="/jobs" className="px-5 py-2.5 rounded-xl text-sm text-text-low hover:bg-white/5 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
