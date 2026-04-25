import { type Metadata } from 'next'
import { prisma } from '@crib/db'
import { formatDate } from '@crib/lib'
import { updateEnquiryStatus } from './actions'
import { StatusSelect } from '@/components/StatusSelect'

export const metadata: Metadata = { title: 'Enquiries' }
export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  new:        'bg-blue-500/15 text-blue-400 border-blue-500/20',
  responded:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  closed:     'bg-text-low/15 text-text-low border-text-low/20',
}

export default async function EnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({
    orderBy: { created_at: 'desc' },
  })

  const newCount = enquiries.filter((e) => e.status === 'new').length

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-display text-3xl text-text-high mb-1">Enquiries</h1>
        <p className="text-text-low text-sm">{newCount} new · {enquiries.length} total</p>
      </div>

      {enquiries.length === 0 ? (
        <div className="bg-surface-dark rounded-2xl p-12 text-center border border-gold-border/20">
          <p className="text-text-low text-sm">No enquiries yet.</p>
        </div>
      ) : (
        <div className="bg-surface-dark rounded-2xl border border-gold-border/20 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-border/20">
                {['Name / Email', 'Message', 'Intent', 'Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-text-low text-xs uppercase tracking-[0.1em] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-border/10">
              {enquiries.map((e) => (
                <tr key={e.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-text-high font-medium">{e.name}</p>
                    <p className="text-text-low text-xs">{e.email}</p>
                  </td>
                  <td className="px-4 py-3 text-text-medium max-w-xs">
                    <p className="truncate">{e.message}</p>
                  </td>
                  <td className="px-4 py-3 text-text-low text-xs">{e.intent ?? '—'}</td>
                  <td className="px-4 py-3 text-text-low text-xs">{formatDate(e.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[e.status] ?? 'bg-white/10 text-text-low border-white/10'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateEnquiryStatus}>
                      <input type="hidden" name="id" value={e.id} />
                      <StatusSelect name="status" defaultValue={e.status} options={['new', 'responded', 'closed']} />
                    </form>
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
