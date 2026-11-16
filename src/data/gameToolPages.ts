export const gameToolPages = [
  { kind: 'arrow-crafting', path: '/roblox/stand-out/arrow-crafting',
    title: 'Stand Out Arrow Crafting Planner: Recipes & Materials | BuildForgeTools',
    description: 'Plan Lucky, Bizarre and Mysterious Arrow crafts in Roblox Stand Out. Enter your inventory to calculate missing Arrow Parts, Steel Ingots and Wood.',
  },
  { kind: 'arrow-budget', path: '/roblox/stand-out/arrow-calculator',
    title: 'Stand Out Arrow Calculator: Lucky vs Bizarre Odds | BuildForgeTools',
    description: 'Compare Lucky and Bizarre Arrow drop rates in Stand Out. Enter your Mysterious Arrow or Train Token budget to see rolls, leftovers and rarity odds.',
  },
  {
    kind: 'stand-out', path: '/roblox/stand-out/stand-picker',
    title: 'Stand Out Stand Picker: Compare Moves & Arrow Routes | BuildForgeTools',
    description: 'Choose a Stand in Roblox Stand Out. Check story restrictions, arrows and evolution routes, then compare moves and cooldowns side by side.',
  },
  {
    kind: 'treasure-hours', path: '/fortnite/treasure-hours',
    title: 'Fortnite Treasure Hours: Local Times & Event Schedule | BuildForgeTools',
    description: 'See Fortnite Treasure Hours in your time zone. Check confirmed event windows, local dates and the next announced session.',
  },
  {
    kind: 'dungeons-crossplay', path: '/minecraft/dungeons-2-crossplay',
    title: 'Minecraft Dungeons II Crossplay & Co-op Checker | BuildForgeTools',
    description: 'Check a pair of platforms for Minecraft Dungeons II co-op and troubleshoot party codes, account settings, game versions and local multiplayer.',
  },
  {
    kind: 'steam-deck', path: '/wow-forever-steam-deck',
    title: 'WoW Forever on Steam Deck: Setup & Controller Layouts | BuildForgeTools',
    description: 'Set up WoW Forever on Steam Deck, plan controller bindings for your class and troubleshoot launcher, targeting and input problems.',
  },
] as const

export type GameToolKind = typeof gameToolPages[number]['kind']
