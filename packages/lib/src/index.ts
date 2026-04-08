/**
 * @crib/lib — Shared utilities
 * Framework-agnostic helpers used by both apps/web and apps/admin.
 */

// ─── Formatting ───────────────────────────────────────────────────

/**
 * Format a date for display.
 * @example formatDate(new Date()) → "8 April 2026"
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  })
}

/**
 * Format a date-time for display.
 * @example formatDateTime(new Date()) → "8 April 2026, 14:30"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format a currency amount.
 * @example formatCurrency(120, 'USD') → "$120.00"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

// ─── String utilities ─────────────────────────────────────────────

/**
 * Convert a string to a URL-safe slug.
 * @example slugify("Hello World!") → "hello-world"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Truncate text to a max length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Capitalise the first letter of each word.
 */
export function titleCase(text: string): string {
  return text.replace(/\b\w/g, (c) => c.toUpperCase())
}

// ─── Booking helpers ──────────────────────────────────────────────

/**
 * Calculate the number of nights between two dates.
 */
export function calcNights(checkIn: Date | string, checkOut: Date | string): number {
  const a = typeof checkIn === 'string' ? new Date(checkIn) : checkIn
  const b = typeof checkOut === 'string' ? new Date(checkOut) : checkOut
  const diffMs = b.getTime() - a.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Calculate total booking amount.
 */
export function calcBookingTotal(pricePerNight: number, nights: number): number {
  return pricePerNight * nights
}

// ─── Validation helpers ───────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-()]{7,15}$/.test(phone)
}

// ─── SEO helpers ──────────────────────────────────────────────────

export function buildSeoTitle(pageTitle: string, siteName = 'Crib Community'): string {
  return `${pageTitle} | ${siteName}`
}

export function buildCanonicalUrl(path: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}
