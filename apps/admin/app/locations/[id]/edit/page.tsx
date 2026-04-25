import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { prisma } from '@crib/db'
import { updateLocation } from '../../actions'
import { LocationFormFields } from '@/components/LocationFormFields'

export const metadata: Metadata = { title: 'Edit Location' }
export const dynamic = 'force-dynamic'

export default async function EditLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const location = await prisma.location.findUnique({ where: { id } })
  if (!location) notFound()

  const update = updateLocation.bind(null, id)
  const images = Array.isArray(location.images) ? (location.images as string[]) : []

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-text-low">
        <Link href="/locations" className="hover:text-text-medium transition-colors">Locations</Link>
        <ChevronRight size={12} />
        <span className="text-text-medium">{location.name}</span>
        <ChevronRight size={12} />
        <span className="text-text-medium">Edit</span>
      </nav>

      <div>
        <h1 className="font-display text-3xl text-text-high mb-1">Edit Location</h1>
        <p className="text-text-low font-mono text-xs">{location.slug}</p>
      </div>

      <form action={update} className="space-y-5">
        <LocationFormFields defaults={{ ...location, images }} />
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Save Changes
          </button>
          <Link href="/locations" className="px-5 py-2.5 rounded-xl text-sm text-text-low hover:bg-white/5 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
