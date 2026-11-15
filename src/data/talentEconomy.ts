import type { EvidenceStatus } from './verification'

export const TALENT_ECONOMY_PAGE = {
  path: '/wow-forever-respec-cost-calculator',
  title: 'WoW Forever Respec & Dual Spec Cost Calculator | BuildForgeTools',
  h1: 'WoW Forever Respec & Dual Spec Cost Calculator',
  description: 'Compare WoW Forever respec and dual spec costs using your trainer quotes. Budget repeated talent resets, inspect break-even points and check source limits.',
  reviewedAt: '2026-11-15',
} as const

export const TALENT_ECONOMY_DEFAULTS = {
  mode: 'fixed' as 'fixed' | 'sequence',
  resetGold: '5',
  resetSequence: '1, 5, 10',
  dualGold: '50',
  switchGold: '0',
  switches: '8',
  level: '40',
}

export const TALENT_ECONOMY_SOURCES: Array<{ id: string; label: string; href: string; status: EvidenceStatus; summary: string }> = [
  {
    id: 'official-class-guide',
    label: 'Blizzard class guide · trainer and unlock rules',
    href: 'https://news.blizzard.com/en-us/article/24302099/world-of-warcraft-forever-class-deep-dives-paladin',
    status: 'official',
    summary: 'Blizzard describes resetting talents, including Legacy talents, through a class trainer in a major city. Dual specialization becomes available at Level 40. This guide does not provide a complete current price schedule.',
  },
  {
    id: 'player-price-report',
    label: 'Player report · November 11, 2026',
    href: 'https://us.forums.blizzard.com/en/wow/t/its-time-to-rethink-respec-costs-and-ah-fees/2410373',
    status: 'derived_assumption',
    summary: 'One player reports reset prices of 1g, 5g and 10g, plus a 50g dual spec unlock. We use these unconfirmed amounts only as editable budget assumptions. They are reported observations, not a Blizzard price list or a complete future fee ladder. The editable defaults are a starting budget, not a quote for your character.',
  },
  {
    id: 'temporary-beta',
    label: 'Blizzard Beta thread · historical September 24 rule',
    href: 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-november-2/2360696/1',
    status: 'official',
    summary: 'In the historical Beta rule, a reset returned to 1 silver after one hour; repeat resets before that cost more. Players were not prevented from resetting during the hour. This temporary testing rule is not used as a current Live price.',
  },
]

export const TALENT_ECONOMY_FAQS = [
  {
    question: 'How much does a WoW Forever talent reset cost?',
    answer: 'Use the quote shown by your class trainer for your next reset. Blizzard’s class guide describes major-city trainers resetting talents, including Legacy talents, but it does not supply a complete current fee table. The November 11 player report mentions 1g, 5g and 10g resets. Those observations do not establish every price you will face. Fixed mode deliberately repeats your entered quote; it is a budget assumption rather than a prediction of the game’s next charge.',
  },
  {
    question: 'How do I count a trip from one spec to another and back?',
    answer: 'Without dual spec, count each paid reset separately. Moving from setup A to B and later returning to A is two paid resets, so enter two planned switches. The comparison assumes you repeatedly alternate between the same two prepared setups. After unlocking dual spec, changing talents inside either stored setup can still require another paid reset. Those edits are separate from switching between saved specs and are not included in this two-setup comparison. Add them to a separate budget when relevant.',
  },
  {
    question: 'Does the dual spec cost make sense before Level 40?',
    answer: 'Blizzard’s guide places the dual specialization unlock at Level 40. Below that level, these figures are a future budget, not an instruction to buy it now. At or above the unlock level, compare the total for your planned switches and the upfront amount you can afford. A lower modeled total does not establish that the price or switching conditions are available to your character. Verify the trainer’s offer before spending; combat performance is outside this calculation.',
  },
  {
    question: 'Why does a sequence leave some reset costs unknown?',
    answer: 'Sequence mode adds only the individual prices you supply, in order. If you plan eight resets but enter three quotes, the known subtotal covers three resets. The remaining total and projected saving stay undetermined. Supply the remaining quotes or shorten the plan to make a complete comparison. The calculator does not repeat the last quote, invent a maximum fee or infer a weekly discount. An entered future quote is still your assumption unless you have evidence for it.',
  },
  {
    question: 'What does the break-even point actually mean?',
    answer: 'It is the first cumulative comparison where unlocking dual spec and paying the entered switch fees costs the same as, or less than, repeated resets. Fixed mode can calculate that point beyond your chosen plan because you explicitly assume an unchanged reset quote. Sequence mode checks only supplied prices inside the plan. A first crossing does not guarantee savings at every later switch when prices vary. A zero-switch crossing means the starting costs are equal; check the planned totals too.',
  },
  {
    question: 'Can I use Beta, Classic or Retail prices here?',
    answer: 'This page concerns WoW Forever and keeps its dated sources separate. The historical Beta announcement’s temporary 1 silver price and one-hour price recovery are not treated as current Live rules. Classic or Retail guides do not verify Forever’s fee schedule either. Check which game and version a source describes, then enter applicable quotes. Travel time, weekly price reductions, cooldowns and character-specific discounts are not modeled. The calculator compares the gold amounts you provide, without promising a current fee ladder.',
  },
] as const
