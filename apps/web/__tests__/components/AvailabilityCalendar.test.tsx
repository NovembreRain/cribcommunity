import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AvailabilityCalendar } from '@/components/property/AvailabilityCalendar'

const ROOM_TYPE_ID = 'rt-test-calendar'
const PRICE = 999

// Build a mock availability response covering the next 60 days from today
function makeDates(options: { unavailableDates?: string[] } = {}) {
  const { unavailableDates = [] } = options
  const dates: Array<{ date: string; available_count: number }> = []
  const start = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00.000Z')
  for (let i = 0; i < 60; i++) {
    const d = new Date(start)
    d.setUTCDate(d.getUTCDate() + i)
    const str = d.toISOString().split('T')[0] as string
    dates.push({
      date: str,
      available_count: unavailableDates.includes(str) ? 0 : 3,
    })
  }
  return dates
}

function mockFetchOk(unavailableDates: string[] = []) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: { dates: makeDates({ unavailableDates }) } }),
  })
}

function mockFetchError() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ error: 'Room not found' }),
  })
}

beforeEach(() => {
  mockFetchOk()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('AvailabilityCalendar', () => {
  it('renders current month name by default', () => {
    render(
      <AvailabilityCalendar
        roomTypeId={ROOM_TYPE_ID}
        pricePerNight={PRICE}
        onRangeSelect={vi.fn()}
      />,
    )
    const now = new Date()
    const monthName = now.toLocaleString('en-US', { month: 'long' })
    expect(screen.getByText(new RegExp(monthName))).toBeDefined()
  })

  it('renders weekday headers', () => {
    render(
      <AvailabilityCalendar
        roomTypeId={ROOM_TYPE_ID}
        pricePerNight={PRICE}
        onRangeSelect={vi.fn()}
      />,
    )
    expect(screen.getByText('Mo')).toBeDefined()
    expect(screen.getByText('Su')).toBeDefined()
  })

  it('shows loading skeleton while fetch is in flight', () => {
    // fetch never resolves
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
    render(
      <AvailabilityCalendar
        roomTypeId={ROOM_TYPE_ID}
        pricePerNight={PRICE}
        onRangeSelect={vi.fn()}
      />,
    )
    // Skeleton elements should be visible (animate-pulse divs)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows error message when API returns non-200', async () => {
    mockFetchError()
    render(
      <AvailabilityCalendar
        roomTypeId={ROOM_TYPE_ID}
        pricePerNight={PRICE}
        onRangeSelect={vi.fn()}
      />,
    )
    await waitFor(() => {
      expect(screen.getByText('Room not found')).toBeDefined()
    })
  })

  it('shows retry button on error', async () => {
    mockFetchError()
    render(
      <AvailabilityCalendar
        roomTypeId={ROOM_TYPE_ID}
        pricePerNight={PRICE}
        onRangeSelect={vi.fn()}
      />,
    )
    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeDefined()
    })
  })

  it('renders day buttons after data loads', async () => {
    mockFetchOk()
    render(
      <AvailabilityCalendar
        roomTypeId={ROOM_TYPE_ID}
        pricePerNight={PRICE}
        onRangeSelect={vi.fn()}
      />,
    )
    await waitFor(() => {
      // Day "1" should be a button
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(5) // nav + day buttons
    })
  })

  it('disables past-date buttons', async () => {
    render(
      <AvailabilityCalendar
        roomTypeId={ROOM_TYPE_ID}
        pricePerNight={PRICE}
        onRangeSelect={vi.fn()}
      />,
    )
    await waitFor(() => expect(screen.queryByText('Retry')).toBeNull())

    // Every day before today should be disabled
    const allButtons = screen.getAllByRole('button')
    const today = new Date()
    const todayDay = today.getUTCDate()
    const todayMonth = today.getUTCMonth()

    // Find button for day 1 if we're past day 1 this month
    if (todayDay > 1 && todayMonth === today.getMonth()) {
      const dayOne = allButtons.find(
        (btn) => btn.textContent === '1' && (btn as HTMLButtonElement).disabled,
      )
      expect(dayOne).toBeDefined()
    }
  })

  it('calls onRangeSelect after selecting check-in and check-out dates', async () => {
    const onRangeSelect = vi.fn()
    render(
      <AvailabilityCalendar
        roomTypeId={ROOM_TYPE_ID}
        pricePerNight={PRICE}
        onRangeSelect={onRangeSelect}
      />,
    )
    await waitFor(() => expect(screen.queryByText('Retry')).toBeNull())

    // Click two future day buttons that are enabled
    const buttons = screen
      .getAllByRole('button')
      .filter((b) => !(b as HTMLButtonElement).disabled && /^\d+$/.test(b.textContent ?? ''))
      .slice(0, 2)

    expect(buttons.length).toBeGreaterThanOrEqual(2)
    fireEvent.click(buttons[0]!)  // check-in
    fireEvent.click(buttons[1]!)  // check-out

    expect(onRangeSelect).toHaveBeenCalledOnce()
    const [ci, co, total] = onRangeSelect.mock.calls[0]!
    expect(ci).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(co).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(total).toBeTypeOf('number')
    expect(total).toBeGreaterThan(0)
  })

  it('shows range error and does not call onRangeSelect when range includes unavailable date', async () => {
    // Make the day after tomorrow unavailable
    const tomorrow = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00.000Z')
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    const dayAfter = new Date(tomorrow)
    dayAfter.setUTCDate(dayAfter.getUTCDate() + 1)
    const blockedDate = dayAfter.toISOString().split('T')[0] as string

    mockFetchOk([blockedDate])
    const onRangeSelect = vi.fn()

    render(
      <AvailabilityCalendar
        roomTypeId={ROOM_TYPE_ID}
        pricePerNight={PRICE}
        onRangeSelect={onRangeSelect}
      />,
    )
    await waitFor(() => expect(screen.queryByText('Retry')).toBeNull())

    // Find tomorrow's and 3 days from now's day buttons
    const tomorrowDay = String(tomorrow.getUTCDate())
    const threeDaysOut = new Date(tomorrow)
    threeDaysOut.setUTCDate(threeDaysOut.getUTCDate() + 2)
    const threeDaysOutDay = String(threeDaysOut.getUTCDate())

    // Click tomorrow (check-in) then 3 days out (spans the blocked date)
    const buttons = screen.getAllByRole('button')
    const ciBtn = buttons.find(
      (b) => b.textContent === tomorrowDay && !(b as HTMLButtonElement).disabled,
    )
    const coBtn = buttons.find(
      (b) => b.textContent === threeDaysOutDay && !(b as HTMLButtonElement).disabled,
    )

    if (ciBtn && coBtn) {
      fireEvent.click(ciBtn)
      fireEvent.click(coBtn)
      await waitFor(() => {
        expect(screen.getByText(/unavailable dates/i)).toBeDefined()
      })
      expect(onRangeSelect).not.toHaveBeenCalled()
    }
  })

  it('shows summary panel with nights and total after valid range selected', async () => {
    const onRangeSelect = vi.fn()
    render(
      <AvailabilityCalendar
        roomTypeId={ROOM_TYPE_ID}
        pricePerNight={PRICE}
        onRangeSelect={onRangeSelect}
      />,
    )
    await waitFor(() => expect(screen.queryByText('Retry')).toBeNull())

    const buttons = screen
      .getAllByRole('button')
      .filter((b) => !(b as HTMLButtonElement).disabled && /^\d+$/.test(b.textContent ?? ''))
      .slice(0, 3)

    if (buttons.length >= 2) {
      fireEvent.click(buttons[0]!)
      fireEvent.click(buttons[2]!) // 2 nights apart
      await waitFor(() => {
        expect(screen.getByText(/night/i)).toBeDefined()
        expect(screen.getByText(/Total/i)).toBeDefined()
      })
    }
  })
})
