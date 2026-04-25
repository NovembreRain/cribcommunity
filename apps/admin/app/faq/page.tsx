import { type Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@crib/db'
import { Plus, Pencil } from 'lucide-react'
import { deleteFaq } from './actions'
import { DeleteButton } from '@/components/DeleteButton'

export const metadata: Metadata = { title: 'FAQ' }
export const dynamic = 'force-dynamic'

export default async function FAQPage() {
  const faqs = await prisma.fAQ.findMany({ orderBy: { sort_order: 'asc' } })

  const byCategory = faqs.reduce<Record<string, typeof faqs>>((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = []
    acc[faq.category]!.push(faq)
    return acc
  }, {})

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-text-high mb-1">FAQ</h1>
          <p className="text-text-low text-sm">{faqs.length} question{faqs.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/faq/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Add FAQ
        </Link>
      </div>

      {faqs.length === 0 ? (
        <div className="bg-surface-dark rounded-2xl p-12 text-center border border-gold-border/20">
          <p className="text-text-low text-sm mb-4">No FAQs yet.</p>
          <Link href="/faq/new" className="text-primary text-sm hover:underline">Add your first FAQ →</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byCategory).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h2 className="text-xs text-text-low uppercase tracking-[0.15em] font-medium">{category}</h2>
              <div className="bg-surface-dark rounded-2xl border border-gold-border/20 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gold-border/10">
                    {items.map((faq) => (
                      <tr key={faq.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-4 py-3 w-8 text-text-low text-xs">{faq.sort_order}</td>
                        <td className="px-4 py-3">
                          <p className="text-text-high font-medium">{faq.question}</p>
                          <p className="text-text-low text-xs mt-0.5 line-clamp-2">{faq.answer}</p>
                        </td>
                        <td className="px-4 py-3 w-32">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/faq/${faq.id}/edit`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-medium hover:bg-white/5 border border-gold-border/20 transition-colors"
                            >
                              <Pencil size={12} />
                              Edit
                            </Link>
                            <DeleteButton
                              label="FAQ"
                              action={async () => {
                                'use server'
                                await deleteFaq(faq.id)
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
