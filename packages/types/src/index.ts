/**
 * @crib/types — Shared TypeScript interfaces
 *
 * These mirror the Prisma models in packages/db/schema.prisma.
 * Use these on the frontend — NEVER import @prisma/client in components.
 * Import from @crib/db in server-side code (API routes, server components).
 */

// ─── Media ───────────────────────────────────────────────────────

export interface Media {
  id: string
  url: string
  type: string
  alt_text: string | null
  uploaded_by: string | null
  created_at: Date
}

// ─── Location > Property > RoomType hierarchy ─────────────────────

export interface Location {
  id: string
  name: string
  slug: string
  description: string | null
  city: string
  state: string
  country: string
  latitude: number | null
  longitude: number | null
  manager_name: string | null
  contact_email: string | null
  contact_phone: string | null
  created_at: Date
}

export interface Property {
  id: string
  location_id: string
  name: string
  slug: string
  description: string | null
  address: string
  manager_name: string | null
  contact_phone: string | null
  amenities: Record<string, boolean> | null
  check_in_time: string | null
  check_out_time: string | null
  created_at: Date
}

export interface PropertyWithLocation extends Property {
  location: Location
}

export interface Amenity {
  id: string
  name: string
  icon: string        // Lucide icon name — render with dynamic <LucideIcon />
  category: string
  is_popular: boolean
}

export interface RoomType {
  id: string
  property_id: string
  name: string
  description: string | null
  capacity: number
  price_per_night: number
  images: string[] | null
}

export interface RoomTypeWithAmenities extends RoomType {
  amenities: Array<{ amenity: Amenity }>
}

export interface RoomInventory {
  id: string
  room_type_id: string
  date: Date
  available_count: number
}

// ─── Bookings ─────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'paid' | 'refunded'
export type BookingStatus = 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out'

export interface Booking {
  id: string
  property_id: string
  room_type_id: string
  guest_name: string
  guest_email: string
  guest_phone: string | null
  check_in_date: Date
  check_out_date: Date
  total_amount: number
  payment_status: PaymentStatus
  booking_status: BookingStatus
  source: string | null
  created_at: Date
}

// ─── Events ───────────────────────────────────────────────────────

export type EventType = 'social' | 'workshop' | 'music' | 'wellness' | 'other'
export type EventProposalStatus = 'pending' | 'approved' | 'rejected'

export interface Event {
  id: string
  location_id: string
  name: string
  slug: string
  type: EventType
  description: string | null
  start_datetime: Date
  end_datetime: Date
  is_approved: boolean
  created_by: string
}

export interface EventRegistration {
  id: string
  event_id: string
  name: string
  email: string
  phone: string | null
  created_at: Date
}

export interface EventProposal {
  id: string
  applicant_name: string
  applicant_phone: string | null
  applicant_email: string
  proposal_details: string
  status: EventProposalStatus
  created_at: Date
}

// ─── Blog ─────────────────────────────────────────────────────────

export type BlogPostStatus = 'draft' | 'published'

export interface BlogCategory {
  id: string
  name: string
  slug: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  author_id: string
  category_id: string
  featured_media_id: string | null
  status: BlogPostStatus
  published_at: Date | null
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
}

export interface BlogPostWithCategory extends BlogPost {
  category: BlogCategory
  featured_media: Media | null
}

// ─── Jobs ─────────────────────────────────────────────────────────

export interface Job {
  id: string
  title: string
  slug: string
  location: string
  salary_range: string | null
  description: string
  valid_through: Date | null
  created_at: Date
}

export interface JobApplication {
  id: string
  job_id: string
  applicant_name: string
  email: string
  phone: string | null
  resume_url: string
  talent_description: string | null
  created_at: Date
}

// ─── Contact / Misc ───────────────────────────────────────────────

export type EnquiryStatus = 'new' | 'responded' | 'closed'
export type EnquiryIntent = 'booking' | 'partnership' | 'general' | 'press'

export interface Enquiry {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  intent: EnquiryIntent | null
  source: string | null
  status: EnquiryStatus
  response_deadline: Date | null
  created_at: Date
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  sort_order: number
}

// ─── Auth ─────────────────────────────────────────────────────────

export type UserRole = 'USER' | 'EDITOR' | 'ADMIN' | 'SUPER_ADMIN'

export interface User {
  id: string
  email: string
  role: UserRole
  created_at: Date
}

// ─── API response helpers ─────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
