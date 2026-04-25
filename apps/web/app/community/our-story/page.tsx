import { type Metadata } from 'next'
import { prisma } from '@crib/db'
import { NavBar } from '@/components/home/NavBar'
import { SectionShell } from '@/components/home/SectionShell'
import { Footer } from '@/components/home/Footer'

export const metadata: Metadata = {
  title: 'Our Story — Crib Community',
  description: 'How Crib Community came to be — the journey from a single hostel to a movement.',
}
export const dynamic = 'force-dynamic'

export default async function OurStoryPage() {
  const timeline = await prisma.timelineEvent.findMany({
    orderBy: { sort_order: 'asc' },
  })

  return (
    <main className="min-h-screen bg-background-dark">
      <NavBar />
      <div className="pt-32" />

      <SectionShell
        eyebrow="About Us"
        title="Our Story"
        description="From a single room in Goa to a community of travellers across India — this is how it all started."
        className="bg-background-dark pt-0"
      >
        {timeline.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-gold-border/20">
            <p className="text-text-low">Our story is still being written.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[calc(4rem-1px)] top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/40 via-gold-border/20 to-transparent hidden md:block" />

            <div className="space-y-12">
              {timeline.map((event, i) => (
                <div key={event.id} className="flex gap-8 items-start">
                  {/* Year badge */}
                  <div className="shrink-0 w-16 text-right hidden md:block">
                    <span className="font-display text-primary text-lg font-bold">{event.year}</span>
                  </div>

                  {/* Dot */}
                  <div className="shrink-0 w-4 h-4 rounded-full bg-primary border-2 border-background-dark mt-1 hidden md:block" />

                  {/* Content */}
                  <div className="glass-panel rounded-2xl p-6 border border-gold-border/20 flex-1">
                    <div className="flex items-center gap-3 mb-2 md:hidden">
                      <span className="font-display text-primary text-lg font-bold">{event.year}</span>
                    </div>
                    <h3 className="font-display text-xl text-text-high mb-2">{event.title}</h3>
                    {event.description && (
                      <p className="text-text-medium text-sm leading-relaxed">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionShell>

      <Footer />
    </main>
  )
}
