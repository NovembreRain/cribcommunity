'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { LucideIcon } from './LucideIcon'

const EASE = [0.25, 0.1, 0.25, 1] as const

interface LocationCardProps {
  id: string
  slug: string
  image: string | null
  name: string
  city: string
  country: string
  tagline: string
  categoryIcon?: string
  ctaLabel?: string
  index: number
}

export function LocationCard({
  slug,
  image,
  name,
  city,
  country,
  tagline,
  categoryIcon = 'map-pin',
  ctaLabel = 'Explore',
  index,
}: LocationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: EASE, delay: index * 0.08 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Link href={`/locations/${slug}`} className="block">
        <div className="glass-panel rounded-2xl overflow-hidden h-80 relative">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-surface-dark via-surface-dark/80 to-primary/10 flex items-center justify-center">
              <LucideIcon name={categoryIcon} size={48} className="text-gold-border/40" />
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/20 to-transparent" />

          {/* Content */}
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1 flex items-center gap-1.5">
              <LucideIcon name={categoryIcon} size={11} />
              {city}, {country}
            </p>
            <p className="font-display text-xl text-text-high mb-1">{name}</p>
            <p className="text-text-medium text-sm leading-snug line-clamp-2 mb-3">{tagline}</p>
            <span className="inline-flex items-center text-primary text-xs font-bold uppercase tracking-[0.2em] group-hover:gap-2 gap-1.5 transition-all duration-300">
              {ctaLabel}
              <svg
                className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
