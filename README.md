# J1 Motors WMS V5

Production-candidate workshop management system for J1 Motors Car Repairs.

## Customer website

- Professional J1 Motors black/red design
- English, Simplified Chinese, and Korean
- Booking flow: date → available time → customer/vehicle details
- Hidden maximum of 10 bookings per day
- Fully booked time slots automatically unavailable
- Quotation requests with file attachments
- Vehicle tracking using registration + phone number
- Google Maps workshop location

## Staff system

Individual staff logins:

- ROBIN — Admin
- JASON — Workshop Manager
- ANTHONY — Mechanic
- BEN — Apprentice

Permissions:

- Robin: revenue, quote requests, bookings, job cards, staff management
- Jason, Anthony, and Ben: bookings and all job cards
- All active staff can create/update job cards and upload job photos
- Revenue is stored in a separate admin-only table
- Quote requests are protected by admin-only database policies
- Inventory is not included

## Workshop records

- Customers
- Vehicles
- Booking history
- Job cards
- Vehicle service history
- Inspection photos
- Quote attachments
- Audit trail
- Staff roles
- Admin-only financial records

## Database setup

Run this single file in Supabase SQL Editor:

`supabase/J1_MOTORS_WMS_V5_COMPLETE.sql`

Then follow:

`SUPABASE-SETUP.md`
