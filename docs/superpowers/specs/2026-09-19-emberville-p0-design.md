# Emberville P0 Design

## Goal

Launch an indexable Emberville topic cluster on BuildForgeTools before Early Access, centered on a useful pre-release build-planning surface that publishes only sourced, confirmed mechanics.

## Public routes

- `/emberville` — primary Emberville Build Planner and canonical tool entry.
- `/emberville-builds` — build-intent hub organized around melee, magic, ranged, and hybrid planning directions.
- `/emberville-classes` — class-system explainer with a deliberately pending class directory.
- `/emberville-skill-inheritance` — focused guide to the confirmed active/passive inheritance mechanic.

All four routes are `index, follow`, self-canonical, included in `public/sitemap.xml`, statically prerendered, and linked to each other. There is no `/emberville-build-planner` duplicate. The site root continues to redirect to `/paladin`; every existing WoW URL, title, canonical, navigation target, and sitemap entry remains unchanged.

## Source and claim policy

The only production claims are supported by the official Steam page or Cygnus Cross developer material:

- Early Access release is planned for October 27, 2026.
- Early Access includes equipment and skills systems, melee/magic/ranged combat, and a combat class system.
- Classes can be changed after they are learned.
- Learned classes can contribute inheritable active and passive skills.
- Weapon categories progress independently; the developer currently describes 16 planned weapon categories and 13 planned classes.

Do not publish unverified class names, weapon names, skills, slot counts, costs, unlock thresholds, numerical effects, optimal builds, or compatibility rules. The planner mockup labels unavailable selectors and slots as awaiting confirmed data. Conceptual examples use roles such as melee, magic, ranged, utility, offense, and defense instead of invented entities.

Every Emberville page displays:

- `Pre-Early Access`
- `Core mechanics only`
- `Updated Sep 19, 2026`
- links to the official Steam and Cygnus Cross sources
- a visible distinction between `Confirmed`, `In review`, and `Coming soon`

## Information architecture

Emberville data lives in a dedicated typed module separate from WoW talent data. Page content, source links, metadata, route definitions, React rendering, and prerender output consume that shared module so visible and crawlable claims cannot drift apart.

The existing `SiteFooter` gains one small `Emberville Planner` link so the new cluster is discoverable from established pages. Emberville pages use their own header and footer but retain the BuildForgeTools brand and link back to `/paladin` as the existing WoW tool.

## Planner behavior

The `/emberville` planner is a real interactive preview rather than a screenshot:

- Players choose one confirmed combat direction: melee, magic, ranged, or hybrid.
- Class and weapon selectors remain disabled with `Awaiting confirmed data` labels.
- Active, passive, and inherited skill slots are displayed as disabled tracked modules.
- A build-notes textarea accepts up to 500 characters and persists in local storage.
- The summary updates when the combat direction changes.
- The page records `emberville_style_select` when a direction changes and `emberville_notes_save` when persisted notes change from empty to non-empty.

No share URL is generated until enough confirmed identifiers exist to create a stable build schema.

## Visual design

Use the supplied dark-fantasy artwork as atmosphere, with a black/charcoal base, ember orange, lava red, cool blue accents, muted slate copy, green confirmed states, and amber preview states. The UI follows the supplied mockups while remaining responsive and accessible.

Asset mapping:

- Primary planner hero: the wide dark-left Emberville city artwork.
- Builds hub: the fortress walkway artwork.
- Classes: the forest-and-city artwork.
- Skill inheritance: the orange/blue portal artwork and the wide connected-statues artwork for the inheritance flow section.

Use Lucide icons for interface symbols. Do not extract or ship the reference mockup screenshots as page UI.

## Page content

### `/emberville`

Hero, live planner preview, status strip, confirmed mechanics, planning-value cards, data coverage, and related-page links. Title: `Emberville Build Planner (Pre-Early Access) | BuildForgeTools`.

### `/emberville-builds`

Hero, four build-direction cards, planning principles, confirmed mechanics, data-status explanation, planner CTA, and related tools. It does not claim that published optimal builds exist.

### `/emberville-classes`

Hero, confirmed class-system facts, how classes affect build planning, a pending class directory, source transparency, and related links. It explicitly says the tracked sources do not yet provide the complete class list.

### `/emberville-skill-inheritance`

Hero, a visual Base Class → Learned Class → Active/Passive Inheritance → Final Build flow, confirmed facts, conceptual planning benefits, source transparency, and planner CTA.

## SEO and structured output

Each page has one H1, unique title/description/canonical/Open Graph metadata, crawlable prerender content, and internal links. Use `WebApplication` structured data for `/emberville` and `Article` or `CollectionPage` for the guide/hub pages. Keep the current canonical host `https://buildforgetools.com` and update only the sitemap additions required for these four URLs.

## Validation

- Route tests prove unique metadata and indexability.
- Page tests prove the confirmed-data wording, absence of invented names, planner state behavior, and mutual internal links.
- Prerender tests prove each route has one H1, source links, and crawlable confirmed copy.
- Existing route, canonical, sharing, data-pipeline, and WoW UI tests remain green.
- Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` before publishing.
