# SKILL: Booking Engine

## PURPOSE
Handle all booking creation, validation, and availability logic using real DB data.
Always fetch full Location > Property > RoomType > Amenity hierarchy.

## CORE MODELS
- Location → Property → RoomType → Amenity (via RoomTypeAmenity)
- RoomInventory → availability per date per room_type_id
- Booking → confirmed reservations

## FETCH PATTERN (ALWAYS USE THIS)
When fetching a property for display or booking:
```ts
const property = await db.property.findUnique({
  where: { slug },
  include: {
    location: true,
    roomTypes: {
      include: {
        amenities: {
          include: { amenity: true }
        },
        inventory: {
          where: {
            date: { gte: checkIn, lt: checkOut }
          }
        }
      }
    }
  }
})
```

## AVAILABILITY RULE (CRITICAL)
- Availability lives in RoomInventory (room_type_id + date + available_count)
- NEVER treat availability as a static field
- A room is available only if available_count > 0 for ALL dates in range

## BOOKING CREATION FLOW
1. Validate input (Zod)
2. Verify property_id > room_type_id relationship is valid
3. Query RoomInventory for all dates in range
4. Check for overlapping Bookings
5. If available → create Booking, decrement RoomInventory per date
6. Return booking confirmation

## REQUIRED BOOKING FIELDS
- property_id, room_type_id
- guest_name, guest_email, guest_phone
- check_in_date, check_out_date
- total_amount (nights × price_per_night)
- payment_status (default: pending)
- booking_status (default: confirmed)
- source

## OVERLAP CHECK
existing.check_in_date < new.check_out_date
AND existing.check_out_date > new.check_in_date
AND existing.booking_status != 'cancelled'

## AMENITY RULES
- Amenities are fetched via RoomTypeAmenity join
- Always include amenity.icon and amenity.name in response
- Never return raw amenity IDs to the frontend — always resolve to full object

## RULES
- NEVER use mock data
- ALWAYS use packages/db Prisma client
- ALWAYS wrap multi-write operations in Prisma transactions
- ALWAYS return typed responses