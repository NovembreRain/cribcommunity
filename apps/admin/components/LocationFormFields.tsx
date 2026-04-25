'use client'

import { useState } from 'react'
import { INDIA_STATES_CITIES, STATES } from '@/lib/india-locations'
import { ImageUploader } from './ImageUploader'

const base =
  'w-full bg-surface-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors'

interface Props {
  defaults?: {
    name?: string | null
    city?: string | null
    state?: string | null
    description?: string | null
    manager_name?: string | null
    contact_phone?: string | null
    contact_email?: string | null
    images?: string[]
  }
}

export function LocationFormFields({ defaults = {} }: Props) {
  const [selectedState, setSelectedState] = useState(defaults.state ?? '')
  const cities = selectedState ? (INDIA_STATES_CITIES[selectedState] ?? []) : []

  return (
    <>
      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Name *</label>
        <input name="name" placeholder="Crib Goa" defaultValue={defaults.name ?? ''} className={base} required />
      </div>

      {/* State + City */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">State *</label>
          <select
            name="state"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className={base}
            required
          >
            <option value="">Select state…</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">City *</label>
          <select name="city" defaultValue={defaults.city ?? ''} className={base} required>
            <option value="">Select city…</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            {defaults.city && !cities.includes(defaults.city) && (
              <option value={defaults.city}>{defaults.city}</option>
            )}
          </select>
        </div>
      </div>

      {/* Country (always India, hidden) */}
      <input type="hidden" name="country" value="India" />

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Description</label>
        <textarea name="description" placeholder="Describe this location…" defaultValue={defaults.description ?? ''} rows={4} className={base} />
      </div>

      {/* Images */}
      <div className="space-y-1.5">
        <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">
          Location Images <span className="text-text-low/50 normal-case tracking-normal">(up to 10 — first is cover)</span>
        </label>
        <ImageUploader name="images" defaultValue={defaults.images ?? []} max={10} folder="locations" />
      </div>

      {/* Manager info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Manager Name</label>
          <input name="manager_name" placeholder="John Doe" defaultValue={defaults.manager_name ?? ''} className={base} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Contact Phone</label>
          <input name="contact_phone" placeholder="+91 98765 43210" defaultValue={defaults.contact_phone ?? ''} className={base} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Contact Email</label>
        <input name="contact_email" placeholder="goa@cribcommunity.in" defaultValue={defaults.contact_email ?? ''} className={base} />
      </div>
    </>
  )
}
