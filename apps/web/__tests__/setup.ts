/**
 * Global vitest setup — runs before any test file.
 * 1. Loads @testing-library/jest-dom matchers (toBeInTheDocument, etc.)
 * 2. Loads the repo-root .env into process.env so Prisma picks up DATABASE_URL.
 */
import '@testing-library/jest-dom'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ── jsdom stubs required by framer-motion ────────────────────────────────────
// framer-motion's whileInView feature calls IntersectionObserver on mount.
// jsdom doesn't implement it — provide a no-op stub.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] { return [] }
    readonly root: Element | Document | null = null
    readonly rootMargin: string = ''
    readonly thresholds: ReadonlyArray<number> = []
  }
}

// ResizeObserver — used by some motion layout features
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    constructor(_callback: ResizeObserverCallback) {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
// ─────────────────────────────────────────────────────────────────────────────

const envPath = resolve(__dirname, '../../../.env')

try {
  const content = readFileSync(envPath, 'utf-8')
  for (const raw of content.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eqIdx = line.indexOf('=')
    if (eqIdx === -1) continue
    const key = line.slice(0, eqIdx).trim()
    let val = line.slice(eqIdx + 1).trim()
    // Strip matching surrounding quotes
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (key && process.env[key] === undefined) {
      process.env[key] = val
    }
  }
} catch {
  // .env not present — rely on shell environment (CI, etc.)
}
