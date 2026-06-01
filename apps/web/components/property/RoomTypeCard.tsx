'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { formatCurrency } from '@crib/lib'
import { AmenityBadge } from '@/components/location/AmenityBadge'
import { LucideIcon } from '@/components/location/LucideIcon'
import { cn } from '@/lib/utils'

interface RoomTypeCardProps {
  roomType: {
    id: string
    name: string
    description?: string | null
    capacity: number
    price_per_night: number
    images: string[]
    amenities: Array<{ name: string; icon: string }>
  }
  isSelected?: boolean
  onSelectRoom: (roomTypeId: string) => void
}

const MAX_VISIBLE_AMENITIES = 8

export function RoomTypeCard({ roomType, isSelected = false, onSelectRoom }: RoomTypeCardProps) {
  const images = roomType.images ?? []
  const [imgIdx, setImgIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  // Auto-advance crossfade slideshow
  useEffect(() => {
    if (images.length <= 1 || paused) return
    const id = setInterval(() => {
      setImgIdx((i) => (i + 1) % images.length)
    }, 4000)
    return () => clearInterval(id)
  }, [images.length, paused])

  const visible = roomType.amenities.slice(0, MAX_VISIBLE_AMENITIES)
  const overflow = roomType.amenities.length - MAX_VISIBLE_AMENITIES

  return (
    <div
      className={cn(
        'glass-panel rounded-2xl overflow-hidden transition-all duration-300',
        isSelected && 'border-primary/60 shadow-glow',
      )}
    >
      {/* Image gallery */}
      <div
        className="relative aspect-[16/9] bg-surface-dark overflow-hidden group"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {images.length > 0 ? (
          <>
            {images.map((url, i) => (
              <Image
                key={url}
                src={url}
                alt={`${roomType.name} — photo ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className={cn(
                  'object-cover transition-opacity duration-1000',
                  i === imgIdx ? 'opacity-100' : 'opacity-0',
                )}
              />
            ))}

            {/* Bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background-dark/70 to-transparent pointer-events-none" />

            {/* Arrows — visible on hover */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setImgIdx((i) => (i - 1 + images.length) % images.length)
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background-dark/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background-dark/90"
                  aria-label="Previous image"
                >
                  <LucideIcon name="chevron-left" size={16} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setImgIdx((i) => (i + 1) % images.length)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background-dark/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background-dark/90"
                  aria-label="Next image"
                >
                  <LucideIcon name="chevron-right" size={16} />
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setImgIdx(i)
                      }}
                      className={cn(
                        'rounded-full transition-all duration-300',
                        i === imgIdx
                          ? 'w-4 h-1.5 bg-white'
                          : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70',
                      )}
                      aria-label={`View image ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Image counter */}
                <div className="absolute top-3 left-3 bg-background-dark/70 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-text-low font-medium">
                  {imgIdx + 1} / {images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-dark to-background-dark">
            <LucideIcon name="bed-double" size={48} className="text-gold-border/15" />
          </div>
        )}

        {/* Price badge — top right */}
        <div className="absolute top-3 right-3 bg-background-dark/80 backdrop-blur-sm rounded-xl px-3 py-2 text-right border border-gold-border/20">
          <p className="text-text-high font-bold text-base leading-none">
            {formatCurrency(roomType.price_per_night, 'INR', 'en-IN')}
          </p>
          <p className="text-text-low text-[10px] mt-0.5">per night</p>
        </div>

        {isSelected && (
          <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
            Selected
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl text-text-high leading-tight">{roomType.name}</h3>
            <p className="text-text-low text-xs mt-1 uppercase tracking-widest flex items-center gap-1.5">
              <LucideIcon name="users" size={11} />
              Up to {roomType.capacity} {roomType.capacity === 1 ? 'guest' : 'guests'}
            </p>
          </div>
        </div>

        {roomType.description && (
          <p className="text-text-medium text-sm leading-relaxed line-clamp-2">
            {roomType.description}
          </p>
        )}

        {visible.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visible.map((a) => (
              <AmenityBadge key={a.name} name={a.name} icon={a.icon} />
            ))}
            {overflow > 0 && (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs text-text-low glass-panel border-gold-border/20">
                +{overflow} more
              </span>
            )}
          </div>
        )}

        <button
          onClick={() => onSelectRoom(roomType.id)}
          className={cn(
            'w-full rounded-full py-3 text-sm font-bold uppercase tracking-wide transition-all duration-300',
            isSelected
              ? 'btn-primary'
              : 'btn-secondary hover:bg-white/5',
          )}
        >
          {isSelected ? '✓ Selected — View Availability' : 'Check Availability'}
        </button>
      </div>
    </div>
  )
}
