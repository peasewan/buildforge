/** Patch announcements and import status are separate from dataset verification. */
export const BETA_PATCH_REVIEW = {
  clientBuild: '1.60.1.70009',
  announcedAt: '2026-09-24',
  reviewedAt: '2026-09-27',
  datasetStatus: 'pending_reconciliation' as const,
  officialSource: 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-september-24/2360696',
  clientDiffSource: 'https://foreverdiff.com/compare/1.60.1.69977__1.60.1.70009/',
  notes: {
    paladin: ['Improved Holy Strike removed; Holy Strike cooldown now 10 seconds.', 'Holy Power adds Holy Strike crit; Vengeance uses non-periodic crits, with three stacks.', 'Two-Handed Weapon Specialization: 2/4/6%; Sacred Arbiter: 20%; Twist of Light adds 20% Seal mana reduction.', "Light’s Vigil text clarifies that only damage returns mana."],
    druid: ['Mangle renamed Primal Bite; Primal Fury renamed Blood Frenzy.', 'Wrath damage increased; several healing spells can now crit.'],
    hunter: ['Furious Howl weakened; Strider Kick grants 30% movement speed for three seconds.'],
    mage: ['Wake of Fire: 30 seconds; Hot Streak: 20 seconds.', 'Arcane Missiles checks line of sight when channeling starts.'],
    priest: ['Renew can crit; shield overwrite rules adjusted.'],
    rogue: ['Sap now applies appropriate PvP flagging.'],
    shaman: ['Elemental Fury and Elemental Alacrity positions exchanged.', 'Rage of the Far Seer loses casting-speed benefit.'],
    warlock: ['Life Tap text corrected; Voidwalker Sacrifice scaling adjusted.'],
    warrior: ['Bastion and Focused Rage positions exchanged in the announcement.', 'Bloodthrill activation increased; Slam cooldown: 18 seconds; Improved Slam reduces it.'],
  } satisfies Record<string, string[]>,
  clientReported: { paladin: ['Crusade removed from Retribution, reported by the client diff rather than the official notes.'] } as Record<string,string[]>,
}
