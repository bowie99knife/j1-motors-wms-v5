# Connect J1 Motors WMS V5 to Supabase

## 1. Install the database

Open your Supabase project:

**SQL Editor → New query**

Open:

`supabase/J1_MOTORS_WMS_V5_COMPLETE.sql`

Copy everything, paste it into the SQL Editor, and press **Run**.

Use this only on the new/empty J1 Motors Supabase project.

## 2. Add Netlify environment variables

In Netlify:

**Project configuration → Environment variables**

Add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Use the Supabase Project URL and Publishable key.

Never use the `service_role` or secret key in Netlify.

## 3. Create staff users

In Supabase:

**Authentication → Users → Add user**

Create these internal email accounts:

| Login ID | Internal email | Name | Role |
|---|---|---|---|
| ROBIN | robin@j1motors.local | Robin | admin |
| JASON | jason@j1motors.local | Jason | workshop_manager |
| ANTHONY | anthony@j1motors.local | Anthony | mechanic |
| BEN | ben@j1motors.local | Ben | apprentice |

For each user add metadata matching the examples in:

`scripts/staff-accounts.md`

Use a different temporary password for each person.

## 4. Deploy

For a Git-based Netlify deployment:

```bash
npm install
npm run build
```

Publish directory:

`dist`

The included `netlify.toml` already uses those settings.

## 5. Test before real use

Test:

- booking capacity
- quotation attachments
- registration + phone tracking
- each staff role
- Robin-only revenue and quote requests
- job-card photo uploads
- customer and vehicle history
