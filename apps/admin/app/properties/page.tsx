import { type Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@crib/db'
import { Plus, Pencil } from 'lucide-react'
import { DeleteButton } from '@/components/DeleteButton'
import { deleteProperty } from './actions'

export const metadata: Metadata = { title: 'Properties' }
export const dynamic = 'force-dynamic'

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      location: { select: { name: true } },
      _count: { select: { room_types: true } },
    },
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-text-high mb-1">Properties</h1>
          <p className="text-text-low text-sm">{properties.length} propert{properties.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <Link
          href="/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Add Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-surface-dark rounded-2xl p-12 text-center border border-gold-border/20">
          <p className="text-text-low text-sm mb-4">No properties yet.</p>
          <Link href="/properties/new" className="text-primary text-sm hover:underline">
            Add your first property →
          </Link>
        </div>
      ) : (
        <div className="bg-surface-dark rounded-2xl border border-gold-border/20 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-border/20">
                {['Name', 'Location', 'Slug', 'Room Types', 'Check-in', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-text-low text-xs uppercase tracking-[0.1em] font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-border/10">
              {properties.map((p) => (
                <tr key={p.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-text-high font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-text-medium">{p.location.name}</td>
                  <td className="px-4 py-3 text-text-low font-mono text-xs">{p.slug}</td>
                  <td className="px-4 py-3 text-text-low">{p._count.room_types}</td>
                  <td className="px-4 py-3 text-text-low">{p.check_in_time ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/properties/${p.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-medium hover:bg-white/5 border border-gold-border/20 transition-colors"
                      >
                        <Pencil size={12} />
                        Edit
                      </Link>
                      <DeleteButton
                        label="Property"
                        action={async () => {
                          'use server'
                          await deleteProperty(p.id)
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
