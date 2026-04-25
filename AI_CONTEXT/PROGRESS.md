# Crib Community — Build Progress Sheet
Last updated: 2026-04-25

---

## STATUS KEY
- ✅ Done & working
- 🔶 Partial / needs improvement
- ❌ Not built
- 🐛 Broken / bug

---

## MODULE A — Infrastructure & DB
| Item | Status | Notes |
|------|--------|-------|
| Turborepo monorepo (web + admin + packages) | ✅ | pnpm workspaces |
| Prisma schema → Supabase | ✅ | All tables live |
| `.env` in each app | ✅ | Fixed after session 2 |
| 91-day RoomInventory seed | ✅ | 18 room types × 91 days |
| Admin user seeded | ✅ | cribcommunity@gmail.com |
| Testimonials seeded | ✅ | 4 records |
| Location images field in DB | ✅ | JSON array column, seeded via admin |
| FAQ.context field in DB | ✅ | Migrated — per-page context working |
| Job.location — dropdown from locations | ✅ | Free text select from Location names |

---

## MODULE B — Web (Public Site)

### NavBar
| Item | Status |
|------|--------|
| Logo + Reserve CTA | ✅ |
| Home link | ✅ |
| Stay → /locations | ✅ |
| Community dropdown (Our Story, Events, Join Us, Blog, FAQ) | ✅ |
| Contact link | ✅ |
| Mobile hamburger menu | ✅ |

### Pages
| Page | Status | Notes |
|------|--------|-------|
| Homepage (/) | ✅ | Real data: locations, events, blog, testimonials |
| Locations listing (/locations) | ✅ | LocationCard with hover image slideshow |
| Location detail (/locations/[slug]) | ✅ | FAQ section included |
| Property detail (/properties/[slug]) | 🔶 | Booking UI needs polish |
| Events listing (/community/events) | ✅ | FAQ section included |
| Event detail (/community/events/[slug]) | ✅ | |
| Blog listing (/community/blog) | ✅ | |
| Blog article (/community/blog/[slug]) | ✅ | |
| Our Story (/community/our-story) | ✅ | |
| Jobs/Careers (/community/jobs) | ✅ | FAQ section included |
| Job detail (/community/jobs/[slug]) | ✅ | |
| FAQ page (/community/faq) | ✅ | Grouped by context |
| Contact (/contact) | ✅ | |
| error.tsx / loading.tsx / not-found.tsx | ✅ | |

### FAQ sections on pages
| Page | Status |
|------|--------|
| Location detail page | ✅ |
| Property detail page | ✅ |
| Events page | ✅ |
| Careers/Jobs page | ✅ |
| Standalone FAQ page | ✅ |

### Location Card image hover effect
| Item | Status |
|------|--------|
| Location has image fields in DB | ✅ |
| Card hover image slideshow | ✅ | Auto-cycles every 1.4s on hover |

### Booking Journey Polish
| Item | Status |
|------|--------|
| Room selection | 🔶 functional, no polish |
| Date picker calendar | 🔶 functional, no polish |
| Booking summary panel | 🔶 functional, no polish |

---

## MODULE C — Admin Panel

### Auth
| Item | Status | Notes |
|------|--------|-------|
| Login page | ✅ | /login — password: crib-admin-2026 |
| Middleware route protection | ✅ | All pages protected |
| Logout button | ✅ | Header logout wired |

### Locations
| Item | Status | Notes |
|------|--------|-------|
| List locations | ✅ | |
| Delete location | ✅ | Blocked with error if properties exist |
| Add location form | ✅ | India city/state dropdowns, image upload |
| Edit location form | ✅ | Same |
| City/State India dropdown | ✅ | 20 states, cascading cities |
| Image upload (up to 10) | ✅ | Supabase Storage 'media' bucket |

### Properties
| Item | Status | Notes |
|------|--------|-------|
| List properties | ✅ | |
| Add property | ✅ | Amenity picker + room management + image upload |
| Edit property | ✅ | Same |
| Amenity selector | ✅ | Grouped by category |
| Room management | ✅ | Name, capacity, price, description, images |
| Room image upload | ✅ | |

### Bookings
| Item | Status | Notes |
|------|--------|-------|
| List bookings | ✅ | |
| Status update | ✅ | StatusSelect auto-submits |
| Monthly filter | ✅ | Last 12 months dropdown |
| Result limit selector | ✅ | 20 / 50 / 100 / all |
| Export as CSV | ✅ | /bookings/export route |

### Events
| Item | Status | Notes |
|------|--------|-------|
| List events | ✅ | |
| Approve/revoke event | ✅ | |
| Add event form | ✅ | With location dropdown + type + dates |
| Edit event form | ❌ | No edit page yet |

### Blog
| Item | Status | Notes |
|------|--------|-------|
| List posts | ✅ | |
| Add post | ✅ | |
| Edit post | ✅ | |
| Blog categories management | ✅ | /blog/categories |

### Jobs
| Item | Status | Notes |
|------|--------|-------|
| List jobs | ✅ | |
| Add job | ✅ | Location dropdown from DB |
| Edit job | ✅ | Location dropdown from DB |

### FAQ
| Item | Status | Notes |
|------|--------|-------|
| List FAQs | ✅ | |
| Add FAQ | ✅ | With context (which page) selector |
| Edit FAQ | ✅ | With context selector |
| FAQ context per-page filtering | ✅ | context column in DB, working |

### Users
| Item | Status | Notes |
|------|--------|-------|
| List users | ✅ | |
| Change user role | ✅ | Inline dropdown, auto-submits |
| Invite by email | ❌ | Not built |

### Enquiries
| Item | Status | Notes |
|------|--------|-------|
| List enquiries | ✅ | |
| Status update | ✅ | |

---

## TOTAL PROGRESS
- ✅ Done: ~68 items
- 🔶 Partial: ~4 items
- ❌ Not built: ~4 items
- 🐛 Broken: 0

**Roughly 90% complete toward an MVP.**

---

## REMAINING WORK

### P1 — Still missing
1. Admin: Edit Event form (`/events/[id]/edit`)
2. Booking journey UI polish (room selection, calendar, summary panel)

### P2 — Nice to have
3. User invite by email
4. Analytics dashboard
5. RLS policies on Supabase
6. Event proposals (host your own event)
