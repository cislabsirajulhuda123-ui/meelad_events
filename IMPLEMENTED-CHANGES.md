# Noorun Ala Noor website update

## Implemented in this update
- Media gallery uploads accept files up to 10 MB in the UI and API payload limit.
- Result poster-template upload controls accept files up to 10 MB.
- Added a result announcement workflow: queue a result in Announcements, mark it Announced to publish it, or use Direct publish to make it public immediately while keeping it in Announcements until confirmed.
- Added an Announcements tab in the Main Admin portal.
- Added a Top Scorer enable/disable setting and hide the Top Scorer navigation/page when disabled.
- Added a leaderboard point-gap display setting and point-gap labels in leaderboard rows.
- Added custom category creation/deletion controls in the admin content area; event category values can use custom category keys.
- Added delete controls for teams that are not referenced by existing results.
- Candidate registration now separates Stage and Off-stage programme selection and labels group programmes.
- Candidate class/identification field and automatic team-letter + four-digit chest number were already present and are retained.

## Still requires a separate implementation phase
- Dedicated Result Controller accounts with admin-managed permissions.
- Main Invigilator and Invigilator portals with per-event participation open/close controls.
- QR generation and QR-scan participation tracking connected to candidate records.
- Only participants marked present being eligible for result entry.
- Animated leaderboard graph with a true five-result interval and category-wise top-scorer calculation controls.
- Candidate poster printing with name, QR, class and chest number, excluding result data.
- Separate Group Programme registration workflow beyond the stage/off-stage grouping.

## Deployment note
The project uses a database configured through environment variables. Database-backed features should be tested on a staging deployment before production. A full production build could not be verified in this environment because dependency installation did not complete.
