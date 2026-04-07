# SKILL: Admin Module Builder

## PURPOSE
Build CRUD admin modules in apps/admin following the established module pattern.

## MODULE STRUCTURE
apps/admin/modules/[module-name]/
├── page.tsx ← list view
├── [id]/page.tsx ← detail / edit view
└── new/page.tsx ← create view

text

## ROOM TYPE + AMENITY MANAGEMENT (KEY MODULE)
Lives under: apps/admin/modules/properties/[id]/rooms/

### Room Type Form Fields
- name, description, capacity, price_per_night
- Amenities picker (see below)

### Amenity Picker UI Rules
- Show popular amenities (is_popular = true) as a checkbox grid with icons
- Each checkbox: Lucide icon + amenity name
- Below the grid: text input to add a custom amenity
  - Custom amenity: enter name → select icon from Lucide picker dropdown → save
  - Custom amenity is saved to Amenity table (is_popular = false)
- Selected amenities shown as icon pills below the picker
- On save → write to RoomTypeAmenity join table

### Amenity Picker Component
File: apps/admin/components/AmenityPicker.tsx

Props:
```ts
interface AmenityPickerProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}
```

Behaviour:
- Fetch GET /api/amenities on mount
- Group by category
- Popular ones shown as icon checkboxes in grid
- Custom input at bottom
- Selected state reflected in icon pill display

## STANDARD MODULE PATTERN
1. List view — table with pagination, search, status filter
2. Detail/Edit view — form, save button, delete with confirm
3. Create view — same form, empty state

## AUTH RULES
- Every admin page server-checked
- Middleware protects all /admin routes
- Roles: super_admin, editor, event_organizer
- Super admin → full access
- Editor → blog, events, faq
- Event organizer → events only

## FORM RULES
- react-hook-form + Zod resolver
- Field-level errors inline
- Confirm before delete
- Toast on success/error

## TABLE RULES
- Server-side pagination (20/page)
- Sortable columns
- Status badge with color
- Actions: View, Edit, Delete

## RULES
- NEVER build admin UI in apps/web
- NEVER expose admin routes publicly
- ALWAYS use packages/types for model types
- ALWAYS use packages/db for DB access