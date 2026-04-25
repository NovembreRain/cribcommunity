import { type Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { prisma } from '@crib/db'
import { createJob } from '../actions'

export const metadata: Metadata = { title: 'Post Job' }
export const dynamic = 'force-dynamic'

const base = 'w-full bg-surface-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors'

export default async function NewJobPage() {
  const locations = await prisma.location.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-text-low">
        <Link href="/jobs" className="hover:text-text-medium transition-colors">Jobs</Link>
        <ChevronRight size={12} />
        <span className="text-text-medium">New</span>
      </nav>

      <h1 className="font-display text-3xl text-text-high">Post a Job</h1>

      <form action={createJob} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Title *</label>
          <input name="title" placeholder="Hostel Manager — Goa" className={base} required />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Location *</label>
          <select name="location" className={base} required>
            <option value="">Select location…</option>
            {locations.map((l) => (
              <option key={l.id} value={`${l.city}, ${l.state}`}>{l.name} — {l.city}</option>
            ))}
            <option value="Remote">Remote</option>
            <option value="Multiple Locations">Multiple Locations</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Salary Range</label>
          <input name="salary_range" placeholder="₹25,000 – ₹35,000 / month" className={base} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Description *</label>
          <textarea name="description" placeholder="Role summary, responsibilities, requirements…" rows={6} className={base} required />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Valid Through</label>
          <input type="date" name="valid_through" className={base} />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Post Job
          </button>
          <Link href="/jobs" className="px-5 py-2.5 rounded-xl text-sm text-text-low hover:bg-white/5 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
