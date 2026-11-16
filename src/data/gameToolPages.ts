export const gameToolPages = [
  { kind: 'superhuman', path: '/roblox/blox-fruits/superhuman-requirements',
    title: 'Blox Fruits Superhuman Requirements, Cost & Trainer Location',
    description: 'Superhuman costs $3,000,000 and requires 300 mastery each in Dark Step, Electric, Water Kung Fu and Dragon Breath. Check your progress and find the trainer.',
  },
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
    title: 'Stand Out Tier List: Best Stands for PvP, Raids & Farming',
    description: 'See which Roblox Stand Out Stands to keep for duels, raids and item farming. Check your roll, compare moves and find a route to your next Stand.',
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
