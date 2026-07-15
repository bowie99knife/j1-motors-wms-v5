# J1 Motors WMS V5 — GitHub + Netlify Setup

## A. Upload the project to GitHub

1. Sign in to GitHub on Windows.
2. Select **+ → New repository**.
3. Repository name: `j1-motors-wms-v5`.
4. Choose **Private**.
5. Do not add a README, `.gitignore`, or license because they are already included.
6. Create the repository.
7. On the empty repository page select **uploading an existing file** or **Add file → Upload files**.
8. Extract this ZIP on your computer.
9. Open the extracted folder, select all files and folders inside it, and drag them into the GitHub upload page.
10. Enter commit message: `Initial J1 Motors WMS V5` and commit the files.

Do not upload `.env`, passwords, database passwords, secret keys, or service-role keys.

## B. Link the existing Netlify site to GitHub

1. Open the existing `j1motors` project in Netlify.
2. Go to **Project configuration → Build & deploy → Continuous deployment → Repository**.
3. Select **Link repository**.
4. Choose GitHub and authorize Netlify if prompted.
5. Select the `j1-motors-wms-v5` repository.
6. Use branch `main`.
7. Build command: `npm run build`.
8. Publish directory: `dist`.

The included `netlify.toml` already contains these settings.

## C. Add Supabase variables in Netlify

Go to **Project configuration → Environment variables** and add:

- `VITE_SUPABASE_URL` = `https://ytxhfwhyueefxqwzbusj.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = your Supabase key beginning with `sb_publishable_`

Do not add the secret key, service-role key, JWT secret, or database password.

## D. Deploy

After the repository is linked and the variables are saved, push a change or use the deploy controls in Netlify. Netlify will run `npm run build` and publish `dist`.

## E. Test

1. Open the live site in a private browser window.
2. Submit a test booking.
3. Check Supabase **Table Editor → appointments**.
4. Sign in as ROBIN.
5. Confirm Robin sees admin-only sections.
6. Sign in as JASON and confirm revenue and quote requests are hidden.
