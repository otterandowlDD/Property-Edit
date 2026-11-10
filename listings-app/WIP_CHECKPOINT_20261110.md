# WIP CHECKPOINT — PAUSED BY OWNER — 10 November 2026

Historical checkpoint. The owner explicitly authorized continuation on 10 November 2026; see RESUME_STATUS_20261110.md for resumed work. The stop instruction below records the earlier pause, not a new restriction.

STOP. Do not resume development, imports, browser work, deployments, merging or social publication automatically. Continue only after the owner explicitly authorizes it.

Existing repo: otterandowlDD/Property-Edit. Existing PR #1. Feature branch: feature/google-drive-live-listings-20261109. Base: 53b860c586927d3b81106bd30f62a82fcbd30b15. This checkpoint is incomplete Maps work, not a release.

## Completed

- Refreshed read-only Listing / Sheet1 data: 135 rows marked ว่าง (139 detailed source rows, 4 unavailable excluded). No source Sheet writes.
- Normalized 124 project groups, 11 duplicate groups, preserving all Listing IDs. Explicit Thai/English aliases; similar phases/buildings not blindly merged.
- Two primary-source developer-map points recorded with source URLs and confidence: Quintara MHy'ZEN Phrom Phong (ID 4) and Life Asoke Hype (IDs 72, 74). Other 122 projects have null coordinates and are excluded from markers. Developer Google map evidence, not a Google Places API certification.
- Added official Maps JavaScript SDK loader and AdvancedMarkerElement integration, brand owl SVG, selected marker style, bounds fitting, project summary with existing private cover, project filtering and map/list selection.
- Existing rent/price/bedroom filters remain; search supports aliases and area; reset and pending-location behavior added. No galleries or new photo imports.
- Availability uses live Sheet when service-account access exists; otherwise explicitly dated 2026-11-10 snapshot, requiring status confirmation.
- Preview Maps setup documented with required browser key API/referrer restrictions, map ID and exact allowed hosts. Missing configuration fails closed and project selection remains usable.
- Stopped both local test servers. No deployment was created for Maps. The local production build already running when STOP arrived completed successfully; no new build/test was started after STOP.
- Added branch-specific automatic Vercel deployment guards in root and listings-app/vercel.json solely to prevent this checkpoint push from deploying. Production branch defaults are unaffected. Review/remove these guards only after renewed deployment authorization.

## Files changed/new in this checkpoint

- vercel.json — feature-branch auto-deployment pause only
- listings-app/vercel.json — same guard for Preview project root
- listings-app/.env.example — empty Maps configuration placeholders
- listings-app/app/page.tsx — dated/live availability filtering and gated Maps config
- listings-app/app/property-browser.tsx — synchronized project selection/search/filter UI
- listings-app/app/project-map.tsx — Maps, owl markers, summaries, fallback directory
- listings-app/lib/google-maps.ts — official SDK loader and boundary types
- listings-app/lib/projects.ts — directory grouping/search/verification helpers
- listings-app/content/projects.json — project directory and evidence; no private photos or unit numbers
- listings-app/content/listing-availability.json — safe dated listing facts; no Drive folder URLs
- listings-app/public/markers/owl.svg — original lightweight owl asset
- listings-app/tests/map-discovery.mjs — reproducible browser integration test
- listings-app/tests/map-discovery-checkpoint-20261110.json — actual completed test results
- listings-app/MAPS_SETUP.md — setup, limitations and data policy
- listings-app/WIP_CHECKPOINT_20261110.md — this checkpoint

## Verification and limits

- TypeScript passed before the last small source changes; the subsequent final production build compiled, type checked, generated pages and exited 0.
- Completed browser integration suite exited 0: 17 recorded checks, including 2 marker → summary → project-list interactions, list → map selection, exact recorded marker points, duplicate grouping, aliases, price intersection/reset, no-result cleanup, missing coordinates, 390px mobile overflow check, broken/missing project-cover fallback, SDK network failure and authentication failure. No browser JavaScript exceptions in the tested paths.
- SDK interactions were tested with an isolated Google SDK double. They do NOT verify live map tiles, pan/zoom, billing or actual Google API authorization.
- Real private covers were displayed in local desktop/mobile screenshots during integration checks. No new covers imported; existing private image delivery was reused.
- After the successful browser suite, small edits preserved existing floors, guarded against an auth-failure initialization race, and strengthened test assertions for cover count/load. The final build passed these source edits, but the strengthened browser suite has NOT been rerun because work is paused.
- Build warning: Next inferred a parent workspace root because multiple lockfiles exist. Build still passed; review outputFileTracingRoot when work resumes.

## Remaining tasks / blockers

1. Google Maps browser key and Map ID are absent from the Preview environment. Billing, Maps JavaScript API enablement and Google Cloud key restrictions cannot currently be verified. Do not invent credentials or use another website's key.
2. Configure a dedicated API-restricted and exact-referrer-restricted key plus map ID/host list; only then set the restrictions-verified flag. Review deployment pause guards after renewed authorization.
3. Verify 122 pending project locations using reliable Maps/Places evidence; resolve ambiguous names and source-area contradictions (e.g. PG RAMA 9). Do not approximate pins.
4. Rerun the strengthened integration suite, add host-rejection/tablet coverage and test the actual Google SDK with permitted credentials. Verify live pan/zoom/accessibility and coordinate identity.
5. Deploy/test this WIP only after explicit owner continuation. Keep Vercel Authentication enabled. A signed-in session is required for browser testing of the existing protected Preview.

## Preserved / deliberately excluded

All 135 active covers and earlier 27 stored photos remain in existing Private Storage. No Blob writes/deletes, Drive changes, customer communication, production merges or social actions occurred in this Maps task. Private manifest/source inventory, token values, property photo bytes, LINE evidence and local screenshots are excluded from this Git checkpoint. Existing private storage remains their source of truth. Local screenshots and runtime cache under /tmp are transient, not a remotely preserved artifact; their test outcomes are saved in the sanitized report. No application source changes are intentionally omitted from this checkpoint. The SDK test environment and node_modules are reproducible dependencies, not committed credentials.

## Existing deployed Preview — unchanged

https://property-edit-listings-preview-drva298g9-otterandowl-dd.vercel.app/

Deployment dpl_8Wq1TwinbVjtcoycy7uL8st1Aa3U, last confirmed READY, cover-image commit 53b860c586927d3b81106bd30f62a82fcbd30b15. This URL does not include the Maps WIP. Vercel Authentication remains enabled.

PR: https://github.com/otterandowlDD/Property-Edit/pull/1
