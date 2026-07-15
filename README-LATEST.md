# J1 Motors WMS V4 — Preferred Layout Edition

This version applies the uploaded professional black/red layout to V4 and restores quotation attachments.

## Restored quotation upload
Customers can attach multiple:
- photos
- videos
- PDF files
- Word documents

For Supabase cloud use, run migrations in order, including:
- `supabase/migrations/003_track_by_rego_phone.sql`
- `supabase/migrations/004_quote_file_upload.sql`

## Staff IDs
- ROBIN
- JASON
- ANTHONY
- BEN

## Customer tracking
Uses registration and phone number.


## Language selection

The header now includes:
- English
- Simplified Chinese (简体中文)
- Korean (한국어)

The selected language is saved in the browser and applies to both customer and staff pages.
The quotation file-upload feature remains included.
