# ForgePilot account sync implementation plan

1. Provision a free Clerk application for `buildforgetools.com`, connect production/development keys to the Vercel project, and identify the public build key without exposing server secrets.
2. Add account/auth context to the Vite client while keeping static prerender output and the guest calculator unchanged. Add test-first coverage for signed-in, signed-out and missing-configuration rendering.
3. Add server-only cloud saved-build validation and private Blob repository. Write failing tests for malformed records, account-path isolation, duplicate import, deletion and the 20-build cap, then implement.
4. Add authenticated Vercel API CRUD methods with method/body/origin checks and Clerk session verification. Test unauthorized and cross-account access before implementation.
5. Add ForgePilot UI controls for sign-in, cloud save/list/rename/delete and explicit local import. Keep local data after import, clear visible cloud state on sign-out, and test these user-visible outcomes.
6. Update privacy/related copy and narrowly amend the Paladin SEO gate. Run focused and full tests, lint, typecheck, build and diff review. Push to `main`, wait for Vercel and verify production with an actual account session.
