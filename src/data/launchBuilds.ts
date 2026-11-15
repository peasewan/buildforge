import ranks from './launchBuildRanks.json'

export type LaunchClass = keyof typeof ranks
export const buildActivities = { leveling: 'Leveling', dungeon: 'Dungeons', aoe: 'AoE', pvp: 'PvP' } as const
type Activity = keyof typeof buildActivities
type Guidance = { name: string; choice: string; action: string; source: string; credit: string }
const addon = 'https://github.com/Boco10/WoWForeverBuilds-Addon/commit/48fc3f91610e26c94ffa8fceface176f7d332830'
const mageGuide = 'https://www.wowhead.com/forever/guide/classes/mage/frost/dps-leveling-tips'
export const launchHotfixes = 'https://news.blizzard.com/en-us/article/24315281/wow-forever-hotfixes-november-13-2026'
export const launchEvidence = {
  hunter: 'November 10 changed pet health to 115% of normal and increased the summoned Hawk’s melee damage. The November 11 fix stops Volley when you move and prevents it from activating procs.',
  mage: 'On November 13 Blizzard fixed Frost Nova breaking from Blizzard damage and damage procs. Leave room to kite before starting an area channel.',
  paladin: 'The November 13 update makes Judgement of Command a melee attack that can trigger on-hit effects. Other Judgements still use ranged attack rules. Consecration’s bonus damage after a target despawns was fixed on November 9.',
}
const editorial = 'BuildForgeTools starter · community tree cross-check'
const community = 'WoW Forever Builds · November 9'
export const launchChoices: Record<LaunchClass, Record<Activity, Guidance>> = {
  hunter: {
    leveling: {name:'Beast Mastery pet leveling', choice:'Build toward Summon Hawk while your permanent pet holds the target.', action:'Take Deadly Aspects 5, Endurance Training 3 and Focused Fire 2. Spend the next five points in Unleashed Fury, then take Summon Hawk at level 25. Budget mana for the summon between pulls.', source:'https://www.icy-veins.com/wow-forever/beast-mastery-hunter-leveling', credit:editorial},
    dungeon: {name:'Beast Mastery dungeon damage', choice:'Keep a pet for single-target damage and controlled pulls.', action:'Send the pet to the tank’s marked target. Bring it back before changing packs. This allocation reaches Bestial Wrath and takes Trueshot Aura in Marksmanship.', source:addon, credit:community},
    aoe: {name:'Marksmanship pack damage', choice:'Take Barrage for a ranged pack setup with Lone Wolf available.', action:'Let the tank gather the pack before using Multi-Shot or channeling Volley. Keep damage away from trapped targets. An active pet switches off the Lone Wolf bonus.', source:addon, credit:community},
    pvp: {name:'Marksmanship trap control', choice:'Trade deep pet talents for Scatter Shot, Entrapment and extra range.', action:'Reserve Scatter Shot for an approaching opponent and make space to reposition. Use the Survival investment when defending a narrow approach with traps.', source:addon, credit:community},
  },
  mage: {
    leveling: {name:'Frostbolt and Ice Lance', choice:'Practice single-target Frost leveling before committing to an area route.', action:'Start with five Improved Frostbolt points. Take five Ice Shards ranks and Ice Lance at level 20. Use your freeze window on one target, then reposition before the next cast.', source:mageGuide, credit:editorial},
    dungeon: {name:'Arcane dungeon damage', choice:'Choose Arcane Blast and Arcane Power when the group needs concentrated damage.', action:'Plan the burst around one priority target. Keep enough mana for a second pull if the party is moving quickly. This PvE endpoint spends ten points in Fire and three in Frost.', source:addon, credit:community},
    aoe: {name:'Frost pack control', choice:'Spend thirteen early Frost points on Improved Blizzard and longer-lasting slows.', action:'Take Improved Frostbolt 5, Improved Frost Nova 2 and Permafrost 3, then Improved Blizzard 3. Group enemies before channeling. Leave the pack an unobstructed path away from other pulls.', source:mageGuide, credit:editorial},
    pvp: {name:'Frost battleground control', choice:'Pair Ice Barrier and Cold Snap with Improved Counterspell.', action:'Use a root to gain distance or interrupt a key cast. Area damage can release a rooted target, so coordinate the follow-up with your partner.', source:addon, credit:community},
  },
  paladin: {
    leveling: {name:'Retribution melee leveling', choice:'Reach Seal of Command with eleven points for solo melee questing.', action:'Spend five points in Benediction, two in Improved Judgement and three in Conviction. Take Seal of Command at level 20. Check weapon procs specifically with Judgement of Command.', source:'https://maxroll.gg/wow-forever/class-guides/paladin-leveling-guide', credit:editorial},
    dungeon: {name:'Protection shield tank', choice:'Choose Holy Shield and Shieldsworn for a shield-based group tank.', action:'Gather enemies where the group can keep them inside Consecration. Use Holy Shield for blocks and check threat on the first target your party attacks.', source:addon, credit:community},
    aoe: {name:'Holy Shock and Consecrated Ground', choice:'Use a Holy/Retribution hybrid for stationary groups of enemies.', action:'This example takes both ranks of Consecrated Ground alongside Holy Shock. Pull enemies into one patch and compare mana left after a full pack with your ordinary solo route.', source:'https://github.com/wowsims/forever/commit/7c1affdab45223dff3c608cfb43684326cf4b613', credit:'WoWSims Holy Shock preset · editorial pack use'},
    pvp: {name:'Holy battleground healer', choice:'Reach Holy Shock and spend eighteen Protection points on team utility.', action:'Use Holy Shock while repositioning. Guardian’s Favor and Improved Hammer of Justice give you reasons to play near the teammate defending an objective.', source:addon, credit:community},
  },
}
export function launchAllocation(id: LaunchClass, activity: Activity) {
  const allocation = ranks[id][activity]
  const totals = allocation.trees.map(tree => tree.selected.reduce((sum, rank) => sum + Number(rank[1]), 0))
  return {...allocation, totals, level:9 + totals.reduce((sum, value) => sum + value, 0), href:`https://www.forever-xp.com/talents/${id}/#${allocation.code}`}
}
