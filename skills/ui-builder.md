# SKILL: UI Builder

## PURPOSE
Assemble UI using existing components. Never invent layouts or components.

## COMPONENT HIERARCHY
1. packages/ui/ — shared components (check here first)
2. apps/web/components/[section]/ — page-specific components
3. AI_CONTEXT/design-map.json — Stitch-mapped prop signatures
4. Only if nothing exists → ask before creating

## AMENITY ICON DISPLAY RULES (CRITICAL)
- Amenity icons use Lucide React
- Icon name is stored as string in amenity.icon (e.g. "Wifi", "AirVent")
- Render dynamically using Lucide's dynamic import pattern:
```tsx
import dynamicIconImports from 'lucide-react/dynamicIconImports'
import dynamic from 'next/dynamic'

const Icon = dynamic(dynamicIconImports[amenity.icon])

// Render each amenity as a pill:
<span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
  bg-gray-100 text-sm text-gray-700">
  <Icon className="w-4 h-4" />
  {amenity.name}
</span>
```
- Show amenities as a flex-wrap row of pills/badges on RoomType cards
- Popular amenities (is_popular = true) shown first, sorted by category

## ROOM TYPE CARD RULES
- Always show: name, capacity, price_per_night, amenity pills
- Amenity pills: icon + label, flex-wrap, max 6 shown + "+N more" overflow
- CTA: "Check Availability" button → triggers AvailabilityCalendar

## PROPERTY PAGE LAYOUT
- Hero: property name + cover image
- Location breadcrumb: Location → Property
- Room Types grid: each card with amenities + availability CTA
- Property-level amenities shown separately as a summary row

## GENERAL RULES
- NEVER create a new component if an existing one can be reused
- NEVER use inline styles — Tailwind only
- ALWAYS handle loading, error, and empty states
- ALWAYS use Next.js Image component
- ALWAYS reference media via media_id from Media table

## SHADCN RULES
- Always check if shadcn has the component before building custom
- Shadcn components are in apps/web/components/ui/
- Extend shadcn components via className — never modify source files directly
- Use shadcn: Button, Input, Card, Badge, Dialog, Sheet, Tabs, Calendar, Form, Toast

## FRAMER MOTION RULES
- Wrap page sections in <motion.div> with viewport-triggered animations
- Standard entrance:
  initial={{ opacity: 0, y: 16 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
- Stagger lists with staggerChildren: 0.08
- Hover states on cards: scale: 1.02, transition duration: 0.2
- Never animate on every scroll tick — use viewport once: true
- AmenityPill hover: subtle background shift only (no scale)

## FOLDER PLACEMENT
- Shared → packages/ui/
- Home → apps/web/components/home/
- Location → apps/web/components/location/
- Property → apps/web/components/property/
- Blog → apps/web/components/blog/
- Events → apps/web/components/events/
- UI primitives → apps/web/components/ui/

## OUTPUT FORMAT
- TypeScript + Tailwind
- Named exports only
- Props typed via packages/types