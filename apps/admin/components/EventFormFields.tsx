'use client'

import { useState } from 'react'

interface Location { id: string; name: string; properties: { id: string; name: string }[] }

const base = 'w-full bg-surface-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors'

const EVENT_TYPES = ['social', 'workshop', 'music', 'wellness', 'adventure', 'cultural']

export function EventFormFields({
  locations,
  defaults = {},
}: {
  locations: Location[]
  defaults?: { location_id?: string; property_id?: string; type?: string }
}) {
  const [locationId, setLocationId] = useState(defaults.location_id ?? '')

  const properties = locations.find((l) => l.id === locationId)?.properties ?? []

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Location *</label>
          <select
            name="location_id"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className={base}
            required
          >
            <option value="">Select location…</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Property (optional)</label>
          <select name="property_id" defaultValue={defaults.property_id ?? ''} className={base}>
            <option value="">No specific property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Type *</label>
        <select name="type" defaultValue={defaults.type ?? ''} className={base} required>
          <option value="">Select type…</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>
    </>
  )
}
