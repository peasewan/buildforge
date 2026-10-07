export type RunPrepFaction = 'alliance' | 'horde'
export type QuestFaction = RunPrepFaction | 'both'

export interface RunPrepQuest {
  id: string
  name: string
  faction: QuestFaction
  pickup: string
  note?: string
  source: { label: string; href: string }
}

export interface RunPrepDungeon {
  id: string
  name: string
  level: string
  filterMinLevel: number
  filterMaxLevel: number
  levelNote: string
  location: string
  factionNote: string
  factionFacts: Partial<Record<RunPrepFaction, string>>
  source: { label: string; href: string }
  factSource?: { label: string; href: string }
  known: string
  unverified: string
  quests: RunPrepQuest[]
}

const HALL_SOURCE = { label: 'Wowhead Hall of Thanes guide', href: 'https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards' }
const RUINS_SOURCE = { label: 'Wowhead Ruins of Lordaeron guide', href: 'https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards' }
const EXCAVATION_SOURCE = { label: 'Wowhead Excavation Site guide (updated Oct 4)', href: 'https://www.wowhead.com/forever/guide/excavation-site-wetlands-dungeon-overview-location-rewards' }
const EXCAVATION_ROUNDUP = { label: 'Wowhead Excavation Site quest roundup', href: 'https://www.wowhead.com/forever/news/every-quest-in-excavation-site-wetlands-wow-forever-383239' }
const BLIZZARD_BETA = { label: 'Blizzard Beta announcement', href: 'https://worldofwarcraft.blizzard.com/en-us/news/24304160/the-world-of-warcraft-forever-beta-now-live' }
const BLIZZARD_OCTOBER = { label: 'Blizzard October 1 Beta notes', href: 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696' }

export const RUN_PREP_DUNGEONS: RunPrepDungeon[] = [
  {
    id: 'hall-of-thanes', name: 'Hall of Thanes', level: '13–18 recommended', filterMinLevel: 13, filterMaxLevel: 18,
    levelNote: 'Wowhead recommends levels 13–18.',
    location: 'Beneath the High Seat of Ironforge, in Old Ironforge.',
    factionNote: 'Quest availability differs by faction; choose a faction to view named quests.',
    factionFacts: {
      alliance: 'The guide says all quests are Alliance-exclusive except An Ancient Grudge and Important Heirlooms.',
      horde: 'The guide identifies An Ancient Grudge and Important Heirlooms as the two quests that are not Alliance-exclusive.',
    },
    source: HALL_SOURCE,
    known: 'Wowhead lists the recommended level range and entrance location.',
    unverified: 'Current in-game access and route safety are not independently checked here.',
    quests: [
      { id: 'important-heirlooms', name: 'Important Heirlooms', faction: 'both', pickup: 'Ironforge, Old Ironforge — Thom Filch (/way 32.6, 44.6).', source: HALL_SOURCE },
      { id: 'restless-dead', name: 'The Restless Dead', faction: 'alliance', pickup: 'Ironforge, Old Ironforge — Afadra Dunwall (/way 64.8, 58.4).', source: HALL_SOURCE },
      { id: 'old-ironforge-incursion', name: 'Old Ironforge Incursion', faction: 'alliance', pickup: "Dun Morogh, Gol'Golar Quarry — Earthseer Farsen.", note: 'The guide says to pick up the Underground Map from the Dark Iron Map first. Its displayed /way duplicates another quest in a different zone, so confirm the marker in game.', source: HALL_SOURCE },
      { id: 'treaty-of-understanding', name: 'The Treaty of Understanding', faction: 'alliance', pickup: 'Inside Hall of Thanes, in a vault in the Reliquary of Kings.', source: HALL_SOURCE },
      { id: 'ancient-grudge', name: 'An Ancient Grudge', faction: 'both', pickup: "Inside Hall of Thanes, Anvilmar's Rest — Ghostly Attendant.", source: HALL_SOURCE },
    ],
  },
  {
    id: 'ruins-of-lordaeron', name: 'Ruins of Lordaeron', level: '15–20 Blizzard listing · 16–22 Wowhead recommendation', filterMinLevel: 15, filterMaxLevel: 22,
    levelNote: 'The published ranges differ: Blizzard lists 15–20; the Wowhead guide recommends 16–22. This filter includes levels in either range.',
    location: 'Above Undercity, in the non-instanced Ruins of Lordaeron.',
    factionNote: 'The guide reports 6 Horde quests (4 outside, 2 inside) and 4 Alliance quests (all inside). Only pickups without conflicting details are listed below.',
    factionFacts: {
      alliance: 'Wowhead reports 4 Alliance quests, all inside the dungeon; named entries below are the ones whose faction and pickup are clear from the guide.',
      horde: 'Wowhead reports 6 Horde quests, with 4 outside and 2 inside; named entries below include three outside pickups with consistent location details.',
    },
    source: RUINS_SOURCE, factSource: BLIZZARD_BETA,
    known: 'Blizzard and Wowhead publish different level ranges; both are shown above. Wowhead gives faction quest counts and pickup locations.',
    unverified: "The guide gives conflicting pickup locations for Light's Justice. It and other unresolved entries are omitted pending an in-game check.",
    quests: [
      { id: 'wrath-rathmael', name: "The Wrath of Rath'mael", faction: 'horde', pickup: 'Tirisfal Glades — Deathguard Kristof in Brill (/way 65.2, 60.2).', source: RUINS_SOURCE },
      { id: 'frightened-request', name: 'A Frightened Request', faction: 'horde', pickup: 'Silverpine Forest, The Sepulcher — Tabitha Heartweaver (/way 44.6, 42.8).', source: RUINS_SOURCE },
      { id: 'new-plague', name: 'The New Plague', faction: 'horde', pickup: 'Undercity, The Apothecarium — Theodore Griffs (/way 47.0, 72.6).', source: RUINS_SOURCE },
      { id: 'crest-of-lordaeron', name: 'Crest of Lordaeron (secret quest)', faction: 'both', pickup: 'Interactable Crest of Lordaeron at one of several locations inside the dungeon.', note: 'The guide says it can be returned to either Stormwind City or Undercity.', source: RUINS_SOURCE },
    ],
  },
  {
    id: 'excavation-site', name: 'Excavation Site: Wetlands', level: '26–31 Blizzard listing · 26–32 Wowhead recommendation', filterMinLevel: 26, filterMaxLevel: 30,
    levelNote: 'Blizzard lists 26–31; the Oct 4 Wowhead guide recommends 26–32 and says the final boss is level 31. Player-level choices stop at 30, the announced Beta cap.',
    location: 'Wetlands, Eastern Kingdoms.',
    factionNote: 'Wowhead marks its quest section as still being updated. Only quests with a named pickup location are listed.',
    factionFacts: {
      alliance: 'Quest roundup entries with clear Alliance locations are listed below; Wowhead notes that its quest list is still being updated.',
      horde: 'Quest roundup entries with clear Horde locations are listed below; Wowhead notes that its quest list is still being updated.',
    },
    source: EXCAVATION_SOURCE, factSource: BLIZZARD_OCTOBER,
    known: 'Wowhead places the dungeon in Wetlands and publishes its recommended range; Blizzard lists the dungeon range and Beta level cap.',
    unverified: 'The quest guide says coverage is incomplete. Highland Hides prerequisite reports conflict; follow-up quests without their own named pickup location are omitted.',
    quests: [
      { id: 'changing-tastes', name: 'Changing Tastes', faction: 'horde', pickup: 'Orgrimmar — Borstan, the Cooking trainer.', source: EXCAVATION_ROUNDUP },
      { id: 'open-the-maw', name: 'Open the Maw', faction: 'horde', pickup: 'Deathstalker Agent, hiding in the hills by the entrance area.', source: EXCAVATION_ROUNDUP },
      { id: 'highland-hides', name: 'Highland Hides', faction: 'alliance', pickup: 'Wetlands, Menethil Harbor — James Halloran (/way 8, 55).', note: 'Prerequisite disputed: the guide lists Daily Delivery, while a later reader reports Young Crocolisk Skins. Check in game.', source: EXCAVATION_ROUNDUP },
      { id: 'songblade-search', name: 'Songblade Search', faction: 'alliance', pickup: 'Redridge Mountains — Dorin Songblade (/way 25.6, 46.6).', source: EXCAVATION_SOURCE },
      { id: 'horrors-highland', name: 'Horrors in the Highland', faction: 'alliance', pickup: 'Wetlands — Rethiel the Greenwarden (/way 56.2, 40.6).', note: 'The quest roundup lists a preceding Greenwarden → Blisters on the Land chain; verify availability in game.', source: EXCAVATION_ROUNDUP },
      { id: 'lost-thicket-things', name: 'Lost in the Thicket Things', faction: 'alliance', pickup: 'Menethil Harbor — Caitlin Grassman (/way 11.8, 58.6).', note: 'The guide also mentions a breadcrumb in Ashenvale; it is omitted because a later guide comment disputes whether it is needed.', source: EXCAVATION_SOURCE },
    ],
  },
]

export const RUN_PREP_CHECKLIST: Array<{ id: string; label: string }> = [
  { id: 'group', label: 'Confirm your group and party roles' },
  { id: 'travel', label: 'Review the linked entrance and travel information' },
]
