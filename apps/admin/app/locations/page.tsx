import { type Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@crib/db'
import { Plus, Pencil } from 'lucide-react'
import { DeleteButton } from '@/components/DeleteButton'
import { deleteLocation } from './actions'

export const metadata: Metadata = { title: 'Locations' }
export const dynamic = 'force-dynamic'

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; count?: string }>
}) {
  const { error, count } = await searchParams
  const locations = await prisma.location.findMany({
    orderBy: { created_at: 'desc' },
    include: { _count: { select: { properties: true } } },
  })

  return (
    <div className="p-8 space-y-6">
      {error === 'has_properties' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
          Cannot delete — this location has {count} propert{Number(count) === 1 ? 'y' : 'ies'} linked to it. Delete those properties first.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-text-high mb-1">Locations</h1>
          <p className="text-text-low text-sm">{locations.length} location{locations.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/locations/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Add Location
        </Link>
      </div>

      {locations.length === 0 ? (
        <div className="bg-surface-dark rounded-2xl p-12 text-center border border-gold-border/20">
          <p className="text-text-low text-sm mb-4">No locations yet.</p>
          <Link href="/locations/new" className="text-primary text-sm hover:underline">
            Add your first location →
          </Link>
        </div>
      ) : (
        <div className="bg-surface-dark rounded-2xl border border-gold-border/20 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-border/20">
                {['Name', 'Slug', 'City', 'Country', 'Properties', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-text-low text-xs uppercase tracking-[0.1em] font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-border/10">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-text-high font-medium">{loc.name}</td>
                  <td className="px-4 py-3 text-text-low font-mono text-xs">{loc.slug}</td>
                  <td className="px-4 py-3 text-text-medium">{loc.city}</td>
                  <td className="px-4 py-3 text-text-medium">{loc.country}</td>
                  <td className="px-4 py-3 text-text-low">{loc._count.properties}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/locations/${loc.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-medium hover:bg-white/5 border border-gold-border/20 transition-colors"
                      >
                        <Pencil size={12} />
                        Edit
                      </Link>
                      <DeleteButton
                        label="Location"
                        action={async () => {
                          'use server'
                          await deleteLocation(loc.id)
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
