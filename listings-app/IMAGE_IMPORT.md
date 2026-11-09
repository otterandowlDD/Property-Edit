# Image import status — 9 November 2026
Current Sheet1 audit: 139 detailed rows, 135 available listings, 135 readable folder inventories, 1,407 supported image files enumerated. Enumeration is not binary download or visual verification. No missing-image folder in this audit. Publication rights are unverified for all 135, so zero photos were imported and zero published mappings are verified.
Two sample property documents (IDs 2 and 4) contain descriptions and rental terms, not permission to republish photography. Drive access/shared=true does not establish copyright or marketing permission. No sharing settings were changed.

## Approval and import
Keep originals in Drive. Obtain partner/owner approval explicitly covering both website display and storage in a public GitHub repository. Add one entry to content/image-approvals.json with listingId, folderId, website:true, publicRepository:true, evidence (nonsecret reference), approvedBy, approvedAt (ISO timestamp), and fileIds (explicit approved Drive image IDs). Do not put private correspondence or credentials in Git.
From listings-app, with its dependencies installed and server-side GOOGLE_SERVICE_ACCOUNT_JSON configured:
- node scripts/import-images.mjs --dry-run --limit=2
- node scripts/import-images.mjs --limit=2
- Review the two listings, image identity, permissions, and actual desktop/mobile gallery before bulk import.
- node scripts/import-images.mjs
- npm run build

The importer rechecks current Sheet1 availability, rejects duplicate IDs, paginates folders, verifies file membership and image signatures, limits files to 12 MB, and never changes sharing. Canonical files stay at repository images/rent/; a public mirror at listings-app/public/images/rent/ allows the separate Vercel root to serve them. Filenames contain listing ID, full Drive ID and full SHA-256; writes reject collisions. No old image files are deleted or overwritten. A rerun removes unavailable or unapproved entries from the active manifest, preserving physical assets. Review and commit generated files to the feature branch; deploy the exact commit to the separate Preview project.

The card gallery and cover/image routes use only imported manifest paths. Unapproved source rows do not trigger Drive image requests. Missing or broken photos show a truthful placeholder. Existing manually approved single-image records remain supported. Original homepage, rent pages, styles, contact links, photographs and production branch are unchanged.
Remaining checks: approved binary sample, visual matching and gallery interaction, bulk import, actual image responses, publication-rights evidence.
