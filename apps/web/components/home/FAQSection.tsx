'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQ { id: string; question: string; answer: string }

export function FAQSection({ faqs, title = 'Frequently Asked Questions' }: { faqs: FAQ[]; title?: string }) {
  const [open, setOpen] = useState<string | null>(null)

  if (faqs.length === 0) return null

  return (
    <section className="max-w-2xl mx-auto px-6 py-16">
      <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2 flex items-center gap-3">
        <span className="w-8 h-[2px] bg-gradient-to-r from-primary to-transparent" />
        {title}
      </h2>
      <div className="mt-6 divide-y divide-gold-border/10">
        {faqs.map((faq) => (
          <div key={faq.id}>
            <button
              onClick={() => setOpen(open === faq.id ? null : faq.id)}
              className="w-full flex items-center justify-between py-5 text-left group"
            >
              <span className={cn(
                'font-medium text-sm pr-6 transition-colors',
                open === faq.id ? 'text-primary' : 'text-text-high group-hover:text-primary'
              )}>
                {faq.question}
              </span>
              <ChevronDown
                size={16}
                className={cn(
                  'shrink-0 text-text-low transition-transform duration-200',
                  open === faq.id && 'rotate-180 text-primary'
                )}
              />
            </button>
            {open === faq.id && (
              <p className="pb-5 text-text-medium text-sm leading-relaxed">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
