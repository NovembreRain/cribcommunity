'use client'

import { formatCurrency } from '@crib/lib'
import { AmenityBadge } from '@/components/location/AmenityBadge'
import { cn } from '@/lib/utils'

interface RoomTypeCardProps {
  roomType: {
    id: string
    name: string
    capacity: number
    price_per_night: number
    amenities: Array<{ name: string; icon: string }>
  }
  isSelected?: boolean
  onSelectRoom: (roomTypeId: string) => void
}

const MAX_VISIBLE_AMENITIES = 6

export function RoomTypeCard({ roomType, isSelected = false, onSelectRoom }: RoomTypeCardProps) {
  const visible = roomType.amenities.slice(0, MAX_VISIBLE_AMENITIES)
  const overflow = roomType.amenities.length - MAX_VISIBLE_AMENITIES

  return (
    <div
      className={cn(
        'glass-panel rounded-2xl p-6 transition-all duration-300',
        isSelected && 'border-primary/60 shadow-glow',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-display text-lg text-text-high leading-tight">{roomType.name}</h3>
          <p className="text-text-low text-xs mt-1 uppercase tracking-widest">
            Up to {roomType.capacity} {roomType.capacity === 1 ? 'guest' : 'guests'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-text-high font-bold text-lg">
            {formatCurrency(roomType.price_per_night, 'INR', 'en-IN')}
          </p>
          <p className="text-text-low text-xs">per night</p>
        </div>
      </div>

      {/* Amenity pills */}
      {roomType.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
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

      {/* CTA */}
      <button
        onClick={() => onSelectRoom(roomType.id)}
        className={cn(
          'w-full rounded-full py-3 text-sm font-bold uppercase tracking-wide transition-all duration-300',
          isSelected
            ? 'btn-primary'
            : 'btn-secondary hover:bg-white/5',
        )}
      >
        {isSelected ? 'Selected — Check Availability' : 'Check Availability'}
      </button>
    </div>
  )
}
