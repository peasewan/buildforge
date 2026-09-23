# AdSense readiness review — 2026-09-23

This is an internal engineering review, not an AdSense approval prediction. Scope: 153 sitemap URLs on release baseline `2926ce9`, plus the About/Contact/navigation copy update in this change. No ad serving is enabled, no Publisher ID is invented, and no indexability or sitemap change is made. The 22 Paladin pages remain frozen.

## Corrections to the supplied review

- Home and both WoW directories are already published; root is self-canonical and returns 200. The old root-to-Paladin finding is stale.
- The sitemap contains 153, not 150, URLs.
- An interactive element or a distinct allocation is evidence to inspect, not a Google eligibility rule. An empty decorative widget does not establish original value.
- Indexability and ad eligibility are separate decisions. `noindex` does not exclude a page from an AdSense review or make low-value content compliant.
- A valid directory or trust page need not contain a talent calculator. Evaluate it against its actual navigational or informational task.
- No detected construction phrase is not proof of complete content. Protection Warrior PvP explicitly lacks a legal role allocation.
- The public eligibility page does not specify a 10,000-PV requirement. This is not a guarantee that this site will be accepted.

## Changes in this release

About now describes nine-class coverage, versioned field evidence, progression and allocation comparison, and separates editorial recommendations from client facts. Contact states independent operation and retains the existing private feedback workflow. Trust-page logos and discovery navigation lead to the actual site homepage and class directory. No personal email is published.

Privacy still accurately states that third-party advertising is not currently displayed. Do not switch to present-tense AdSense processing disclosures until the integration is actually configured. Privacy notice wording does not itself implement consent controls.

## Rendered-content triage

This is a mechanical scan of all 153 rendered pages, plus source inspection of the shared components. It is not a human evaluation of every article. Counters below measure actual rendered module content, not just page titles or URL names. Legacy Paladin pages are inventoried and protected, not newly judged or approved for ads.

- Zero rendered AdSense script tags detected. There is no ad allowlist enforcement to claim: the site has no ad integration.
- One missing-role-allocation module: `/wow-forever-protection-warrior-pvp-build`. Hold it out of any future ad allowlist pending content review; inspect its existing explanation before deciding on consolidation or indexing changes.
- Four Emberville preview pages need an explicit usefulness review because exact class/skill records are unavailable. The local notes and planning-direction features are not a full skill calculator.
- Two pet pages and one totem page currently provide role planning rather than dedicated pet/totem mechanics. Do not advertise unsupported mechanics.
- 44 pages show the same-allocation comparison message in their default rendered state. These may still have useful distinct explanations; this count does not mean 44 duplicate or policy-violating pages. Prefer a meaningful distinct comparison when supported, or present allocation reuse plainly rather than treating it as new build evidence.
- 30 groups reuse the first displayed calculator allocation across multiple URLs. This includes legitimate cap/progression/role reuse; it is a review queue, not a score. The groups and complete inventory are attached below.
- 49 unique URLs have at least one triage flag; flags overlap. Unflagged pages are not automatically ads-eligible.

## Manual content and ad eligibility gate

For each candidate page, record the user task, the actual useful result, sources/rights, reviewer/date, and residual limits. A tool or table must work and supply substantive value for that task. Check copied client tooltips and game imagery separately: a data source link is not permission to monetize copyrighted assets. Review the surrounding prose and whether another URL already answers the same task adequately. Do not add invented facts or padding to pass a word-count rule.

Default future ad status is **not reviewed / disabled**. Explicitly keep calculators' interaction areas, share URLs, About/Contact/Privacy, and unresolved preview/fallback pages out of the first ad-placement rollout. This is a planned integration policy, not an implemented ad subsystem or an exemption from whole-site review. Search status remains unchanged unless a separate editorial/SEO decision supports a change.

Before an actual AdSense integration:

1. Use the real account's verification method and publisher ID; do not create a fake ads.txt. Google calls ads.txt highly recommended, not universally mandatory.
2. Update Privacy to match actual Google/partner collection, advertising cookies, identifiers, personalization and available controls.
3. Configure the applicable Google-certified TCF CMP and verify region-specific consent behavior for EEA/UK/Switzerland visitors; do not assume non-personalized ads bypass consent requirements.
4. Use explicit placements away from talent nodes, sliders, Copy/Edit controls and content overlays. Keep Auto ads off until exclusions and layout are checked.
5. Verify mobile layout, failed/empty ads, consent rejection/withdrawal and absence of accidental click incentives. Submit for Google's own review; internal gates cannot promise acceptance.

## Verification of this change

