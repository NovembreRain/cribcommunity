'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatCurrency } from '@crib/lib'
import { cn } from '@/lib/utils'
import { LucideIcon } from '@/components/location/LucideIcon'

interface DateAvailability {
  date: string          // YYYY-MM-DD
  available_count: number
}

interface AvailabilityCalendarProps {
  roomTypeId: string
  pricePerNight: number
  onRangeSelect: (checkIn: string, checkOut: string, totalAmount: number) => void
}

type DateState = 'past' | 'unavailable' | 'available' | 'check-in' | 'check-out' | 'in-range'

function toYMD(d: Date): string {
  return d.toISOString().split('T')[0] as string
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setUTCDate(r.getUTCDate() + n)
  return r
}

function isoToUTC(s: string): Date {
  return new Date(`${s}T00:00:00.000Z`)
}

export function AvailabilityCalendar({
  roomTypeId,
  pricePerNight,
  onRangeSelect,
}: AvailabilityCalendarProps) {
  const todayUTC = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00.000Z')

  const [viewYear, setViewYear] = useState(todayUTC.getUTCFullYear())
  const [viewMonth, setViewMonth] = useState(todayUTC.getUTCMonth()) // 0-indexed

  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  const [availability, setAvailability] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rangeError, setRangeError] = useState<string | null>(null)

  // Fetch availability for the visible month (+1 month buffer)
  const fetchAvailability = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Fetch a 2-month window so navigation feels instant
    const windowStart = new Date(Date.UTC(viewYear, viewMonth, 1))
    const windowEnd = new Date(Date.UTC(viewYear, viewMonth + 2, 1))
    const checkInStr = toYMD(windowStart)
    const checkOutStr = toYMD(windowEnd)

    try {
      const res = await fetch(
        `/api/bookings/availability?room_type_id=${roomTypeId}&check_in=${checkInStr}&check_out=${checkOutStr}`,
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError((body as { error?: string }).error ?? 'Failed to load availability.')
        return
      }
      const body = (await res.json()) as {
        data: { dates: DateAvailability[] }
      }
      const map: Record<string, number> = {}
      for (const d of body.data.dates) {
        map[d.date] = d.available_count
      }
      setAvailability((prev) => ({ ...prev, ...map }))
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [roomTypeId, viewYear, viewMonth])

  useEffect(() => {
    void fetchAvailability()
  }, [fetchAvailability])

  // Compute total nights + amount from selected range
  const nights =
    checkIn && checkOut
      ? Math.round(
          (isoToUTC(checkOut).getTime() - isoToUTC(checkIn).getTime()) / 86_400_000,
        )
      : 0
  const totalAmount = parseFloat((pricePerNight * nights).toFixed(2))

  // Build calendar grid for the current view month
  const firstOfMonth = new Date(Date.UTC(viewYear, viewMonth, 1))
  const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate()
  const startWeekday = firstOfMonth.getUTCDay() // 0=Sun

  function getDateState(dateStr: string): DateState {
    const d = isoToUTC(dateStr)
    if (d < todayUTC) return 'past'
    if (dateStr === checkIn) return 'check-in'
    if (dateStr === checkOut) return 'check-out'
    if (checkIn && checkOut && dateStr > checkIn && dateStr < checkOut) return 'in-range'
    if (checkIn && !checkOut && hovered && dateStr > checkIn && dateStr <= hovered)
      return 'in-range'
    const count = availability[dateStr]
    if (count === 0) return 'unavailable'
    return 'available'
  }

  function handleDayClick(dateStr: string) {
    const state = getDateState(dateStr)
    if (state === 'past' || state === 'unavailable') return

    if (!checkIn || (checkIn && checkOut)) {
      // Start new selection
      setCheckIn(dateStr)
      setCheckOut(null)
      setRangeError(null)
      return
    }

    // Second click — set check-out
    if (dateStr <= checkIn) {
      setCheckIn(dateStr)
      setCheckOut(null)
      return
    }

    // Validate: no unavailable date in range
    const nights = Math.round(
      (isoToUTC(dateStr).getTime() - isoToUTC(checkIn).getTime()) / 86_400_000,
    )
    let rangeOk = true
    for (let i = 0; i < nights; i++) {
      const d = toYMD(addDays(isoToUTC(checkIn), i))
      if (availability[d] === 0) {
        rangeOk = false
        break
      }
    }

    if (!rangeOk) {
      setRangeError('Your selected range includes unavailable dates. Please adjust.')
      setCheckOut(null)
      return
    }

    setCheckOut(dateStr)
    setRangeError(null)
    onRangeSelect(checkIn, dateStr, parseFloat((pricePerNight * nights).toFixed(2)))
  }

  const monthName = new Date(Date.UTC(viewYear, viewMonth, 1)).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(Date.UTC(viewYear, viewMonth, i + 1))
    return toYMD(d)
  })

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-text-medium"
          aria-label="Previous month"
        >
          <LucideIcon name="chevron-left" size={16} />
        </button>
        <p className="font-display text-text-high text-base">{monthName}</p>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-text-medium"
          aria-label="Next month"
        >
          <LucideIcon name="chevron-right" size={16} />
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-text-low">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          Unavailable
        </span>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-xs text-text-low py-1 font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="py-6 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => void fetchAvailability()}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {/* Offset for first weekday */}
          {Array.from({ length: startWeekday }).map((_, i) => (
            <div key={`offset-${i}`} />
          ))}

          {days.map((dateStr) => {
            const state = getDateState(dateStr)
            const dayNum = parseInt(dateStr.slice(-2), 10)

            return (
              <button
                key={dateStr}
                disabled={state === 'past' || state === 'unavailable'}
                onClick={() => handleDayClick(dateStr)}
                onMouseEnter={() => { if (checkIn && !checkOut) setHovered(dateStr) }}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  'h-9 w-full rounded-lg text-sm font-medium transition-all duration-150 relative',
                  state === 'past' && 'text-white/15 cursor-default',
                  state === 'unavailable' &&
                    'text-red-400/70 bg-red-500/10 cursor-not-allowed line-through',
                  state === 'available' &&
                    'text-emerald-300 hover:bg-emerald-500/20 cursor-pointer',
                  state === 'in-range' && 'bg-primary/20 text-text-high rounded-none',
                  state === 'check-in' &&
                    'bg-primary text-white rounded-l-lg font-bold shadow-glow',
                  state === 'check-out' &&
                    'bg-primary text-white rounded-r-lg font-bold shadow-glow',
                )}
                aria-label={`${dateStr}${state === 'unavailable' ? ', unavailable' : ''}`}
              >
                {dayNum}
              </button>
            )
          })}
        </div>
      )}

      {/* Range error */}
      {rangeError && (
        <p className="text-red-400 text-xs text-center">{rangeError}</p>
      )}

      {/* Summary */}
      {checkIn && checkOut && nights > 0 && (
        <div className="border-t border-gold-border/20 pt-4 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-text-medium">
              {checkIn} → {checkOut}
            </span>
            <span className="text-text-low">{nights} {nights === 1 ? 'night' : 'nights'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-medium text-sm">Total</span>
            <span className="text-text-high font-bold">
              {formatCurrency(totalAmount, 'INR', 'en-IN')}
            </span>
          </div>
        </div>
      )}

      {/* Prompt when no selection */}
      {!checkIn && (
        <p className="text-center text-text-low text-xs pt-1">
          Select your check-in date to begin
        </p>
      )}
      {checkIn && !checkOut && (
        <p className="text-center text-primary text-xs pt-1">
          Now select your check-out date
        </p>
      )}
    </div>
  )
}
