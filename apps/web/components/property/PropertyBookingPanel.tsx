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

  // Booking confirmed
  if (confirmedBookingId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="glass-panel rounded-2xl p-8 text-center space-y-4"
      >
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <LucideIcon name="check" size={28} className="text-emerald-400" />
        </div>
        <h3 className="font-display text-2xl text-text-high">You&apos;re booked!</h3>
        <p className="text-text-medium text-sm">
          Booking reference:{' '}
          <span className="font-mono text-primary text-xs break-all">{confirmedBookingId}</span>
        </p>
        {selectedRange && selectedRoom && (
          <div className="bg-white/5 rounded-xl p-4 text-sm text-left space-y-1">
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
          className="btn-secondary text-sm px-6 py-2.5 mt-2"
        >
          Book Another Room
        </button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Room type selection */}
      <div>
        <h2 className="font-display text-3xl md:text-4xl text-text-high mb-2">Choose a Room</h2>
        <p className="text-text-medium text-sm mb-6">
          {roomTypes.length} {roomTypes.length === 1 ? 'room type' : 'room types'} available
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Calendar + booking form — only shown after room selection */}
      <AnimatePresence mode="wait">
        {selectedRoom && (
          <motion.div
            key={selectedRoom.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div>
              <h3 className="font-display text-xl text-text-high mb-4">
                Availability — {selectedRoom.name}
              </h3>
              <AvailabilityCalendar
                roomTypeId={selectedRoom.id}
                pricePerNight={selectedRoom.price_per_night}
                onRangeSelect={handleRangeSelect}
              />
            </div>
            <div>
              <h3 className="font-display text-xl text-text-high mb-4">Complete Your Booking</h3>
              <BookingForm
                propertyId={propertyId}
                roomTypeId={selectedRoom.id}
                roomTypeName={selectedRoom.name}
                pricePerNight={selectedRoom.price_per_night}
                selectedRange={selectedRange}
                onSuccess={setConfirmedBookingId}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
