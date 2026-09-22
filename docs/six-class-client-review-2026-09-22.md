# Six-class primary client import review

Build: `1.60.1.69913`. Reviewed: 2026-09-22.

Authority: Talent/TalentTab/SpellName CSV snapshots from Wago. TheWoWDB cross-checks all published positions, rank caps and per-rank spell IDs. ForeverDiff is retained only as an audit reference because its assembled trees differ from the primary tables.

| Class | Primary nodes | FD extra IDs | FD missing IDs | FD position mismatches | Readable tooltip ranks |
|---|---:|---:|---:|---:|---:|
| rogue | 51 | 9 | 7 | 18 | 52/155 |
| priest | 47 | 13 | 7 | 17 | 52/144 |
| druid | 47 | 14 | 10 | 23 | 60/151 |
| warlock | 50 | 19 | 17 | 20 | 62/154 |
| hunter | 46 | 15 | 10 | 14 | 49/148 |
| shaman | 46 | 12 | 8 | 24 | 57/150 |

## Evidence boundaries

- Full tree positions and rank caps come from the readable client table, not an assertion about finalized live Beta trees.
- 5 points per tier, full-rank prerequisites, and 11 points at level 20 remain explicit planning assumptions.
- Only Level 20 planning mode is offered for this first batch; no unsupported Level 60 point budget is promoted.
- Missing names retain a clearly marked historical reference label. Missing/unresolved rank text is blank, never interpolated or shifted to another rank.
- No Classic baseline diff was performed for these classes, so changeStatus stays unknown.
- The 54 editorial records reuse 18 distinct specialization allocations across relevant contexts, with distinct role explanations. They are not claimed to be 54 independently optimized builds.
- 90 requested page definitions pass per-page data/allocation checks. A failed dataset review or broken referenced build withholds affected output.

## Artwork

Six class hero images generated with the built-in imagegen tool. Prompt set: class-specific rogue daggers / priest holy staff / druid antlers and forest / warlock fel flame / hunter bow and wolf / shaman hammer and totem; painterly dark fantasy; right-third subject; full head below a generous upper margin; left half dark negative space; no text or logos. Saved in `public/images/{class}/{class}-hero-v1.jpg`.

224 unique named talent icons downloaded from Wowhead icon CDN and stored in `public/images/class-talents`. Missing icon identities use the existing text fallback, not an invented replacement.
