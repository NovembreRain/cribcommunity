'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'

interface DeleteButtonProps {
  action: () => Promise<void>
  label?: string
}

export function DeleteButton({ action, label = 'Delete' }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`Are you sure you want to delete this ${label.toLowerCase()}?`)) return
    startTransition(() => action())
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors disabled:opacity-50"
    >
      <Trash2 size={12} />
      {isPending ? 'Deleting…' : label}
    </button>
  )
}
