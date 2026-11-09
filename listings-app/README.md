# Property Edit — Google Drive Live Listings (review branch)

This is an **isolated Next.js app** at `listings-app/`. The current live static homepage and production deployment are deliberately unchanged.

## Source
Shared Google Sheet `Listing` (Sheet1), inspected on 9 November 2026:
https://docs.google.com/spreadsheets/d/1anVMS2cE4MsWxN3ez0jScycv1gbL77NPWV58L9bsISo/edit

Reads A:M: ID, Status, room_image (Drive folder URL), location, name, rent, sale, size, floor, building, bedroom, Posting Date, Start of contract. Only rows marked **ว่าง** are displayed. This status is asserted by the supplier spreadsheet and **not confirmed independently with owners**.

## Enable live images and inventory
1. In Google Cloud, enable Google Sheets API and Google Drive API.
2. Create a Google service account with read-only access, and grant its email **Viewer** access to the source spreadsheet and the individual listing image folders (or suitable shared parent).
3. Set **server-side environment variables** in the Vercel project:
   - `GOOGLE_SHEET_ID=1anVMS2cE4MsWxN3ez0jScycv1gbL77NPWV58L9bsISo`
   - `GOOGLE_SHEET_TAB=Sheet1`
   - `GOOGLE_SERVICE_ACCOUNT_JSON` = raw JSON credential or base64 JSON. Set this **only** in the Vercel Environment Variables interface; never commit it.
4. Configure a **separate Vercel project** (Root Directory `listings-app`) or a deliberate migration plan for the existing static site. Do **not** repoint the existing production Vercel project automatically.
5. Run `npm install && npm run build` with Node 20+ before production release.
6. Verify photo publication permissions, folder sharing, live status, commissions and displayed prices. Review on desktop and mobile. Until approval, the app is configured with `robots: noindex`.

## Important
- If no credentials exist, the UI displays **no actual listings** and an explicit connectivity notice; it does not falsely label demo rooms as live.
- Photos are served by a server-side route only when their Drive parent belongs to a sheet row marked available. The Google private key is never provided to the browser.
- Image endpoint responses are public to visitors of the listing site, so **do not grant this service account access to confidential image folders**. Only approved listing folders.
- Photo ordering is alphabetical by filename, first supported jpeg/png/webp.
- Current public homepage currently contains an older LINE contact in its content; the new listing app uses `@569xetng`. Correct the old content in a separate reviewed change.
- GitHub branch/PR does not deploy automatically and no Google credentials have been configured by this change.

## Local test
```bash
cd listings-app
npm install
cp .env.example .env.local
npm run dev
```

This branch is a functional implementation for review, not a verified production deployment.
