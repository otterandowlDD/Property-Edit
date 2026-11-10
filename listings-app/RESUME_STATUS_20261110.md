# Resumed Maps implementation — 10 November 2026

Owner explicitly authorized continuation from c19f4146dc989126b90285fc98ae749abf5891f7 in PR #1. Existing repo, app, IDs, private cover manifest and gallery-free horizontal cards are reused. The historical pause checkpoint is retained for audit.

## Completed after resumption

- Read checkpoint and confirmed PR head before changes. Re-read Sheet1 A1:M141: 135 source-available listings; exact available-ID sequence matches the dated safe snapshot. No Sheet writes.
- Verified two additional project points from exact primary developer page titles and named location.map lat/lng/address: Life Asoke–Rama 9 (ID 17), 13.754928 / 100.564536; Rhythm Ekkamai Estate (ID 36), 13.7292864 / 100.5858317. These are separate from Life Asoke Hype and Rhythm Ekkamai. Sources are stored per project.
- Total: 124 normalized projects, 4 developer-map verified project points, 5 mapped listings (4, 17, 36, 72, 74), 120 projects pending. No approximate pins. Google Places identity checks have not been performed. Pages returning generic/home content or no usable structured map data were not promoted to verified.
- Fixed project-summary cover identity: if a bedroom filter switches the representative unit within the same project, the cover component remounts so a previous broken image does not suppress the new valid cover.
- Added explicit Next outputFileTracingRoot for the existing app; parent-lockfile build-root warning is resolved.
- Extended the saved integration suite with tablet, hostname rejection, real single-cover loading and broken-cover recovery. No duplicate app or photo import.

## Actual validation

Production build exited 0, including TypeScript checks and page generation. The resumed browser suite exited 0 with 20 checks; full sanitized results: tests/map-discovery-resume-20261110.json. Four markers use exactly the recorded coordinates and one marker per project in the SDK-double test. Two full marker → summary → project-list interactions passed, as did list-to-map, alias grouping, filter intersections/reset, 390px mobile and 820px tablet overflow, missing coordinates, broken image recovery, network/auth failure and unapproved hostname rejection. No browser JavaScript exceptions in the tested paths. Private covers loaded through the existing authorized website photo routes; all 135 cards retain a single cover. Local test servers were stopped afterward.

These map interactions use an isolated SDK double. They do not demonstrate live Google tiles, real pan/zoom, billing or Google API access. No test credentials are deployed or committed.

## Current blockers / remaining work

- Preview environment was rechecked: no Google Maps browser key, Map ID or restriction-verification flag. Google Cloud billing, Maps JavaScript API enablement and API/referrer restrictions remain unverified; the connected Vercel account cannot configure or certify those Google Cloud settings. Do not use another site's key or invent one.
- Configure the dedicated browser key with Maps JavaScript API restriction and exact Preview HTTP-referrer restrictions; configure the JavaScript map ID and exact allowed hosts. Keep the fail-closed gate until restrictions are checked. See MAPS_SETUP.md. Use Vercel environment settings directly; do not paste credentials into repository files.
- Verify the remaining 120 project locations with authoritative evidence; ambiguous entries remain excluded. Source availability is a dated snapshot until a permitted Sheet service-account connection is configured, and still requires partner confirmation before viewing.
- After valid Maps configuration, test the real SDK, pan/zoom, accessible marker selection and imagery on the protected Preview with an authorized signed-in session. The actual live-map marker count is currently zero because Maps is not configured.

## Deployment and preservation

The resumed owner instruction authorizes the existing Preview workflow. A manual Preview deployment is to be made from the exact resumed commit to project property-edit-listings-preview (prj_WbSI7YpIgDKCYukCWdtxZNodJxJK), team_bqORBqTjq0AQ7RCWdNDpbjq5. Record the actual deployment URL/status in PR #1 after verification; this file does not assert an unobserved deployment success.

Feature-branch automatic-deployment guards remain in root and app vercel.json, preventing unintended automatic deployments to any other connected project. They do not request a production deployment. Vercel Authentication remains enabled. No production merge or social publication.

All 135 private covers and previous 27 stored photos are preserved. No storage writes, new imports, photo deletions, source Drive changes or publication of private evidence. Only sanitized project/listing data, source code and aggregate test evidence are committed. Local screenshots remain private/transient.
