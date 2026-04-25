'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SectionShellProps {
  eyebrow: string
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
  containerClassName?: string
}

const EASE = [0.25, 0.1, 0.25, 1] as const

export function SectionShell({
  eyebrow,
  title,
  description,
  children,
  className,
  containerClassName,
}: SectionShellProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className={cn('py-24 px-6', className)}>
      <div className={cn('max-w-7xl mx-auto', containerClassName)} ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-12"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-4 flex items-center gap-3">
            <span className="w-8 h-[2px] bg-gradient-to-r from-primary to-transparent" />
            {eyebrow}
          </p>
          <p className="font-display text-4xl md:text-5xl text-text-high mb-4">{title}</p>
          {description && (
            <p className="text-text-medium font-light max-w-xl">{description}</p>
          )}
        </motion.div>

        {children}
      </div>
    </section>
  )
}
