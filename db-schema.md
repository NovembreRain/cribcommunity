Repo Structure

Next.js (App Router) + Prisma + PostgreSQL + CMS-like admin
travellers-crib/
│
├── apps/
│   ├── web/                      # Public website
│   └── admin/                    # Admin dashboard (separate app)
│
├── packages/
│   ├── ui/                       # Shared UI components
│   ├── db/                       # Prisma schema + DB logic
│   ├── lib/                      # Shared utilities
│   └── types/                    # Shared TypeScript types
│
├── public/
│
├── prisma/
│   └── schema.prisma
│
├── .env
Readme.md


Web App Structure (Public Site)
apps/web/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # Home
│   │
│   ├── locations/
│   │   ├── page.tsx             # All locations
│   │   └── [locationSlug]/
│   │       └── page.tsx         # Individual location
│   │
│   ├── properties/
│   │   └── [propertySlug]/
│   │       └── page.tsx
│   │
│   ├── community/
│   │   ├── our-story/
│   │   ├── events/
│   │   │   ├── page.tsx
│   │   │   └── [eventSlug]/
│   │   ├── join-us/
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [blogSlug]/
│   │   └── faq/
│   │
│   ├── contact/
│   ├── book-now/                # Redirect logic
│   │
│   ├── api/                     # Public APIs
│   │   ├── bookings/
│   │   ├── events/
│   │   ├── applications/
│   │   ├── contact/
│   │   └── auth/
│
├── components/
│   ├── home/
│   ├── location/
│   ├── property/
│   ├── blog/
│   ├── events/
│   ├── ui/
│
├── lib/
│   ├── seo.ts
│   ├── analytics.ts
│   ├── helpers.ts
│
└── middleware.ts


Admin App Structure
Keep admin completely separate.
apps/admin/
│
├── dashboard/
│
├── modules/
│   ├── home/
│   ├── locations/
│   ├── properties/
│   ├── bookings/
│   ├── events/
│   ├── blog/
│   ├── jobs/
│   ├── enquiries/
│   ├── faq/
│   └── users/
│
├── components/
└── api/
________________________________________


Database – CLEANED + NORMALIZED

________________________________________
🏠 HOME
HomeHero
- id
- title
- subtitle
- button_text
- button_link
- media_id

Testimonial
- id
- name
- text
- rating
- avatar_media_id

GalleryMedia
- id
- media_url
- media_type
- sort_order
________________________________________
📍 LOCATIONS (Important: Separate Location & Property)
Location
Location
- id
- name
- slug
- description
- city
- state
- country
- latitude
- longitude
- manager_name
- contact_email
- contact_phone
- created_at
________________________________________
Property (Belongs to Location)
Property
- id
- location_id (FK)
- name
- slug
- description
- address
- manager_name
- contact_phone
- amenities (JSON)
- check_in_time
- check_out_time
- created_at
________________________________________
Room Types
RoomType
- id
- property_id (FK)
- name
- description
- capacity
- price_per_night
________________________________________
Availability (NEVER store availability as static field)
RoomInventory
- id
- room_type_id
- date
- available_count
________________________________________
Booking
Booking
- id
- property_id
- room_type_id
- guest_name
- guest_email
- guest_phone
- check_in_date
- check_out_date
- total_amount
- payment_status
- booking_status
- source
- created_at
________________________________________
🌍 COMMUNITY SECTION
________________________________________
📖 Our Story
TimelineEvent
- id
- year
- title
- description
- media_id
- sort_order
________________________________________
🎪 Events
Separate admin events and user submissions properly.
Events
Event
- id
- name
- slug
- type
- description
- location_id
- start_datetime
- end_datetime
- is_approved
- created_by (admin/user)
________________________________________
Event Registration
EventRegistration
- id
- event_id
- name
- phone
- email
- created_at
________________________________________
User Event Proposal
EventProposal
- id
- applicant_name
- applicant_phone
- applicant_email
- proposal_details
- status (pending/approved/rejected)
________________________________________
💼 Join Us
Jobs
Job
- id
- title
- slug
- location
- salary_range
- description
- valid_through
- created_at
________________________________________
Job Applications
JobApplication
- id
- job_id
- applicant_name
- email
- phone
- resume_url
- talent_description
- created_at
________________________________________
✍️ BLOG (SEO Optimized Structure)
BlogCategory
- id
- name
- slug

BlogPost
- id
- title
- slug
- excerpt
- content (rich text)
- featured_image
- category_id
- author_id
- status (draft/published)
- published_at
- meta_title
- meta_description
- og_image
________________________________________
📩 CONTACT
Enquiry
- id
- name
- email
- phone
- message
- intent
- source
- status (new/responded/closed)
- response_deadline
- created_at
________________________________________
❓ FAQ
FAQ
- id
- question
- answer
- category
- sort_order
________________________________________
🧱 5️⃣ More
🔐 1. Authentication System
●	Admin roles

●	Super admin

●	Event organizers

●	Editors

________________________________________
📊 2. Analytics Tables
PageView
- id
- path
- user_agent
- referrer
- timestamp

EventTracking
- id
- event_name
- metadata (JSON)
- created_at
________________________________________
💳 3. Payments
Payment
- id
- booking_id
- amount
- payment_gateway
- transaction_id
- status
________________________________________
🖼 4. Media Table (Centralized)
Media
- id
- url
- type (image/video)
- alt_text
- uploaded_by
- created_at
Everything should reference media_id instead of storing media fields everywhere.




