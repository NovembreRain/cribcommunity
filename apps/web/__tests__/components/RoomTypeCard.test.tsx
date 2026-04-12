import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RoomTypeCard } from '@/components/property/RoomTypeCard'

// Stub framer-motion to avoid jsdom animation issues — not needed in this component
// but AmenityBadge uses LucideIcon which needs lucide-react (available in node_modules)

const BASE_ROOM = {
  id: 'rt-001',
  name: '6-Bed Mixed Dorm',
  capacity: 6,
  price_per_night: 799,
  amenities: [
    { name: 'WiFi', icon: 'wifi' },
    { name: 'Hot Shower', icon: 'shower-head' },
    { name: 'Locker', icon: 'lock' },
    { name: 'Shared Kitchen', icon: 'utensils' },
    { name: 'Laundry', icon: 'shirt' },
    { name: 'Common Room', icon: 'sofa' },
  ],
}

describe('RoomTypeCard', () => {
  it('renders room name, capacity, and formatted price', () => {
    render(<RoomTypeCard roomType={BASE_ROOM} onSelectRoom={vi.fn()} />)
    expect(screen.getByText('6-Bed Mixed Dorm')).toBeDefined()
    expect(screen.getByText(/6 guests/)).toBeDefined()
    // Price should appear (₹799 formatted)
    expect(screen.getByText(/799/)).toBeDefined()
  })

  it('renders all 6 amenity pills when count is exactly 6', () => {
    render(<RoomTypeCard roomType={BASE_ROOM} onSelectRoom={vi.fn()} />)
    expect(screen.getByText('WiFi')).toBeDefined()
    expect(screen.getByText('Hot Shower')).toBeDefined()
    expect(screen.getByText('Common Room')).toBeDefined()
    expect(screen.queryByText(/\+ \d+ more/)).toBeNull()
  })

  it('shows "+N more" badge when amenities exceed 6', () => {
    const room = {
      ...BASE_ROOM,
      amenities: [
        ...BASE_ROOM.amenities,
        { name: 'Breakfast', icon: 'coffee' },
        { name: 'Bar', icon: 'beer' },
      ],
    }
    render(<RoomTypeCard roomType={room} onSelectRoom={vi.fn()} />)
    // First 6 visible, 2 hidden → "+2 more"
    expect(screen.getByText('+2 more')).toBeDefined()
  })

  it('calls onSelectRoom with correct roomTypeId when CTA is clicked', () => {
    const onSelect = vi.fn()
    render(<RoomTypeCard roomType={BASE_ROOM} onSelectRoom={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: /Check Availability/i }))
    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith('rt-001')
  })

  it('shows "Selected" label when isSelected is true', () => {
    render(<RoomTypeCard roomType={BASE_ROOM} isSelected onSelectRoom={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Selected/i })).toBeDefined()
  })

  it('renders without crashing for unknown icon names in amenities', () => {
    const room = {
      ...BASE_ROOM,
      amenities: [{ name: 'Unknown Thing', icon: 'not-a-real-icon-xyz' }],
    }
    expect(() => render(<RoomTypeCard roomType={room} onSelectRoom={vi.fn()} />)).not.toThrow()
    expect(screen.getByText('Unknown Thing')).toBeDefined()
  })
})
