# ForgePilot accounts and cloud saves

## Intent

Players can keep using the calculator and local saves without an account. A player who signs in can save and recover named WoW builds across browsers. An account provides a stable identity for a later subscription product; this release does not charge or restrict the calculator.

## Architecture

- Use Clerk's React SDK for sign-in and its backend SDK to authenticate a bearer session token on each cloud-build API request. Keep the secret key on Vercel only. Configure the production Clerk instance for `buildforgetools.com` using the free plan.
- Continue using the existing private Vercel Blob store for up to 20 cloud records per account. Store one validated JSON record per build at a server-derived path under `forge-pilot/<Clerk user ID>/`. Client input cannot choose the storage prefix. Never publish blob URLs.
- A single `/api/forge-pilot-builds` endpoint lists, saves, renames and deletes the current user's records. All methods require a valid session. Mutations require the site's origin, bounded request bodies, known classes and a valid saved-build schema. Cloud records retain the original build code and data version; no implicit migration or current-version validity claim.
- Keep the present local collection untouched. Signed-in users see cloud and local records separately. They can explicitly import the current browser's local records; import is idempotent by class, version, code and level, and failures do not remove local copies. Signing out clears displayed cloud records immediately.
- Use Clerk's existing modal for sign-in. Do not add an indexable login page, change existing URLs, titles, H1s, canonicals, or sitemap entries. Update only the affected calculator body and privacy copy, and record the approved Paladin SEO body fingerprint.

## Boundaries and failure behavior

- Cloud actions fail closed when Clerk or Blob is unavailable; local save and share continue working.
- Keep payment, plan gates and subscriptions out of this release. Future paid entitlements must be checked server-side against the authenticated user, not a browser flag.
- Account deletion and Build removal must be clearly explained in the privacy page. Players can remove their saved records; deleting an account requires cloud-record cleanup before or through an identity-provider deletion integration.
- Never put DeepSeek, Clerk secret, Blob token, or another server credential in browser code, commits, response bodies or logs.

## Verification

Test unauthorized/cross-account API isolation, schema and limit enforcement, idempotent import, local-save preservation, sign-out clearing, and the still-working guest flow. Run full tests, lint, typecheck, production build/SEO validation, then verify the live login and cloud API through a real user session before claiming cloud sync works in production.
