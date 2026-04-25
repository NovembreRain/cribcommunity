'use client'

import { useState, useRef } from 'react'
import { Upload, X, GripVertical, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface Props {
  name: string           // hidden input name, value = JSON array of URLs (or plain string if singleUrl)
  defaultValue?: string[] // existing image URLs
  max?: number
  folder?: string
  onChange?: (urls: string[]) => void  // optional callback for parent state
  singleUrl?: boolean   // if true, outputs a plain URL string instead of JSON array
}

export function ImageUploader({ name, defaultValue = [], max = 10, folder = 'uploads', onChange, singleUrl }: Props) {
  const [images, setImages] = useState<string[]>(defaultValue)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    const remaining = max - images.length
    if (remaining <= 0) return
    const toUpload = Array.from(files).slice(0, remaining)
    setUploading(true)
    setError(null)

    const newUrls: string[] = []
    for (const file of toUpload) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const json = await res.json()
        if (json.url) newUrls.push(json.url)
        else setError('Upload failed: ' + (json.error ?? 'unknown'))
      } catch {
        setError('Upload failed — check connection')
      }
    }

    setImages((prev) => {
      const updated = [...prev, ...newUrls]
      onChange?.(updated)
      return updated
    })
    setUploading(false)
  }

  function remove(url: string) {
    setImages((prev) => {
      const updated = prev.filter((u) => u !== url)
      onChange?.(updated)
      return updated
    })
  }

  return (
    <div className="space-y-3">
      {/* Hidden input carries the value to the form */}
      <input type="hidden" name={name} value={singleUrl ? (images[0] ?? '') : JSON.stringify(images)} />

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={url} className="relative group aspect-video rounded-xl overflow-hidden border border-gold-border/20">
              <Image src={url} alt={`Image ${i + 1}`} fill sizes="160px" className="object-cover" />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute top-1 right-1 bg-background-dark/80 hover:bg-red-500/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-primary/80 text-white text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {images.length < max && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
          className="border-2 border-dashed border-gold-border/30 hover:border-primary/40 rounded-xl p-6 text-center cursor-pointer transition-colors group"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-text-low">
              <Loader2 size={18} className="animate-spin text-primary" />
              <span className="text-sm">Uploading…</span>
            </div>
          ) : (
            <>
              <Upload size={20} className="mx-auto text-text-low group-hover:text-primary mb-2 transition-colors" />
              <p className="text-text-medium text-sm">Click or drag images here</p>
              <p className="text-text-low text-xs mt-1">
                {images.length}/{max} images · JPEG, PNG, WebP · max 10MB each
              </p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
