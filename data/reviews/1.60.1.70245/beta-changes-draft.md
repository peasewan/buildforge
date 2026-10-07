# Draft: Paladin changes found between imported 69913 and checked 70245

**Internal draft, not for publication.** The 70245 client tables checked here are identical to 70170. This is an accumulated comparison with the site's 69913 archive, not a 70245 patch announcement.

The current client tree has 50 talents, down from 52: Improved Holy Strike and Crusade are absent. [Blizzard confirmed the Improved Holy Strike removal](https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696/1); Crusade's absence is established by [TraitTree 1100 client data](https://wago.tools/db2/TraitNode/csv?build=1.60.1.70245), without an official removal note in the reviewed announcement.

Blizzard's [September 24 and October 1 notes](https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696) cover Holy Power, Light's Vigil tooltip wording, Vengeance, Two-Handed Weapon Specialization, Sacred Arbiter, Twist of Light, Redoubt, Holy Shield and Champion of the Light. The [structured diff](diff.json) records the exact rank strings. The remaining description differences are wording, formatting, or resolved-export corrections; do not describe them as new game tuning.

Before publishing a reader-facing Beta Changes item, resolve the Seal of Command rendered range discrepancy and the current/server distinction for Redoubt and Champion of the Light, and complete the share-link and preset migration described in [review.md](review.md).
