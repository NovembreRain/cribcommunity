'use client'

import { icons, type LucideProps } from 'lucide-react'

interface LucideIconProps extends LucideProps {
  name: string
}

function toPascalCase(kebab: string): string {
  return kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

export function LucideIcon({ name, ...props }: LucideIconProps) {
  const iconKey = toPascalCase(name) as keyof typeof icons
  const Icon = icons[iconKey] ?? icons['Circle']
  return <Icon {...props} />
}
