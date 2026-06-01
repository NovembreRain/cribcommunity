'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RoomTypeCard } from './RoomTypeCard'
import { AvailabilityCalendar } from './AvailabilityCalendar'
import { BookingForm } from './BookingForm'
import { formatCurrency } from '@crib/lib'
import { LucideIcon } from '@/components/location/LucideIcon'

interface RoomType {
  id: string
  name: string
  description: string | null
  capacity: number
  price_per_night: number
  images: string[]
  amenities: Array<{ name: string; icon: string }>
}

interface SelectedRange {
  checkIn: string
  checkOut: string
  nights: number
  totalAmount: number
}

interface PropertyBookingPanelProps {
  propertyId: string
  roomTypes: RoomType[]
}

const EASE = [0.25, 0.1, 0.25, 1] as const

export function PropertyBookingPanel({ propertyId, roomTypes }: PropertyBookingPanelProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [selectedRange, setSelectedRange] = useState<SelectedRange | null>(null)
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null)

  const selectedRoom = roomTypes.find((rt) => rt.id === selectedRoomId) ?? null

  function handleRoomSelect(id: string) {
    if (id === selectedRoomId) return
    setSelectedRoomId(id)
    setSelectedRange(null)
    setConfirmedBookingId(null)
  }

  function handleRangeSelect(checkIn: string, checkOut: string, totalAmount: number) {
    const nights = Math.round(
      (new Date(`${checkOut}T00:00:00.000Z`).getTime() -
        new Date(`${checkIn}T00:00:00.000Z`).getTime()) /
        86_400_000,
    )
    setSelectedRange({ checkIn, checkOut, nights, totalAmount })
    setConfirmedBookingId(null)
  }

  // ── Booking confirmed ────────────────────────────────────────────────────────
  if (confirmedBookingId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="glass-panel rounded-2xl p-10 text-center space-y-5 max-w-lg mx-auto"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <LucideIcon name="check" size={32} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="font-display text-3xl text-text-high">You&apos;re booked!</h3>
          <p className="text-text-medium text-sm mt-1">
            Confirmation sent to your email.
          </p>
        </div>
        <p className="text-text-low text-xs">
          Reference:{' '}
          <span className="font-mono text-primary break-all">{confirmedBookingId}</span>
        </p>
        {selectedRange && selectedRoom && (
          <div className="bg-white/5 rounded-xl p-4 text-sm text-left space-y-1.5">
            <p className="text-text-medium font-medium">{selectedRoom.name}</p>
            <p className="text-text-low">
              {selectedRange.checkIn} → {selectedRange.checkOut} · {selectedRange.nights}{' '}
              {selectedRange.nights === 1 ? 'night' : 'nights'}
            </p>
            <p className="text-text-high font-bold">
              {formatCurrency(selectedRange.totalAmount, 'INR', 'en-IN')}
            </p>
          </div>
        )}
        <button
          onClick={() => {
            setSelectedRoomId(null)
            setSelectedRange(null)
            setConfirmedBookingId(null)
          }}
          className="btn-secondary text-sm px-8 py-3"
        >
          Book Another Room
        </button>
      </motion.div>
    )
  }

  // ── Main layout ──────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">

      {/* LEFT — Room cards */}
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-3xl md:text-4xl text-text-high mb-1">
            Choose Your Room
          </h2>
          <p className="text-text-medium text-sm">
            {roomTypes.length} {roomTypes.length === 1 ? 'room type' : 'room types'} · select one to check availability
          </p>
        </div>

        <div className="space-y-5">
          {roomTypes.map((rt, i) => (
            <motion.div
              key={rt.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: EASE, delay: i * 0.08 }}
            >
              <RoomTypeCard
                roomType={rt}
                isSelected={rt.id === selectedRoomId}
                onSelectRoom={handleRoomSelect}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT — Sticky booking sidebar */}
      <div className="lg:sticky lg:top-28 space-y-4">
        <AnimatePresence mode="wait">
          {!selectedRoom ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="glass-panel rounded-2xl p-8 text-center space-y-4 border border-gold-border/10"
            >
              <div className="w-12 h-12 rounded-full bg-surface-dark flex items-center justify-center mx-auto border border-gold-border/20">
                <LucideIcon name="calendar-check" size={22} className="text-text-low" />
              </div>
              <div>
                <p className="text-text-medium font-medium mb-1.5">Select a room</p>
                <p className="text-text-low text-sm leading-relaxed">
                  Pick a room type on the left to check availability and secure your dates.
                </p>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-text-low/50 text-xs pt-1">
                <LucideIcon name="arrow-left" size={11} />
                <span>Choose from the options</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={selectedRoom.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="space-y-4"
            >
              {/* Selected room label */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-0.5">
                    Selected Room
                  </p>
                  <h3 className="font-display text-lg text-text-high leading-tight">
                    {selectedRoom.name}
                  </h3>
                </div>
                <button
                  onClick={() => { setSelectedRoomId(null); setSelectedRange(null) }}
                  className="text-text-low hover:text-text-medium transition-colors p-1"
                  aria-label="Clear selection"
                >
                  <LucideIcon name="x" size={16} />
                </button>
              </div>

              {/* Calendar */}
              <AvailabilityCalendar
                roomTypeId={selectedRoom.id}
                pricePerNight={selectedRoom.price_per_night}
                onRangeSelect={handleRangeSelect}
              />

              {/* Booking form — appears after dates selected */}
              <AnimatePresence>
                {selectedRange && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <BookingForm
                      propertyId={propertyId}
                      roomTypeId={selectedRoom.id}
                      roomTypeName={selectedRoom.name}
                      pricePerNight={selectedRoom.price_per_night}
                      selectedRange={selectedRange}
                      onSuccess={setConfirmedBookingId}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
