# Noorun Ala Noor implementation status

## Added in this revision
- Separate Result Controller, Main Invigilator and Invigilator login routes.
- Main Admin switches to enable/disable these portals and separate password setup cards.
- Result Controller draft editor with attendance-only import and server-side attendance validation.
- Main Invigilator can open/close participation per event.
- Invigilator can mark participation using chest number. The API verifies event registration, event participation status and duplicate attendance.
- `event_attendance` database migration.
- Upload UI limit raised to 10 MB for logo; existing gallery and poster endpoints already accept base64 payloads up to about 10 MB files.
- Existing announcement queue/direct publish/announced flow, top-scorer toggle, leaderboard gap setting, category labels, team management and candidate class/chest registration retained.

## Category and team management
- Added category creation, renaming and deletion in Admin → Categories.
- Custom category deletion is blocked in the UI when events use it and is independently checked by the server against both events and candidate registrations.
- Team deletion is disabled in the UI when results or registered candidates use the team. The server independently blocks deletion while registrations still reference the team.
- Team renaming continues to update linked draft and published results; registration records retain their stable team ID.

## Verification status
- TypeScript/TSX syntax transpilation passed for all 126 source files.
- Full TypeScript typecheck and Next.js production build could not be completed because npm dependency installation timed out; the global typecheck also confirms the local `@types/node` package is unavailable.
- The existing `scripts/test-portals.mjs` integration suite is retained, but could not be run without the installed Next.js and database dependencies. Do not deploy to production until `npm ci`, `npm run build`, and the staging role/permission tests pass.

## Deployment checks
1. Configure Turso and Vercel environment variables as documented in README.
2. Run `npm ci`.
3. Run `npm run db:migrate` to apply `0004_attendance.sql`.
4. Run `npm run build` and fix any environment-specific errors.
5. Test each role and permission in a staging deployment before production.


## Additional continuation work
- Added independent Stage and Off-stage registration switches, with server-side validation and sub-admin UI status.
- Added candidate detail pages with candidate QR codes.
- Added an admin-only printable roster with category/team filters and no results/marks.
- Added camera QR scanning for browsers that support `BarcodeDetector`, retaining manual chest-number entry as a fallback.
- Added an animated cumulative points progression graph to the leaderboard, with checkpoints controlled by the configured gap setting.

## Remaining limitations
- QR image rendering currently depends on the external QR Server endpoint.
- Native camera QR scanning is browser-dependent; manual entry is the fallback.
- QR image rendering currently uses an external QR Server endpoint; candidate UUID and chest number are encoded in the QR payload.
- Camera scanning depends on browser `BarcodeDetector` support, camera permission and HTTPS; manual chest entry remains available as a fallback.
- Production build/typecheck could not be verified because dependency installation timed out in this environment. Run `npm ci`, `npm run build`, and the integration/staging checks before deployment.
