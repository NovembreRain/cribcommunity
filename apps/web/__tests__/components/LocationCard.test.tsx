import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LocationCard } from '@/components/location/LocationCard'

const BASE_PROPS = {
  id: 'loc-001',
  slug: 'goa',
  image: null,
  name: 'Crib Goa',
  city: 'Anjuna',
  country: 'India',
  tagline: 'Where the sea meets your soul.',
  index: 0,
}

describe('LocationCard', () => {
  it('renders location name', () => {
    render(<LocationCard {...BASE_PROPS} />)
    expect(screen.getByText('Crib Goa')).toBeDefined()
  })

  it('renders city and country', () => {
    render(<LocationCard {...BASE_PROPS} />)
    expect(screen.getByText(/Anjuna/)).toBeDefined()
    expect(screen.getByText(/India/)).toBeDefined()
  })

  it('renders tagline', () => {
    render(<LocationCard {...BASE_PROPS} />)
    expect(screen.getByText('Where the sea meets your soul.')).toBeDefined()
  })

  it('renders a link to /locations/[slug]', () => {
    render(<LocationCard {...BASE_PROPS} />)
    const link = screen.getByRole('link')
    expect((link as HTMLAnchorElement).href).toContain('/locations/goa')
  })

  it('renders gradient fallback when image is null', () => {
    render(<LocationCard {...BASE_PROPS} image={null} />)
    // No <img> element should be present
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('renders CTA label (defaults to "Explore")', () => {
    render(<LocationCard {...BASE_PROPS} />)
    expect(screen.getByText('Explore')).toBeDefined()
  })

  it('renders custom ctaLabel when provided', () => {
    render(<LocationCard {...BASE_PROPS} ctaLabel="Discover" />)
    expect(screen.getByText('Discover')).toBeDefined()
  })
})
