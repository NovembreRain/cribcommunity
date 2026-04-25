import { type Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createFaq } from '../actions'

export const metadata: Metadata = { title: 'New FAQ' }

const base = 'w-full bg-surface-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors'

const CONTEXTS = [
  { value: 'general', label: 'General (FAQ page)' },
  { value: 'booking', label: 'Booking' },
  { value: 'location', label: 'Location pages' },
  { value: 'property', label: 'Property pages' },
  { value: 'events', label: 'Events page' },
  { value: 'careers', label: 'Careers/Jobs page' },
]

export default function NewFAQPage() {
  return (
    <div className="p-8 max-w-2xl space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-text-low">
        <Link href="/faq" className="hover:text-text-medium transition-colors">FAQ</Link>
        <ChevronRight size={12} />
        <span className="text-text-medium">New</span>
      </nav>

      <h1 className="font-display text-3xl text-text-high">Add FAQ</h1>

      <form action={createFaq} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="question" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Question *</label>
          <input id="question" name="question" placeholder="What is the check-in time?" className={base} required />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="answer" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Answer *</label>
          <textarea id="answer" name="answer" placeholder="Check-in is from 2:00 PM…" rows={4} className={base} required />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5 col-span-2">
            <label htmlFor="context" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Appears On *</label>
            <select id="context" name="context" className={base} required>
              {CONTEXTS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="category" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Category Tag</label>
            <input id="category" name="category" placeholder="check-in" className={base} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="sort_order" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Sort Order</label>
          <input id="sort_order" name="sort_order" type="number" defaultValue="0" className={base} />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Add FAQ
          </button>
          <Link href="/faq" className="px-5 py-2.5 rounded-xl text-sm text-text-low hover:bg-white/5 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
