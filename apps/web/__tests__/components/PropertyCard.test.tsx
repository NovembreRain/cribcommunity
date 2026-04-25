import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PropertyCard } from '@/components/location/PropertyCard'

const BASE_PROPS = {
  slug: 'the-dune-house',
  image: null,
  locationName: 'Crib Goa',
  title: 'The Dune House',
  rating: null,
  priceFrom: 799,
  currency: 'INR',
  description: 'A soulful hideaway tucked behind Anjuna beach.',
  amenities: [
    { name: 'WiFi', icon: 'wifi' },
    { name: 'Hot Shower', icon: 'shower-head' },
  ],
  index: 0,
}

describe('PropertyCard', () => {
  it('renders property title', () => {
    render(<PropertyCard {...BASE_PROPS} />)
    expect(screen.getByText('The Dune House')).toBeDefined()
  })

  it('renders location name as eyebrow', () => {
    render(<PropertyCard {...BASE_PROPS} />)
    expect(screen.getByText('Crib Goa')).toBeDefined()
  })

  it('renders starting price', () => {
    render(<PropertyCard {...BASE_PROPS} />)
    // Price should contain 799 somewhere
    expect(screen.getByText(/799/)).toBeDefined()
  })

  it('shows "New" badge when rating is null', () => {
    render(<PropertyCard {...BASE_PROPS} rating={null} />)
    expect(screen.getByText('New')).toBeDefined()
  })

  it('does not show "New" badge when rating is provided', () => {
    render(<PropertyCard {...BASE_PROPS} rating={4.5} />)
    expect(screen.queryByText('New')).toBeNull()
    expect(screen.getByText('4.5')).toBeDefined()
  })

  it('renders amenity badges', () => {
    render(<PropertyCard {...BASE_PROPS} />)
    expect(screen.getByText('WiFi')).toBeDefined()
    expect(screen.getByText('Hot Shower')).toBeDefined()
  })

  it('truncates description over 90 characters', () => {
    const longDesc =
      'A soulful hideaway tucked behind Anjuna beach with hammocks nightly bonfires and more things beyond that.'
    render(<PropertyCard {...BASE_PROPS} description={longDesc} />)
    const text = screen.getByText(/A soulful hideaway/)
    expect(text.textContent?.length).toBeLessThanOrEqual(93) // 90 + ellipsis
  })

  it('renders a link to /properties/[slug]', () => {
    render(<PropertyCard {...BASE_PROPS} />)
    const link = screen.getByRole('link')
    expect((link as HTMLAnchorElement).href).toContain('/properties/the-dune-house')
  })

  it('renders without crashing when amenities is empty', () => {
    expect(() =>
      render(<PropertyCard {...BASE_PROPS} amenities={[]} />),
    ).not.toThrow()
  })
})
