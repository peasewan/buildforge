# ForgePilot local tracker implementation plan

1. Add a tested, class-neutral saved-Build model and a separate bounded localStorage adapter. Preserve source versions and raw share codes. Reject malformed records, never discard unknown talent IDs before inspection.
2. Add deterministic status inspection against the published dataset. Only matching-version allocations can become ready or invalid; all unknown/newer-version cases require review. Do not implement migration.
3. Add an inline ForgePilot saved-Build experience to the Paladin and generic class calculator summaries. Support explicit save, list, rename, remove, reopen, and clear storage failures. Preserve existing Copy Build behavior and current draft keys.
4. Add a constrained server-side DeepSeek explanation endpoint based on repository-approved facts. Keep status decisions in code, read the API key from server environment, and provide a usable fallback.
5. Add focused unit and component tests first, observe their expected failures, then implement each slice. Verify full tests, TypeScript, lint, production build and SEO. Record only the approved Paladin body/link fingerprint change required by the existing SEO guard; do not alter metadata or sitemap.
6. Commit on an isolated branch, integrate to main after verification, push, wait for Vercel, and smoke-test the production calculators and saved-Build flow. Confirm noindex/canonical and sitemap behavior remain unchanged.
