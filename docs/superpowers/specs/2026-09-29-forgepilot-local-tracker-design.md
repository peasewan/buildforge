# ForgePilot local Build tracker

## Goal and constraints

Let a WoW Forever player save multiple named talent allocations, reopen them, and see whether the site can validate the saved allocation against its published dataset. This is a browser-local MVP: no account, synchronization, payment, notifications, or automatic migration. It must not change existing calculator URLs, titles, H1s, canonicals, or sitemap entries.

The Paladin and eight class calculators already keep one editable draft per class. ForgePilot adds a separate explicit saved-Build collection, capped at 20 records, without changing those draft keys or share-link formats. The first entry point is a Save action in calculator summaries and a compact in-calculator saved-Build panel. No public landing or crawlable private route is added in this phase.

## Data and status model

Each saved record retains a stable local ID, player-assigned name, class ID, level, exact original encoded allocation, source URL when imported, source dataset version, and save timestamp. Saving the current calculator uses that calculator's published dataset version. Importing a legacy share URL with no embedded version records an unknown source version; it never silently labels it as the current dataset. Browser storage failures show a clear message and leave the calculator usable.

Inspection runs deterministic validation against the published talent dataset only when the source version matches. It retains raw talent IDs before decoding, checks rank caps, point budget, and prerequisite/row legality, and reports `ready`, `invalid`, or `needs_review`. An unknown or different source version reports `needs_review` until a reviewed cross-version mapping exists. The September 24 patch notice for build 70009 is an announcement with `pending_reconciliation`; the deployed calculator remains on 69913 and ForgePilot must not present 70009 as verified or auto-migrate to it.

## DeepSeek boundary

A server-only Vercel endpoint reads `DEEPSEEK_API_KEY` from the environment. The browser sends only whitelisted class and version identifiers, never player names, full allocations, or arbitrary prompts. The server supplies reviewed patch facts and asks DeepSeek to select at most two relevant class-level facts; all published wording, status, source links, and the explicit pending-reconciliation caveat remain under code control. Requests are limited and fact selections cached per warm function instance to reduce replay cost; this is not a global rate limit. If the key or provider is unavailable, the UI retains its deterministic status and explanatory fallback. No key is committed or sent to the browser.

## Experience and verification

Players can save their current allocation, rename or delete a saved record, reopen its original share link in the calculator, and inspect its status. Saved records stay in the same browser. Use inline controls so SEO discovery and metadata remain unchanged. Test raw-code retention, unknown versions, malformed imports, storage errors, cross-class links, deterministic legality, AI endpoint constraints, and the UI flow. Run typecheck, tests, lint, production build, SEO validation, and production smoke checks before publishing.
