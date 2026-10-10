# Noorun Ala Noor — Vercel edition

Includes the public festival website, Main Admin, registration-only Sub-admin,
editable navigation, home text and other page content, team/event management,
leaderboard, and result-poster downloads. Existing visual branding is preserved.

## Portal permissions

- `/admin/login`: shared Main Admin password; full content and event/result management.
- `/sub-admin/login`: separate shared password; participant registration and registration edits only.
- `/admin/setup`: first-time owner setup, protected by your server-side setup key.
- `/admin/password`: change the two portal passwords after signing in as Main Admin.

There is no preset password. Set different passwords of at least 12 characters.
Passwords are hashed in the database. Never put passwords or database tokens in Git.

## Deploy to Vercel

1. Extract this folder. Create a private GitHub repository and upload the contents,
   including `package.json`, `package-lock.json`, `app`, `public`, and the other folders.
2. Create a **libSQL database** in Turso. This edition uses `@libsql/client`.
3. In Vercel, import the GitHub repository with framework **Next.js**.
4. In project Environment Variables, add:
   - `TURSO_DATABASE_URL` — the libSQL database URL.
   - `TURSO_AUTH_TOKEN` — its database token.
   - `ADMIN_SETUP_KEY` — a new random secret of at least 24 characters, chosen by you.
5. Initialise the database before using the portals. In a local terminal with the
   database environment variables configured, run `npm ci` and `npm run db:migrate`.
   Alternatively execute the three SQL migration files in `drizzle/`, in filename
   order, once against a new database using its SQL console. Do not rerun table creation.
6. Deploy in Vercel. Open the returned Vercel address followed by `/admin/setup`.
7. Enter your setup key and create the Main Admin password. Then set the Sub-admin
   password at `/admin/password`. Remove `ADMIN_SETUP_KEY` from Vercel and redeploy
   after setup; it is not needed for normal login.
8. Share each portal link and its corresponding password only with its intended users.

Vercel hosting and the remote database have their own account and usage limits.
No Vercel deployment or database is created by extracting this archive.

## Edit public content

- Main Admin → **All page content**: navbar labels/links/order/visibility,
  category labels, headings, paragraphs, buttons, and public image URLs.
- Main Admin → **Site settings**: festival name, hero title, venue, email,
  brochure URL, gallery image URLs, and footer note.
- Click **Save changes**. Open the public page to view the saved content.
- Main Admin → **Participants**: view and edit registrations. Toggle **Registration Open / Closed**, then **Save changes** to enable or disable Sub-admin entry. Closed registration blocks both additions and edits; Main Admin can still edit.
- **Events & results → Import registrations** adds registered participants to the
  selected event's result draft. Enter ranks/points and publish the result.
- Sub-admin cannot edit public content, results, marks, or portal passwords.

## Data

The archive includes the original public festival snapshot in `data/seed.json`.
It does not contain live database credentials, saved login sessions, or a current
export of later changes made to the old hosted site. A new database starts from
that snapshot until an admin saves. Existing production data must be exported and
migrated separately if it has changed.

## Local commands

`npm ci`

`npm run db:migrate` (with database environment variables set)

`npm run dev`

`npm run build`

`node scripts/test-portals.mjs` runs checks against a temporary local database
and a local server on port 3097; it does not modify a hosted database.

Event types: Individual, Group 2, Group 3, Group 4, Group 5. Legacy Group events load as Group 2; review their size in Main Admin. All group types count the highest score per team once. High School group posters show 1st/2nd/3rd slots with one participant per winning team on each page, rotating entered members across pages. Unannounced places are labelled; marks and grades are excluded.

Media Team: /media-team (login /media-team/login). Main Admin sets its separate password under Portal passwords. This role can only add gallery photos/videos, never access registrations or edit site content. Upload PNG/JPEG/WebP/GIF or MP4/WebM up to 3 MB; larger videos need a direct HTTPS link. Run npm run db:migrate before deployment to create gallery_media. Media is stored in the configured database and appears on /gallery.
