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
- Sub-admin cannot edit public content, results, marks, or portal passwords. Result Controller, Main Invigilator and Invigilator accounts are configured separately in Portal passwords; Main Admin must enable each role in Site settings.

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

Result Controller: /result-controller (login /result-controller/login). This role can save result drafts only; Main Admin retains publishing authority. Main Invigilator: /main-invigilator (login /main-invigilator/login) can open/close participation per competition. Invigilator: /invigilator (login /invigilator/login) can mark attendance by chest number only for candidates registered in that event while participation is open. Attendance requires migration `0004_attendance.sql`. Candidate QR codes are available on the candidate detail page and printable roster. Invigilator camera scanning uses the browser BarcodeDetector API where supported; manual chest-number entry remains available as a fallback.

Media Team: /media-team (login /media-team/login). Main Admin sets its separate password under Portal passwords. This role can only add gallery photos/videos, never access registrations or edit site content. Upload PNG/JPEG/WebP/GIF or MP4/WebM up to 10 MB; larger videos need a direct HTTPS link. Run npm run db:migrate before deployment to create gallery_media. Media is stored in the configured database and appears on /gallery.

## Additional portal workflow in this revision

- Main Admin can enable/disable Result Controller, Main Invigilator and Invigilator portals in Site settings and set their separate passwords in Portal passwords.
- Result Controller saves draft rows only. It can import only attendance-marked candidates; the API rejects any row whose registration has not been marked present for that event. Main Admin remains responsible for publishing/announcing.
- Main Invigilator can open/close participation per competition. Invigilators can record attendance by chest number only while that event is open and only if the candidate is registered for that event.
- Run `npm run db:migrate` after deploying this revision to create the `event_attendance` table.

## Remaining items and limitations

Category management is available in Admin → Categories (create, rename and delete custom categories). Team deletion is blocked while registrations or results still reference the team; the server independently validates category and team deletion. The Result Controller and attendance portals are role-separated workflows, not a full enterprise audit/approval system. QR images currently depend on the external QR Server endpoint, and camera scanning is browser-dependent. Stage and Off-stage registration switches are available in Admin → Participants.

## Verification status

Source changes are packaged, but a production build could not be verified in this environment because project dependencies could not be installed from the npm registry. Install dependencies with `npm ci`, run `npm run db:migrate`, then `npm run build` before deploying. Test the portals against a staging database first.


### Candidate QR and printable roster
- Each candidate has a private-by-unguessable-ID detail URL at `/candidate/[id]`, showing their name, class, team, chest number, registered competitions and QR code.
- Main Admin can open `/admin/roster` to filter candidates by category/team and print or save an A4 PDF roster. The roster contains no marks or results.
- QR images are currently rendered through the QR Server image endpoint, so the browser needs internet access when displaying/printing QR codes. QR payload contains the candidate UUID and chest number.
- Camera scanning uses the browser's native `BarcodeDetector` API and requires camera permission plus HTTPS (or localhost). Browsers without this API can use manual chest entry.
- Main Admin can independently toggle Stage and Off-stage registration in Admin → Participants. The global registration switch remains the master switch for sub-admin access.
