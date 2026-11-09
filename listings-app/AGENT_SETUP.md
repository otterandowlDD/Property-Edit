# Property Edit Listing Agent

## Current state (9 November 2026)
Implemented on a separate review branch, under `listings-app/`, without modifying the original static property-edit homepage.

- `/agent` — paste one JSON listing or choose a live Google Sheet row by ID.
- `/api/agent` — server-side authorization, validation, idempotent duplicate rejection, caption generation, per-channel publish result.
- `/property/[id]` and `/` — display only records explicitly approved and saved by the agent. Merely being marked `ว่าง` in a third-party sheet does **not** publish a property.
- Explicit marketing-permission confirmation required on each POST.
- Source row ID import requires live Google Sheets service account access; missing credentials are a blocker, never a simulated success.
- GitHub records are written to `listings-app/content/published.json` on the configured **review branch** when credentials are configured, keeping durable channel status and captions.
- Direct Facebook Page / Instagram Graph API publishing is conditional on valid server-side access. No API-confirmed published ID means no social success. Metricool connected account checked on Nov 9: no social networks connected.

## Required environment variables (Vercel > project settings)
Set these in the separate `property-edit-listings-preview` project. **Never paste secrets into GitHub files or this chat.**
- `PE_ADMIN_TOKEN`: strong random password entered manually in the /agent UI.
- `PE_GITHUB_TOKEN`: fine-grained token with contents write permission restricted to `otterandowlDD/Property-Edit`. Server-side only.
- `PE_GITHUB_REPO`, `PE_GITHUB_BRANCH`: exact repo and agent branch.
- `PE_PUBLIC_SITE_URL`: URL that will host the listing app; current Vercel preview is access-protected, not a verified public website.
- `GOOGLE_SERVICE_ACCOUNT_JSON`: service account granted Reader access to approved source Sheet and photo folders, and the Google APIs enabled. Or paste the full listing data manually and use an authorized HTTPS image URL.
- To publish to Facebook without Metricool: `META_FACEBOOK_PAGE_ID` and `META_FACEBOOK_PAGE_TOKEN` with required Page permissions.
- To publish to Instagram: `META_INSTAGRAM_ACCOUNT_ID` and `META_INSTAGRAM_TOKEN` for the eligible professional account + a **publicly accessible, authorized HTTPS image URL**. A private Google Drive share page or protected Vercel URL is not a usable Instagram image URL.
- Always verify Meta app review, account publishing permission and valid token lifetime; Graph API permissions are subject to Meta policy changes.

## Example listing paste
```json
{
 "id":"PE-001",
 "status":"ว่าง",
 "name":"Example Residence",
 "location":"Bangkok",
 "rent":25000,
 "sale":null,
 "area":"40",
 "bedrooms":"1",
 "folder":""
}
```
Illustrative example only; **not a real available unit**. The dashboard placeholder is also illustrative.

## How execution works
1. Browse `/agent`. Enter admin token (held only in temporary React state).
2. Paste JSON or select a Sheet source ID. Supply an approved public image URL if Instagram publishing is intended.
3. Affirm actual marketing and photography rights. Click Validate & Publish.
4. Server checks inputs and duplicates, generates factual caption, saves approved listing to GitHub branch.
5. Each configured social channel is called separately. Every outcome is shown, including `needs_connection`, `failed`, or `skipped`. Successful social publishing requires an API response ID.
6. Verify the listing via the Vercel branch deployment, then independently verify the Facebook/Instagram public post links and images.

## Important limitations before going live
- No social networks are currently connected to Metricool; no credentials have been configured here. There have been **zero confirmed Facebook or Instagram posts** by this agent.
- The Vercel listing project currently requires Vercel Authentication. Publishing records to a GitHub review branch is not equivalent to making those records visible on the original public homepage.
- This MVP does not currently have job queues, media processing, automatic permission discovery, provider retries, or a delete/unpublish dashboard. Status should be checked before enabling fully unattended operation.
- Website content and social content can diverge on provider errors. Audit persistence is reported separately if updating the status log fails.
- This is a controlled integration for reviewed listings; it deliberately does not bulk-publish the 135 spreadsheet rows.
- The existing production homepage is untouched. Public release requires explicit deployment and rights/quality checks.
