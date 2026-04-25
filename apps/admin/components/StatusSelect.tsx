'use client'

interface StatusSelectProps {
  name: string
  defaultValue: string
  options: string[]
  className?: string
}

export function StatusSelect({ name, defaultValue, options, className }: StatusSelectProps) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      onChange={(e) => {
        const form = e.currentTarget.closest('form') as HTMLFormElement
        form?.requestSubmit()
      }}
      className={
        className ??
        'bg-surface-dark border border-gold-border/20 rounded-lg px-2 py-1 text-xs text-text-medium focus:outline-none focus:border-primary/40'
      }
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt.replace(/_/g, ' ')}
        </option>
      ))}
    </select>
  )
}
