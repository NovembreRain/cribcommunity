import { type Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@crib/db'
import { formatDate } from '@crib/lib'
import { Plus, Pencil } from 'lucide-react'
import { deleteJob } from './actions'
import { DeleteButton } from '@/components/DeleteButton'

export const metadata: Metadata = { title: 'Jobs' }
export const dynamic = 'force-dynamic'

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { created_at: 'desc' },
    include: { _count: { select: { applications: true } } },
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-text-high mb-1">Jobs</h1>
          <p className="text-text-low text-sm">{jobs.length} listing{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Post Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-surface-dark rounded-2xl p-12 text-center border border-gold-border/20">
          <p className="text-text-low text-sm mb-4">No job listings yet.</p>
          <Link href="/jobs/new" className="text-primary text-sm hover:underline">Post your first job →</Link>
        </div>
      ) : (
        <div className="bg-surface-dark rounded-2xl border border-gold-border/20 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-border/20">
                {['Title', 'Location', 'Salary', 'Applications', 'Valid Through', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-text-low text-xs uppercase tracking-[0.1em] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-border/10">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-text-high font-medium">{job.title}</td>
                  <td className="px-4 py-3 text-text-medium">{job.location}</td>
                  <td className="px-4 py-3 text-text-low">{job.salary_range ?? '—'}</td>
                  <td className="px-4 py-3 text-text-low">{job._count.applications}</td>
                  <td className="px-4 py-3 text-text-low text-xs">
                    {job.valid_through ? formatDate(job.valid_through) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/jobs/${job.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-medium hover:bg-white/5 border border-gold-border/20 transition-colors"
                      >
                        <Pencil size={12} />
                        Edit
                      </Link>
                      <DeleteButton
                        label="Job"
                        action={async () => {
                          'use server'
                          await deleteJob(job.id)
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
