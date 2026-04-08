import { cn } from '@/lib/utils'

interface SectionShellProps {
  eyebrow: string
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
  containerClassName?: string
}

/**
 * Reusable section wrapper that matches the Stitch section heading pattern:
 * - Eyebrow: text-xs uppercase tracking-[0.2em] text-primary + gradient bar
 * - H2: Playfair Display
 * - Optional description
 */
export function SectionShell({
  eyebrow,
  title,
  description,
  children,
  className,
  containerClassName,
}: SectionShellProps) {
  return (
    <section className={cn('py-24 px-6', className)}>
      <div className={cn('max-w-7xl mx-auto', containerClassName)}>
        {/* Section eyebrow — exact Stitch pattern */}
        <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-4 flex items-center gap-3">
          <span className="w-8 h-[2px] bg-gradient-to-r from-primary to-transparent" />
          {eyebrow}
        </h2>

        {/* Section title */}
        <div className="mb-12">
          <p className="font-display text-4xl md:text-5xl text-text-high mb-4">
            {title}
          </p>
          {description && (
            <p className="text-text-medium font-light max-w-xl">{description}</p>
          )}
        </div>

        {children}
      </div>
    </section>
  )
}
