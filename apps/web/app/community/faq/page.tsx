import { type Metadata } from 'next'
import { prisma } from '@crib/db'
import { NavBar } from '@/components/home/NavBar'
import { Footer } from '@/components/home/Footer'
import { SectionShell } from '@/components/home/SectionShell'
import { FAQSection } from '@/components/home/FAQSection'

export const metadata: Metadata = {
  title: 'FAQ — Crib Community',
  description: 'Everything you need to know about staying at Crib Community.',
}
export const dynamic = 'force-dynamic'

const CONTEXT_LABELS: Record<string, string> = {
  booking:   'Bookings & Reservations',
  location:  'Locations',
  property:  'Properties & Rooms',
  events:    'Events',
  careers:   'Careers',
  general:   'General',
}

export default async function FAQPage() {
  const faqs = await prisma.fAQ.findMany({ orderBy: [{ context: 'asc' }, { sort_order: 'asc' }] })

  // Group by context
  const grouped = faqs.reduce<Record<string, typeof faqs>>((acc, faq) => {
    const ctx = faq.context ?? 'general'
    if (!acc[ctx]) acc[ctx] = []
    acc[ctx]!.push(faq)
    return acc
  }, {})

  const contextOrder = ['booking', 'property', 'location', 'events', 'careers', 'general']

  return (
    <main className="min-h-screen bg-background-dark">
      <NavBar />
      <div className="pt-32" />

      <SectionShell
        eyebrow="Help"
        title="Frequently Asked Questions"
        description="Everything you need to know about Crib Community — stays, bookings, and life at the hostel."
        className="bg-background-dark pt-0"
      >
        {faqs.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-gold-border/20">
            <p className="text-text-low">No FAQs yet — check back soon.</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {contextOrder.map((ctx) => {
              const items = grouped[ctx]
              if (!items || items.length === 0) return null
              return (
                <div key={ctx}>
                  <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-4 flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-gradient-to-r from-primary to-transparent" />
                    {CONTEXT_LABELS[ctx] ?? ctx}
                  </h2>
                  <div className="glass-panel rounded-2xl border border-gold-border/20 px-6 divide-y divide-gold-border/10">
                    <FAQItems items={items} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SectionShell>

      <Footer />
    </main>
  )
}

function FAQItems({ items }: { items: Array<{ id: string; question: string; answer: string }> }) {
  // Server-side render — each item is static, client interaction via FAQSection
  return (
    <>
      {items.map((faq) => (
        <div key={faq.id} className="py-5">
          <p className="font-medium text-sm text-text-high mb-2">{faq.question}</p>
          <p className="text-text-medium text-sm leading-relaxed">{faq.answer}</p>
        </div>
      ))}
    </>
  )
}
