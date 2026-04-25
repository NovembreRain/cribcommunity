'use client'

import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { ImageUploader } from './ImageUploader'

interface Amenity { id: string; name: string; icon: string; category: string; is_popular: boolean }

interface RoomDraft {
  id?: string
  name: string
  description: string
  capacity: number
  price_per_night: number
  amenity_ids: string[]
  images: string[]
}

interface Props {
  amenities: Amenity[]
  defaultRooms?: RoomDraft[]
}

const base = 'w-full bg-background-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors'

export function RoomManager({ amenities, defaultRooms = [] }: Props) {
  const [rooms, setRooms] = useState<RoomDraft[]>(defaultRooms)
  const [expanded, setExpanded] = useState<number | null>(defaultRooms.length > 0 ? 0 : null)

  function addRoom() {
    const newIndex = rooms.length
    setRooms((r) => [
      ...r,
      { name: '', description: '', capacity: 2, price_per_night: 800, amenity_ids: [], images: [] },
    ])
    setExpanded(newIndex)
  }

  function removeRoom(i: number) {
    setRooms((r) => r.filter((_, idx) => idx !== i))
    setExpanded(null)
  }

  function update<K extends keyof RoomDraft>(i: number, key: K, value: RoomDraft[K]) {
    setRooms((r) => r.map((room, idx) => idx === i ? { ...room, [key]: value } : room))
  }

  function toggleAmenity(roomIdx: number, amenityId: string) {
    setRooms((r) => r.map((room, i) => {
      if (i !== roomIdx) return room
      const has = room.amenity_ids.includes(amenityId)
      return {
        ...room,
        amenity_ids: has
          ? room.amenity_ids.filter((id) => id !== amenityId)
          : [...room.amenity_ids, amenityId],
      }
    }))
  }

  // Group amenities by category
  const byCategory = amenities.reduce<Record<string, Amenity[]>>((acc, a) => {
    if (!acc[a.category]) acc[a.category] = []
    acc[a.category]!.push(a)
    return acc
  }, {})

  return (
    <div className="space-y-3">
      <input type="hidden" name="rooms_json" value={JSON.stringify(rooms)} />

      {rooms.map((room, i) => (
        <div key={i} className="border border-gold-border/20 rounded-2xl overflow-hidden">
          {/* Room header */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setExpanded(expanded === i ? null : i)}
            onKeyDown={(e) => e.key === 'Enter' && setExpanded(expanded === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 bg-surface-dark hover:bg-white/5 transition-colors text-left cursor-pointer select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div>
                <p className="text-text-high font-medium text-sm">{room.name || 'Untitled Room'}</p>
                <p className="text-text-low text-xs">
                  {room.capacity} guests · ₹{room.price_per_night}/night
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeRoom(i) }}
                className="p-1.5 text-text-low hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
              {expanded === i ? <ChevronUp size={16} className="text-text-low" /> : <ChevronDown size={16} className="text-text-low" />}
            </div>
          </div>

          {/* Room fields */}
          {expanded === i && (
            <div className="p-5 space-y-5 bg-background-dark border-t border-gold-border/10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Room Name *</label>
                  <input value={room.name} onChange={(e) => update(i, 'name', e.target.value)} placeholder="Dormitory 6-Bed" className={base} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Capacity (guests) *</label>
                  <input type="number" min={1} max={20} value={room.capacity} onChange={(e) => update(i, 'capacity', Number(e.target.value))} className={base} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Price / Night (₹) *</label>
                  <input type="number" min={0} value={room.price_per_night} onChange={(e) => update(i, 'price_per_night', Number(e.target.value))} className={base} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Short Description</label>
                  <input value={room.description} onChange={(e) => update(i, 'description', e.target.value)} placeholder="Shared dorm with lockers and AC" className={base} />
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Amenities</label>
                {Object.entries(byCategory).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-text-low/60 text-xs uppercase tracking-[0.08em] mb-1.5">{category}</p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((a) => {
                        const active = room.amenity_ids.includes(a.id)
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => toggleAmenity(i, a.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              active
                                ? 'bg-primary/15 text-primary border-primary/30'
                                : 'bg-surface-dark text-text-low border-gold-border/20 hover:border-primary/20'
                            }`}
                          >
                            {a.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Room images */}
              <div className="space-y-1.5">
                <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Room Photos</label>
                <ImageUploader
                  name={`_room_images_${i}`}
                  defaultValue={room.images}
                  max={6}
                  folder="rooms"
                  onChange={(urls) => update(i, 'images', urls)}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addRoom}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gold-border/30 hover:border-primary/40 text-text-low hover:text-primary text-sm transition-colors w-full justify-center"
      >
        <Plus size={16} />
        Add Room Type
      </button>
    </div>
  )
}
