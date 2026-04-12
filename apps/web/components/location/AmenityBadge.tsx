'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from './LucideIcon'

interface AmenityBadgeProps {
  name: string
  icon: string
  className?: string
}

export function AmenityBadge({ name, icon, className }: AmenityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-text-medium',
        'glass-panel border-gold-border/20',
        className,
      )}
    >
      <LucideIcon name={icon} size={12} className="shrink-0 text-primary" />
      {name}
    </span>
  )
}
