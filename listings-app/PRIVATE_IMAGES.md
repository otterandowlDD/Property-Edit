# Single-cover MVP — 10 November 2026
One listing uses one selected cover. Gallery controls are disabled. Drive originals and all 27 previously stored photos for IDs 2 and 4 are preserved; unused photos are not deleted. The previous gallery manifest is archived privately.

Website-use permission is recorded privately under PE-WEB-20261109-TER. This scope includes website display and storage of website copies, not Public GitHub photographs or social posts. No permission screenshot, credentials, photo bytes, or private source inventory are committed.

The private Blob manifest remains manifests/listing-images-v2.json (mode one-cover), with exactly one active image per imported listing. Website routes check Listing ID and SHA-256 against that manifest before streaming a private WebP copy. Public source-code manifests remain unchanged.

scripts/import-covers.mjs consumes the privately prepared inventory and reviewed ID-to-photo-index selections. It reuses existing selected private images, imports at most one selected source per remaining listing, decodes/transforms each cover, verifies private-storage readback, and reports failures and exact hash duplicates. Current selections use unit interiors; three collage-only source files were cropped to one actual room photograph. All originals remain unchanged. The multi-photo importer is disabled for this MVP.

Execute only after refreshing available rows and verifying ID/folder mappings. Current import is a reviewed snapshot, not unattended live synchronization. Availability, prices and transaction terms require partner confirmation. Preview remains separate from production and requires Vercel Authentication; no public authentication bypass is created.
