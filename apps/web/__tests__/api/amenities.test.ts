// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '@crib/db'
import { GET, POST } from '@/app/api/amenities/route'

// Track amenities created during POST tests so we can clean them up
const createdAmenityIds: string[] = []

function makePostRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/amenities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

afterEach(async () => {
  if (createdAmenityIds.length > 0) {
    await prisma.amenity.deleteMany({ where: { id: { in: [...createdAmenityIds] } } })
    createdAmenityIds.length = 0
  }
})

describe('GET /api/amenities', () => {
  it('should return popular amenities before non-popular in data.all', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()

    const { all, popular } = body.data
    expect(Array.isArray(all)).toBe(true)
    expect(Array.isArray(popular)).toBe(true)

    // Every item in popular must have is_popular = true
    for (const a of popular) {
      expect(a.is_popular).toBe(true)
    }

    // In data.all, popular items must all appear before non-popular items
    let seenNonPopular = false
    for (const a of all) {
      if (!a.is_popular) {
        seenNonPopular = true
      }
      if (seenNonPopular && a.is_popular) {
        throw new Error(`Popular amenity "${a.name}" appeared after non-popular amenities in data.all`)
      }
    }
  })

  it('should return all amenities in data.all and popular subset in data.popular', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()

    const { all, popular } = body.data

    // data.all must contain every item that data.popular contains
    const allIds = new Set(all.map((a: { id: string }) => a.id))
    for (const p of popular) {
      expect(allIds.has(p.id)).toBe(true)
    }

    // Each amenity has required fields
    for (const a of all) {
      expect(a).toHaveProperty('id')
      expect(a).toHaveProperty('name')
      expect(a).toHaveProperty('icon')
      expect(a).toHaveProperty('category')
      expect(a).toHaveProperty('is_popular')
    }
  })
})

describe('POST /api/amenities', () => {
  it('should create a custom amenity with valid input', async () => {
    const req = makePostRequest({
      name: 'Test Pool',
      icon: 'waves',
      category: 'recreation',
      is_popular: false,
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data).toMatchObject({
      name: 'Test Pool',
      icon: 'waves',
      category: 'recreation',
      is_popular: false,
    })
    expect(body.data.id).toBeDefined()
    createdAmenityIds.push(body.data.id as string)
  })

  it('should return 400 when amenity name is empty', async () => {
    const req = makePostRequest({
      name: '',
      icon: 'wifi',
      category: 'connectivity',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Validation failed')
  })

  it('should return 400 when icon is not a valid Lucide icon name', async () => {
    const req = makePostRequest({
      name: 'Bad Icon',
      icon: 'WIFI Icon!',   // uppercase + space + special char — all invalid
      category: 'connectivity',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Validation failed')
    // Verify the icon field is what failed
    expect(body.details.fieldErrors.icon).toBeDefined()
  })
})