34 relevant TrustPage/LegacyIntentExperience tests passed. TypeScript build, lint and SEO validation passed: 153 indexable pages, 22 frozen Paladin pages unchanged, zero SEO errors. Local browser: Contact opens the existing feedback form without submitting a report; About renders on a 390px viewport without horizontal overflow; zero Google script tags on localhost. No URL, title, H1, canonical, robots, sitemap entry or ad runtime was changed.

## Official references checked

- [Page readiness and navigation](https://support.google.com/adsense/answer/7299563?hl=en)
- [Eligibility requirements](https://support.google.com/adsense/answer/9724?hl=en)
- [Privacy disclosures](https://support.google.com/publisherpolicies/answer/10437794?hl=en)
- [Publisher policies: inventory value and placement](https://support.google.com/admanager/answer/10502938?hl=en)
- [Replicated content](https://support.google.com/publisherpolicies/answer/11190248?hl=en)
- [Certified CMP requirements](https://support.google.com/adsense/answer/13554116?hl=en-GB)
- [Ads.txt guide](https://support.google.com/adsense/answer/12171612?hl=en)

## Complete inventory

Flags: **M** missing recommendation; **P** limited preview records; **R** role tool rather than dedicated mechanic; **S** default comparison has the same allocation. No flag is an automatic noindex or ad approval. Numbers count rendered nodes and do not establish originality. Calc indicates an existing calculator marker, not a new interaction test.

| Path | Kind | Calc | Progression control | Rank rows | Diff rows | Talent records | Role tools | Flags |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `/emberville` | emberville-preview | 0 | 0 | 0 | 0 | 0 | 0 | P |
| `/emberville-builds` | emberville-preview | 0 | 0 | 0 | 0 | 0 | 0 | P |
| `/emberville-classes` | emberville-preview | 0 | 0 | 0 | 0 | 0 | 0 | P |
| `/emberville-skill-inheritance` | emberville-preview | 0 | 0 | 0 | 0 | 0 | 0 | P |
| `/paladin` | protected-paladin | 1 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-paladin-builds` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-paladin-talents` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-paladin-build` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-protection-paladin-build` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-retribution-paladin-build` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-retribution-paladin-leveling-build` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-paladin-leveling-build` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-paladin-pvp-build` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-paladin-raid-build` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-protection-paladin-dungeon-build` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-retribution-paladin-builds` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-protection-paladin-builds` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-protection-paladin-leveling-build` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-protection-paladin-pvp-build` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-retribution-paladin-pvp-build` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-holy-paladin-pvp-build` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-holy-paladin-talents` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-retribution-paladin-talents` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-protection-paladin-talents` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-paladin-beta-talent-changes` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-paladin-abilities` | protected-paladin | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/about` | trust | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/contact` | trust | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/privacy` | trust | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/mage` | calculator | 1 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-mage-builds` | buildsHub | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-mage-talents` | talents | 0 | 0 | 0 | 0 | 31 | 0 | — |
| `/wow-forever-mage-leveling-build` | leveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-frost-mage-build` | specBuild | 0 | 0 | 3 | 3 | 0 | 0 | — |
| `/wow-forever-arcane-mage-build` | specBuild | 0 | 0 | 3 | 3 | 0 | 0 | — |
| `/wow-forever-frost-mage-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-arcane-mage-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-frost-mage-aoe-build` | aoe | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-mage-dungeon-build` | dungeon | 0 | 0 | 0 | 3 | 0 | 3 | — |
| `/wow-forever-mage-level-20-build` | levelCap | 0 | 0 | 9 | 0 | 0 | 0 | — |
| `/warrior` | calculator | 1 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-warrior-builds` | buildsHub | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-warrior-leveling-build` | leveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-arms-warrior-build` | specBuild | 0 | 0 | 4 | 0 | 0 | 0 | S |
| `/wow-forever-fury-warrior-build` | specBuild | 0 | 0 | 3 | 0 | 0 | 0 | S |
| `/wow-forever-protection-warrior-build` | specBuild | 0 | 0 | 4 | 0 | 0 | 0 | S |
| `/wow-forever-warrior-talents` | talents | 0 | 0 | 0 | 0 | 53 | 0 | — |
| `/wow-forever-arms-warrior-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-fury-warrior-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-protection-warrior-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-warrior-pvp-build` | pvp | 0 | 0 | 0 | 0 | 0 | 4 | S |
| `/wow-forever-arms-warrior-pvp-build` | specPvp | 0 | 0 | 0 | 0 | 0 | 4 | S |
| `/wow-forever-fury-warrior-pvp-build` | specPvp | 0 | 0 | 0 | 0 | 0 | 3 | S |
| `/wow-forever-protection-warrior-pvp-build` | specPvp | 0 | 0 | 0 | 0 | 0 | 0 | M |
| `/wow-forever-warrior-dungeon-build` | dungeon | 0 | 0 | 0 | 0 | 0 | 4 | S |
| `/wow-forever-protection-warrior-dungeon-build` | specDungeon | 0 | 0 | 0 | 0 | 0 | 4 | S |
| `/wow-forever-warrior-level-20-build` | levelCap | 0 | 0 | 11 | 0 | 0 | 0 | — |
| `/wow-forever-arms-vs-fury-warrior-leveling` | comparison | 0 | 0 | 7 | 7 | 0 | 0 | — |
| `/wow-forever-arms-warrior-talents` | specTalents | 0 | 0 | 0 | 0 | 17 | 0 | — |
| `/wow-forever-protection-warrior-talents` | specTalents | 0 | 0 | 0 | 0 | 18 | 0 | — |
| `/rogue` | calculator | 1 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-rogue-builds` | buildsHub | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-rogue-talents` | talents | 0 | 0 | 0 | 0 | 51 | 0 | — |
| `/wow-forever-rogue-leveling-build` | leveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-assassination-rogue-build` | specBuild | 0 | 0 | 4 | 0 | 0 | 0 | S |
| `/wow-forever-assassination-rogue-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-combat-rogue-build` | specBuild | 0 | 0 | 4 | 0 | 0 | 0 | S |
| `/wow-forever-combat-rogue-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-subtlety-rogue-build` | specBuild | 0 | 0 | 3 | 0 | 0 | 0 | S |
| `/wow-forever-subtlety-rogue-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-rogue-pvp-build` | pvp | 0 | 0 | 0 | 0 | 0 | 3 | S |
| `/wow-forever-rogue-level-20-build` | levelCap | 0 | 0 | 11 | 0 | 0 | 0 | — |
| `/wow-forever-subtlety-rogue-pvp-build` | specPvp | 0 | 0 | 0 | 0 | 0 | 3 | S |
| `/wow-forever-combat-vs-assassination-rogue-leveling` | comparison | 0 | 0 | 8 | 8 | 0 | 0 | — |
| `/wow-forever-rogue-dungeon-build` | dungeon | 0 | 0 | 0 | 0 | 0 | 4 | S |
| `/priest` | calculator | 1 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-priest-builds` | buildsHub | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-priest-talents` | talents | 0 | 0 | 0 | 0 | 47 | 0 | — |
| `/wow-forever-priest-leveling-build` | leveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-discipline-priest-build` | specBuild | 0 | 0 | 4 | 0 | 0 | 0 | S |
| `/wow-forever-discipline-priest-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-holy-priest-build` | specBuild | 0 | 0 | 4 | 0 | 0 | 0 | S |
| `/wow-forever-holy-priest-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-shadow-priest-build` | specBuild | 0 | 0 | 4 | 0 | 0 | 0 | S |
| `/wow-forever-shadow-priest-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-priest-pvp-build` | pvp | 0 | 0 | 0 | 0 | 0 | 4 | S |
| `/wow-forever-priest-level-20-build` | levelCap | 0 | 0 | 12 | 0 | 0 | 0 | — |
| `/wow-forever-priest-healing-build` | healing | 0 | 0 | 0 | 0 | 0 | 4 | S |
| `/wow-forever-holy-priest-dungeon-build` | specDungeon | 0 | 0 | 0 | 0 | 0 | 4 | S |
| `/wow-forever-shadow-vs-discipline-priest-leveling` | comparison | 0 | 0 | 8 | 8 | 0 | 0 | — |
| `/druid` | calculator | 1 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-druid-builds` | buildsHub | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-druid-talents` | talents | 0 | 0 | 0 | 0 | 47 | 0 | — |
| `/wow-forever-druid-leveling-build` | leveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-balance-druid-build` | specBuild | 0 | 0 | 3 | 0 | 0 | 0 | S |
| `/wow-forever-balance-druid-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-feral-druid-build` | specBuild | 0 | 0 | 3 | 0 | 0 | 0 | S |
| `/wow-forever-feral-druid-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-restoration-druid-build` | specBuild | 0 | 0 | 3 | 0 | 0 | 0 | S |
| `/wow-forever-restoration-druid-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-druid-pvp-build` | pvp | 0 | 0 | 0 | 0 | 0 | 3 | S |
| `/wow-forever-druid-level-20-build` | levelCap | 0 | 0 | 9 | 0 | 0 | 0 | — |
| `/wow-forever-feral-druid-tank-build` | tank | 0 | 0 | 0 | 0 | 0 | 3 | S |
| `/wow-forever-restoration-druid-healing-build` | healing | 0 | 0 | 0 | 0 | 0 | 3 | S |
| `/wow-forever-balance-vs-feral-druid-leveling` | comparison | 0 | 0 | 6 | 6 | 0 | 0 | — |
| `/warlock` | calculator | 1 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-warlock-builds` | buildsHub | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-warlock-talents` | talents | 0 | 0 | 0 | 0 | 50 | 0 | — |
| `/wow-forever-warlock-leveling-build` | leveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-affliction-warlock-build` | specBuild | 0 | 0 | 4 | 0 | 0 | 0 | S |
| `/wow-forever-affliction-warlock-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-demonology-warlock-build` | specBuild | 0 | 0 | 4 | 0 | 0 | 0 | S |
| `/wow-forever-demonology-warlock-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-destruction-warlock-build` | specBuild | 0 | 0 | 3 | 0 | 0 | 0 | S |
| `/wow-forever-destruction-warlock-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-warlock-pvp-build` | pvp | 0 | 0 | 0 | 0 | 0 | 4 | S |
| `/wow-forever-warlock-level-20-build` | levelCap | 0 | 0 | 11 | 0 | 0 | 0 | — |
| `/wow-forever-warlock-pet-build` | pet | 0 | 0 | 0 | 0 | 0 | 4 | R, S |
| `/wow-forever-affliction-vs-demonology-warlock-leveling` | comparison | 0 | 0 | 8 | 8 | 0 | 0 | — |
| `/wow-forever-warlock-dungeon-build` | dungeon | 0 | 0 | 0 | 0 | 0 | 3 | S |
| `/hunter` | calculator | 1 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-hunter-builds` | buildsHub | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-hunter-talents` | talents | 0 | 0 | 0 | 0 | 46 | 0 | — |
| `/wow-forever-hunter-leveling-build` | leveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-beast-mastery-hunter-build` | specBuild | 0 | 0 | 4 | 0 | 0 | 0 | S |
| `/wow-forever-beast-mastery-hunter-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-marksmanship-hunter-build` | specBuild | 0 | 0 | 3 | 0 | 0 | 0 | S |
| `/wow-forever-marksmanship-hunter-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-survival-hunter-build` | specBuild | 0 | 0 | 4 | 0 | 0 | 0 | S |
| `/wow-forever-survival-hunter-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-hunter-pvp-build` | pvp | 0 | 0 | 0 | 0 | 0 | 4 | S |
| `/wow-forever-hunter-level-20-build` | levelCap | 0 | 0 | 11 | 0 | 0 | 0 | — |
| `/wow-forever-hunter-pet-build` | pet | 0 | 0 | 0 | 0 | 0 | 4 | R, S |
| `/wow-forever-beast-mastery-vs-marksmanship-hunter-leveling` | comparison | 0 | 0 | 7 | 7 | 0 | 0 | — |
| `/wow-forever-hunter-dungeon-build` | dungeon | 0 | 0 | 0 | 0 | 0 | 3 | S |
| `/shaman` | calculator | 1 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-shaman-builds` | buildsHub | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-shaman-talents` | talents | 0 | 0 | 0 | 0 | 46 | 0 | — |
| `/wow-forever-shaman-leveling-build` | leveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-elemental-shaman-build` | specBuild | 0 | 0 | 4 | 0 | 0 | 0 | S |
| `/wow-forever-elemental-shaman-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-enhancement-shaman-build` | specBuild | 0 | 0 | 3 | 0 | 0 | 0 | S |
| `/wow-forever-enhancement-shaman-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-restoration-shaman-build` | specBuild | 0 | 0 | 3 | 0 | 0 | 0 | S |
| `/wow-forever-restoration-shaman-leveling-build` | specLeveling | 0 | 1 | 1 | 0 | 0 | 0 | — |
| `/wow-forever-shaman-pvp-build` | pvp | 0 | 0 | 0 | 0 | 0 | 4 | S |
| `/wow-forever-shaman-level-20-build` | levelCap | 0 | 0 | 10 | 0 | 0 | 0 | — |
| `/wow-forever-shaman-totem-build` | totem | 0 | 0 | 0 | 0 | 0 | 3 | R, S |
| `/wow-forever-elemental-vs-enhancement-shaman-leveling` | comparison | 0 | 0 | 7 | 7 | 0 | 0 | — |
| `/wow-forever-restoration-shaman-healing-build` | healing | 0 | 0 | 0 | 0 | 0 | 3 | S |
| `/` | discovery-home | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-classes` | discovery-classes | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `/wow-forever-builds` | discovery-builds | 0 | 0 | 0 | 0 | 0 | 0 | — |

## Reused first-allocation groups

Only the first `.intent-experience a.ix-action` URL in the default render is compared, including class, encoded points and level. This does not classify the entire page as duplicate.

1. `/wow-forever-mage-leveling-build`, `/wow-forever-frost-mage-leveling-build`, `/wow-forever-frost-mage-aoe-build`
2. `/wow-forever-frost-mage-build`, `/wow-forever-mage-level-20-build`
3. `/wow-forever-warrior-leveling-build`, `/wow-forever-arms-warrior-leveling-build`
4. `/wow-forever-arms-warrior-build`, `/wow-forever-warrior-pvp-build`, `/wow-forever-arms-warrior-pvp-build`, `/wow-forever-warrior-level-20-build`, `/wow-forever-arms-vs-fury-warrior-leveling`
5. `/wow-forever-fury-warrior-build`, `/wow-forever-fury-warrior-pvp-build`
6. `/wow-forever-protection-warrior-build`, `/wow-forever-warrior-dungeon-build`, `/wow-forever-protection-warrior-dungeon-build`
7. `/wow-forever-rogue-leveling-build`, `/wow-forever-combat-rogue-leveling-build`
8. `/wow-forever-assassination-rogue-build`, `/wow-forever-rogue-level-20-build`
9. `/wow-forever-combat-rogue-build`, `/wow-forever-combat-vs-assassination-rogue-leveling`, `/wow-forever-rogue-dungeon-build`
10. `/wow-forever-subtlety-rogue-build`, `/wow-forever-rogue-pvp-build`, `/wow-forever-subtlety-rogue-pvp-build`
11. `/wow-forever-priest-leveling-build`, `/wow-forever-shadow-priest-leveling-build`
12. `/wow-forever-discipline-priest-build`, `/wow-forever-priest-pvp-build`, `/wow-forever-priest-level-20-build`
13. `/wow-forever-holy-priest-build`, `/wow-forever-priest-healing-build`, `/wow-forever-holy-priest-dungeon-build`
14. `/wow-forever-shadow-priest-build`, `/wow-forever-shadow-vs-discipline-priest-leveling`
15. `/wow-forever-druid-leveling-build`, `/wow-forever-feral-druid-leveling-build`
16. `/wow-forever-balance-druid-build`, `/wow-forever-druid-level-20-build`
17. `/wow-forever-feral-druid-build`, `/wow-forever-druid-pvp-build`, `/wow-forever-feral-druid-tank-build`, `/wow-forever-balance-vs-feral-druid-leveling`
18. `/wow-forever-restoration-druid-build`, `/wow-forever-restoration-druid-healing-build`
19. `/wow-forever-warlock-leveling-build`, `/wow-forever-affliction-warlock-leveling-build`
20. `/wow-forever-affliction-warlock-build`, `/wow-forever-warlock-pvp-build`, `/wow-forever-warlock-level-20-build`, `/wow-forever-affliction-vs-demonology-warlock-leveling`
21. `/wow-forever-demonology-warlock-build`, `/wow-forever-warlock-pet-build`
22. `/wow-forever-destruction-warlock-build`, `/wow-forever-warlock-dungeon-build`
23. `/wow-forever-hunter-leveling-build`, `/wow-forever-beast-mastery-hunter-leveling-build`
24. `/wow-forever-beast-mastery-hunter-build`, `/wow-forever-hunter-level-20-build`, `/wow-forever-hunter-pet-build`, `/wow-forever-beast-mastery-vs-marksmanship-hunter-leveling`
25. `/wow-forever-marksmanship-hunter-build`, `/wow-forever-hunter-dungeon-build`
26. `/wow-forever-survival-hunter-build`, `/wow-forever-hunter-pvp-build`
27. `/wow-forever-shaman-leveling-build`, `/wow-forever-enhancement-shaman-leveling-build`
28. `/wow-forever-elemental-shaman-build`, `/wow-forever-shaman-pvp-build`, `/wow-forever-shaman-level-20-build`
29. `/wow-forever-enhancement-shaman-build`, `/wow-forever-elemental-vs-enhancement-shaman-leveling`
30. `/wow-forever-restoration-shaman-build`, `/wow-forever-shaman-totem-build`, `/wow-forever-restoration-shaman-healing-build`
