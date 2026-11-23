export type LabCard = Readonly<{
  id: string
  name: string
  cost: number
  rarity: string
  effect: string
  unlock: string | null
  sources: readonly string[]
}>

const cardGuide = 'https://beebom.com/dandys-world-lab-cards/'
const cardWiki = 'https://dandysworldwiki.org/wiki/cards/'
const patchNotes = 'https://dandysworldwiki.org/wiki/vee-mail/'
const labsGuide = 'https://progameguides.com/roblox/dandys-world-the-lab-game-mode-guide-roblox/'
const communityCatalog = 'https://www.rosenberryrooms.com/all-dandys-world-lab-cards-complete-list-effects-and-costs/'
const sugarCrashShopPost = 'https://www.reddit.com/r/DandysWorld_Roblox/comments/1y2wjq1/if_anyones_curious_on_how_much_legendary_cards/'

export const labCardSources = [
  { label: 'Beebom card guide and shop screenshot', url: cardGuide },
  { label: 'Dandy’s World Wiki card reference', url: cardWiki },
  { label: 'Dandy’s World Wiki archive of in-game patch notes', url: patchNotes },
  { label: 'Pro Game Guides Labs guide', url: labsGuide },
  { label: 'Rosenberry Rooms card reference', url: communityCatalog },
  { label: 'Player report of Sugar Crash in Dioda’s shop', url: sugarCrashShopPost },
] as const

// Community sources reviewed November 23, 2026. A null unlock makes no claim about eligibility.
export const labCards: readonly LabCard[] = [
  {
    id: 'bored',
    name: 'Bored',
    cost: 500,
    rarity: 'Common',
    effect: 'Makes Twisteds give up a chase 25% faster.',
    unlock: null,
    sources: [cardGuide, cardWiki],
  },
  {
    id: 'catch-your-breath',
    name: 'Catch Your Breath',
    cost: 500,
    rarity: 'Common',
    effect: 'Every Toon recovers stamina 15% faster.',
    unlock: null,
    sources: [cardGuide, cardWiki],
  },
  {
    id: 'extra-charge',
    name: 'Extra Charge',
    cost: 500,
    rarity: 'Common',
    effect: 'Picking up an item that has multiple uses gives it one more use.',
    unlock: null,
    sources: [cardGuide, cardWiki],
  },
  {
    id: 'patch-up',
    name: 'Patch Up',
    cost: 500,
    rarity: 'Common',
    effect: 'Restores one Heart to each injured Toon.',
    unlock: null,
    sources: [cardGuide, cardWiki],
  },
  {
    id: 'thrifty',
    name: 'Thrifty',
    cost: 500,
    rarity: 'Common',
    effect: 'Applies a 20% discount to Dessa’s shop items during a run.',
    unlock: null,
    sources: [cardGuide, cardWiki],
  },
  {
    id: 'tip-jar',
    name: 'Tip Jar',
    cost: 500,
    rarity: 'Common',
    effect: 'Each Toon gets 150 Tapes.',
    unlock: null,
    sources: [cardGuide, cardWiki],
  },
  {
    id: 'window-shopping',
    name: 'Window Shopping',
    cost: 500,
    rarity: 'Common',
    effect: 'Reduces how often Dessa stocks Common items.',
    unlock: null,
    sources: [cardGuide, cardWiki],
  },
  {
    id: 'blackout-insurance',
    name: 'Blackout Insurance',
    cost: 1000,
    rarity: 'Rare',
    effect: 'Cancels the next three Blackouts.',
    unlock: null,
    sources: [cardGuide, communityCatalog],
  },
  {
    id: 'blind-spot',
    name: 'Blind Spot',
    cost: 1000,
    rarity: 'Rare',
    effect: 'Reduces Twisted sight distance by 15% and narrows their viewing angle.',
    unlock: null,
    sources: [cardGuide, communityCatalog],
  },
  {
    id: 'charm-common',
    name: 'Charm: Common',
    cost: 1000,
    rarity: 'Rare',
    effect: 'Makes Common Twisteds substantially more likely to spawn.',
    unlock: null,
    sources: [cardWiki, cardGuide],
  },
  {
    id: 'cut-corners',
    name: 'Cut Corners',
    cost: 1000,
    rarity: 'Rare',
    effect: 'Gives each Toon 30% faster extraction at the cost of one maximum Heart.',
    unlock: null,
    sources: [cardGuide, communityCatalog],
  },
  {
    id: 'day-off',
    name: 'Day Off',
    cost: 1000,
    rarity: 'Rare',
    effect: 'Reduces each floor’s Twisted count by one.',
    unlock: null,
    sources: [labsGuide, cardGuide],
  },
  {
    id: 'get-well-soon',
    name: 'Get Well Soon',
    cost: 1000,
    rarity: 'Rare',
    effect: 'Triggers a one-Heart heal for the team every 30 seconds, up to three times.',
    unlock: null,
    sources: [labsGuide, cardGuide],
  },
  {
    id: 'overclock',
    name: 'Overclock',
    cost: 1000,
    rarity: 'Rare',
    effect: 'Boosts the whole team’s extraction speed by 20%.',
    unlock: null,
    sources: [labsGuide, cardGuide],
  },
  {
    id: 'second-chance',
    name: 'Second Chance',
    cost: 1000,
    rarity: 'Rare',
    effect: 'The next downing hit leaves the targeted Toon at two Hearts, or one if their maximum is one.',
    unlock: null,
    sources: [labsGuide, cardGuide],
  },
  {
    id: 'sugar-crash',
    name: 'Sugar Crash',
    cost: 2500,
    rarity: 'Legendary',
    effect: 'Cuts Twisted move speed by 25% and sight range by 15%. They also wait 25% longer after an attack.',
    unlock: 'Limited shop rotation. Equip in Card Slot 4.',
    sources: [cardWiki, sugarCrashShopPost, patchNotes],
  },
]
