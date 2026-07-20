'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const EASE = [0.25, 0.1, 0.25, 1] as const

interface LocationGalleryProps {
  images: string[]
  locationName: string
}

export function LocationGallery({ images, locationName }: LocationGalleryProps) {
  if (images.length === 0) return null

  const featured = images[0]!
  const secondary = images.slice(1, 3)
  const mobileImages = images.slice(0, 4)

  return (
    <div className="space-y-4">
      {/* Desktop: featured wide + two smaller — mirrors the homepage journal grid */}
      <div className="hidden lg:grid lg:grid-cols-[2fr_1fr_1fr] gap-4 h-[380px]">
        <GalleryTile src={featured} alt={`${locationName} — photo 1`} index={0} />
        {secondary.map((src, i) => (
          <GalleryTile key={src} src={src} alt={`${locationName} — photo ${i + 2}`} index={i + 1} />
        ))}
      </div>

      {/* Mobile: 2-column grid */}
      <div className="lg:hidden grid grid-cols-2 gap-3">
        {mobileImages.map((src, i) => (
          <GalleryTile key={src} src={src} alt={`${locationName} — photo ${i + 1}`} index={i} mobileHeight />
        ))}
      </div>
    </div>
  )
}

function GalleryTile({
  src,
  alt,
  index,
  mobileHeight,
}: {
  src: string
  alt: string
  index: number
  mobileHeight?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: EASE, delay: index * 0.08 }}
      className={cn(
        'relative rounded-2xl overflow-hidden group glass-panel border border-gold-border/10',
        mobileHeight && 'h-40',
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark/30 via-transparent to-transparent" />
    </motion.div>
  )
}
