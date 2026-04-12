'use client'

import { useState } from 'react'
import { z } from 'zod'
import { formatCurrency } from '@crib/lib'
import { cn } from '@/lib/utils'

interface SelectedRange {
  checkIn: string   // YYYY-MM-DD
  checkOut: string  // YYYY-MM-DD
  nights: number
  totalAmount: number
}

interface BookingFormProps {
  propertyId: string
  roomTypeId: string
  roomTypeName: string
  pricePerNight: number
  selectedRange: SelectedRange | null
  onSuccess: (bookingId: string) => void
}

const guestSchema = z.object({
  guest_name: z.string().min(2, 'Name must be at least 2 characters'),
  guest_email: z.string().email('Enter a valid email address'),
  guest_phone: z.string().optional(),
})

type GuestFields = z.infer<typeof guestSchema>
type FieldErrors = Partial<Record<keyof GuestFields, string>>

export function BookingForm({
  propertyId,
  roomTypeId,
  roomTypeName,
  pricePerNight,
  selectedRange,
  onSuccess,
}: BookingFormProps) {
  const [fields, setFields] = useState<GuestFields>({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name as keyof GuestFields]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRange) return

    // Client-side validation
    const parsed = guestSchema.safeParse(fields)
    if (!parsed.success) {
      const errs: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof GuestFields
        if (!errs[key]) errs[key] = issue.message
      }
      setFieldErrors(errs)
      return
    }

    setSubmitting(true)
    setApiError(null)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId,
          room_type_id: roomTypeId,
          guest_name: parsed.data.guest_name,
          guest_email: parsed.data.guest_email,
          guest_phone: parsed.data.guest_phone || undefined,
          check_in_date: selectedRange.checkIn,
          check_out_date: selectedRange.checkOut,
        }),
      })

      const body = (await res.json()) as {
        data?: { booking_id: string }
        error?: string
      }

      if (!res.ok) {
        setApiError(body.error ?? 'Booking failed. Please try again.')
        return
      }

      onSuccess(body.data!.booking_id)
    } catch {
      setApiError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!selectedRange) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center">
        <p className="text-text-low text-sm">Select your dates above to continue booking.</p>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="glass-panel rounded-2xl p-6 space-y-5">
      <h3 className="font-display text-lg text-text-high">Guest Details</h3>

      {/* Booking summary */}
      <div className="bg-white/5 rounded-xl p-4 space-y-1 text-sm">
        <p className="text-text-medium font-medium">{roomTypeName}</p>
        <p className="text-text-low">
          {selectedRange.checkIn} → {selectedRange.checkOut}
          <span className="ml-2 text-text-medium">
            {selectedRange.nights} {selectedRange.nights === 1 ? 'night' : 'nights'}
          </span>
        </p>
        <p className="text-text-high font-bold pt-1">
          Total: {formatCurrency(selectedRange.totalAmount, 'INR', 'en-IN')}
          <span className="text-text-low font-normal ml-1 text-xs">
            ({formatCurrency(pricePerNight, 'INR', 'en-IN')} × {selectedRange.nights})
          </span>
        </p>
      </div>

      {/* Guest name */}
      <div className="space-y-1">
        <label htmlFor="guest_name" className="block text-xs uppercase tracking-[0.15em] text-text-low font-medium">
          Full Name
        </label>
        <input
          id="guest_name"
          name="guest_name"
          type="text"
          value={fields.guest_name}
          onChange={handleChange}
          placeholder="Ada Lovelace"
          className={cn(
            'w-full bg-white/5 border rounded-xl px-4 py-3 text-text-high placeholder:text-text-low text-sm outline-none transition-colors',
            'focus:border-primary/60 focus:ring-1 focus:ring-primary/30',
            fieldErrors.guest_name ? 'border-red-500/60' : 'border-gold-border/30',
          )}
        />
        {fieldErrors.guest_name && (
          <p className="text-red-400 text-xs">{fieldErrors.guest_name}</p>
        )}
      </div>

      {/* Guest email */}
      <div className="space-y-1">
        <label htmlFor="guest_email" className="block text-xs uppercase tracking-[0.15em] text-text-low font-medium">
          Email
        </label>
        <input
          id="guest_email"
          name="guest_email"
          type="email"
          value={fields.guest_email}
          onChange={handleChange}
          placeholder="ada@example.com"
          className={cn(
            'w-full bg-white/5 border rounded-xl px-4 py-3 text-text-high placeholder:text-text-low text-sm outline-none transition-colors',
            'focus:border-primary/60 focus:ring-1 focus:ring-primary/30',
            fieldErrors.guest_email ? 'border-red-500/60' : 'border-gold-border/30',
          )}
        />
        {fieldErrors.guest_email && (
          <p className="text-red-400 text-xs">{fieldErrors.guest_email}</p>
        )}
      </div>

      {/* Guest phone (optional) */}
      <div className="space-y-1">
        <label htmlFor="guest_phone" className="block text-xs uppercase tracking-[0.15em] text-text-low font-medium">
          Phone <span className="normal-case tracking-normal text-text-low/60">(optional)</span>
        </label>
        <input
          id="guest_phone"
          name="guest_phone"
          type="tel"
          value={fields.guest_phone}
          onChange={handleChange}
          placeholder="+91 98765 43210"
          className="w-full bg-white/5 border border-gold-border/30 rounded-xl px-4 py-3 text-text-high placeholder:text-text-low text-sm outline-none transition-colors focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
        />
      </div>

      {/* API error */}
      {apiError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={cn(
          'btn-primary w-full',
          submitting && 'opacity-60 cursor-not-allowed hover:shadow-glow',
        )}
      >
        {submitting ? 'Confirming...' : 'Confirm Booking'}
      </button>
    </form>
  )
}
