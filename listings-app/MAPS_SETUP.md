# Google Maps project discovery

Continues PR #1 and the one-private-cover MVP. Photos, Drive IDs, LINE evidence and credentials are not part of this feature's public directory. No galleries or additional imports.

## Current coverage — 2026-11-10

135 rows marked ว่าง were freshly checked in Listing / Sheet1. The normalized directory has 124 projects, including 11 reviewed duplicate groups. Case, whitespace and dashes are normalized; explicit Thai/English alias pairs are reviewed. Rhythm Ekkamai Estate and Rhythm Ekkamai remain separate, as do The Address Siam and The Address Siam Ratchathewi. PG RAMA 9 has a conflicting source area and remains pending.

Two project points have primary-source evidence: Quintara MHy'ZEN Phrom Phong uses the developer's named Google Maps marker and directions destination; Life Asoke Hype uses the developer's named Google map location data and address. These cover 3 listings (4, 72, 74). The other 122 projects have null coordinates and are excluded from map markers. These are project locations, not unit/owner addresses. Evidence URLs, confidence, verification date and pending reasons are in content/projects.json. A Google Places identity check has NOT been performed. Do not promote search-result coordinates, viewport centers or fuzzy matches to verified points.

## Configuration required

The Preview project currently has no Maps key or Map ID. Billing and Cloud restriction settings cannot be verified through the connected Vercel account. The UI remains usable via project selection and listing filters, and explicitly reports map unavailability. This is not a working live Google map until configured.

In the owner's Google Cloud project:

1. Enable billing and Maps JavaScript API. Create a JavaScript map ID for AdvancedMarkerElement. Do not use somebody else's website key or a demonstration Map ID.
2. Create a dedicated browser key restricted to **Maps JavaScript API** and **Websites (HTTP referrers)**. Allow the exact stable Preview domain `https://property-edit-listings-preview.vercel.app/*` and the exact Vercel Preview hostname(s) being tested. Do not allow `*.vercel.app`, all origins or production unnecessarily. Local testing, if needed, uses a separate restricted development key.
3. Set Preview-only Vercel variables: GOOGLE_MAPS_BROWSER_KEY, GOOGLE_MAPS_MAP_ID, GOOGLE_MAPS_ALLOWED_HOSTS (comma-separated exact hostnames without schemes or paths).
4. Only after checking API and referrer restrictions, set GOOGLE_MAPS_RESTRICTIONS_VERIFIED=true. This is an operator attestation; the app cannot inspect Cloud API key restrictions. Redeploy Preview and verify the live Google SDK, billing, pan/zoom and marker clicks in a signed-in session. Keep Vercel Authentication enabled.

No real key is committed. Browser Maps keys are visible to browser users by design; restrictions are mandatory. The app fails closed without the verification flag, key, Map ID or allowed host and does not request a substitute map provider.

## Availability and photos

When a Google service account is configured, the page reads current Sheet status and excludes rows no longer marked ว่าง. Otherwise it uses the dated 2026-11-10 snapshot with an explicit non-live warning. Recheck source status before updating the snapshot; this is not unattended synchronization or independent confirmation of vacancies. Current listing facts and original IDs are preserved. Project filters use IDs, not substring grouping. Private covers still go through the existing manifest-restricted photo route. Map cards use that same cover URL/fallback.

## Verification

Run npm run typecheck and npm run build. Tests use an isolated Google SDK double to verify marker construction, project grouping, fit bounds, selections, filters and cleanup without a billable key. This does not verify real Google Maps API access, rendered tiles or Cloud restrictions. Test absent key, rejected host, script failure, auth failure, missing coordinates, broken photos and mobile overflow separately. Keep these limitations in the deployment report.
