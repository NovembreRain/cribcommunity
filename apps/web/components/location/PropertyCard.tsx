'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { formatCurrency, truncate } from '@crib/lib'
import { AmenityBadge } from './AmenityBadge'

const EASE = [0.25, 0.1, 0.25, 1] as const

interface PropertyCardProps {
  slug: string
  image: string | null
  locationName: string
  title: string
  rating: number | null
  priceFrom: number
  currency?: string
  description: string | null
  amenities: Array<{ name: string; icon: string }>
  index: number
}

export function PropertyCard({
  slug,
  image,
  locationName,
  title,
  rating,
  priceFrom,
  currency = 'INR',
  description,
  amenities,
  index,
}: PropertyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: EASE, delay: index * 0.08 }}
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <Link href={`/properties/${slug}`} className="block">
        <div className="glass-panel rounded-2xl overflow-hidden">
          {/* Image area */}
          <div className="relative h-48 bg-gradient-to-br from-surface-dark to-background-dark">
            {image && (
              <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark/70 via-transparent to-transparent" />

            {/* Rating / New badge */}
            <div className="absolute top-3 right-3">
              {rating !== null ? (
                <span className="inline-flex items-center gap-1 glass-panel rounded-full px-2.5 py-1 text-xs font-bold text-text-high">
                  <svg className="w-3 h-3 text-primary fill-primary" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {rating.toFixed(1)}
                </span>
              ) : (
                <span className="glass-panel rounded-full px-2.5 py-1 text-xs font-bold text-primary border-primary/30">
                  New
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">
              {locationName}
            </p>
            <p className="font-display text-lg text-text-high mb-2 leading-tight">{title}</p>

            {description && (
              <p className="text-text-medium text-sm leading-snug mb-4">
                {truncate(description, 90)}
              </p>
            )}

            {/* Amenity pills */}
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {amenities.slice(0, 4).map((a) => (
                  <AmenityBadge key={a.name} name={a.name} icon={a.icon} />
                ))}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between pt-3 border-t border-gold-border/20">
              <div>
                <span className="text-xs text-text-low uppercase tracking-widest">From</span>
                <p className="text-text-high font-bold">
                  {formatCurrency(priceFrom, currency, 'en-IN')}
                  <span className="text-text-low font-normal text-xs"> / night</span>
                </p>
              </div>
              <span className="text-primary text-xs font-bold uppercase tracking-[0.15em] group-hover:underline">
                View →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
