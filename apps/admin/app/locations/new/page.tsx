import { type Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createLocation } from '../actions'
import { LocationFormFields } from '@/components/LocationFormFields'

export const metadata: Metadata = { title: 'New Location' }

export default function NewLocationPage() {
  return (
    <div className="p-8 max-w-2xl space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-text-low">
        <Link href="/locations" className="hover:text-text-medium transition-colors">Locations</Link>
        <ChevronRight size={12} />
        <span className="text-text-medium">New</span>
      </nav>

      <div>
        <h1 className="font-display text-3xl text-text-high mb-1">Add Location</h1>
        <p className="text-text-low text-sm">Create a new Crib Community location.</p>
      </div>

      <form action={createLocation} className="space-y-5">
        <LocationFormFields />
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Create Location
          </button>
          <Link href="/locations" className="px-5 py-2.5 rounded-xl text-sm text-text-low hover:bg-white/5 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
