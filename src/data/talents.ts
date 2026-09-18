import type { Branch, TalentDefinition } from "../lib/build";
import betaTalentData from "./paladin-beta-1.60.1.69893.json";
import previousBetaTalentData from "./paladin-beta-1.60.1.69876.json";

// The archived demo transcription remains available for historical comparisons.
// Production uses the latest reviewed Beta client dataset below.
export const PREVIEW_DATA_VERSION = "wow_forever_demo_2026-09-13";
export const BETA_DATA_VERSION = "wow_forever_beta_1.60.1.69893";
export const DATA_VERSION = BETA_DATA_VERSION;
export type TalentDataVersion =
  | typeof PREVIEW_DATA_VERSION
  | typeof BETA_DATA_VERSION
  | `wow_forever_beta_${string}`;
export const DATA_SOURCES: string[] = [
  "WoW Forever Beta client build 1.60.1.69893",
  "WoW Classic Forever client-data export",
];

export type ChangeType = "classic_unchanged" | "moved" | "updated" | "new";
export type VerificationStatus =
  | "official_confirmed"
  | "demo_verified"
  | "client_verified"
  | "ingame_verified"
  | "community_correlated"
  | "derived_assumption"
  | "estimated"
  | "needs_review";

export type TalentSourceType =
  | "official"
  | "demo_recording"
  | "community_transcription"
  | "classic_reference"
  | "beta_client"
  | "beta_capture";

export interface TalentSource {
  type: TalentSourceType;
  label: string;
  url?: string;
  locator?: string;
}

export interface TalentVerification {
  name: VerificationStatus;
  maxRank: VerificationStatus;
  tier: VerificationStatus;
  description: VerificationStatus;
  prerequisiteLink: VerificationStatus;
  prerequisiteRule: VerificationStatus;
}

export interface Talent extends TalentDefinition {
  name: string;
  description: string;
  rankDescriptions?: string[];
  clientNodeId?: number;
  spellId?: number;
  confirmedRanks?: number[];
  complete?: boolean;
  icon: string;
  dataVersion: TalentDataVersion;
  changeType: ChangeType;
  verificationStatus: VerificationStatus;
  verification: TalentVerification;
  row: number;
  column: number;
  x: number;
  y: number;
  sources: TalentSource[];
}

export const branchNames: Record<Branch, string> = {
  holy: "Holy",
  protection: "Protection",
  retribution: "Retribution",
};

export const branchTaglines: Record<Branch, string> = {
  holy: "Channel the Light through healing and spell power.",
  protection: "Hold the line with shields and sacred defenses.",
  retribution: "Bring judgment through weapons and holy power.",
};

const BRANCH_ICON: Record<Branch, string> = {
  holy: "/images/icons/holy-strike.png",
  protection: "/images/icons/shield.png",
  retribution: "/images/icons/hammer.png",
};

type ReviewState = "classic" | "updated" | "new";

type RawTalent = {
  id: string;
  name: string;
  rank: number;
  x: number;
  y: number;
  requiredTreePoints: number;
  prerequisite: string[];
  description: string;
  review: ReviewState;
};

// Four-column demo layout. Grid coordinates are converted to percentages.
const COLUMN_X: Record<number, number> = { 0: 12.5, 1: 37.5, 2: 62.5, 3: 87.5 };
const TIER_Y: Record<number, number> = {
  0: 8,
  1: 22,
  2: 36,
  3: 50,
  4: 64,
  5: 78,
  6: 92,
};

const OFFICIAL_DEEP_DIVE_URL =
  "https://worldofwarcraft.blizzard.com/en-us/news/24303313/world-of-warcraft-forever-deep-dive-panel-recap";
const COMMUNITY_TRANSCRIPTION_URL = "https://talentsforever.com/";
const BETA_DATA_URL = "https://wowclassicforever.info/talent/paladin/";
const PREVIOUS_BETA_DATA_URL = "https://talentsforever.com/data.json";
const CLASSIC_REFERENCE_URL =
  "https://warcraft.wiki.gg/wiki/Paladin_talents_(Classic)";

// Blizzard's Forever Deep Dive names these talents and describes their broad
// mechanics. Exact ranks, positions, tooltip values, and arrows remain sourced
// from the public demo transcription until Blizzard publishes the full trees.
const OFFICIALLY_NAMED_TALENTS = new Set([
  "improved_holy_strike",
  "voice_of_truth",
  "reverence",
  "infusion_of_light",
  "holy_shock",
  "consecrated_ground",
  "light_s_vigil",
  "improved_seal_of_fury",
  "shield_specialization",
  "swift_judgement",
  "templar_s_bulwark",
  "reckoning",
  "iron_creed",
  "vindication",
  "sacred_arbiter",
  "champion_of_the_light",
  "instrument_of_law",
  "twist_of_light",
]);

const holy: RawTalent[] = [
  {
    id: "improved_holy_strike",
    name: "Improved Holy Strike",
    rank: 2,
    x: 0,
    y: 0,
    requiredTreePoints: 0,
    prerequisite: [],
    description: "Reduces the cooldown of your Holy Strike ability by 2 sec.",
    review: "new",
  },
  {
    id: "divine_strength",
    name: "Divine Strength",
    rank: 5,
    x: 1,
    y: 0,
    requiredTreePoints: 0,
    prerequisite: [],
    description: "Increases your Strength by 10%.",
    review: "classic",
  },
  {
    id: "divine_intellect",
    name: "Divine Intellect",
    rank: 5,
    x: 2,
    y: 0,
    requiredTreePoints: 0,
    prerequisite: [],
    description: "Increases your total Intellect by 10%.",
    review: "classic",
  },
  {
    id: "healing_light",
    name: "Healing Light",
    rank: 3,
    x: 0,
    y: 1,
    requiredTreePoints: 5,
    prerequisite: [],
    description:
      "Increases the amount healed by your Holy Light and Flash of Light spells by 12%.",
    review: "classic",
  },
  {
    id: "spiritual_focus",
    name: "Spiritual Focus",
    rank: 2,
    x: 1,
    y: 1,
    requiredTreePoints: 5,
    prerequisite: [],
    description:
      "Gives your Flash of Light and Holy Light spells a 28% chance to not lose casting time when you take damage.",
    review: "classic",
  },
  {
    id: "improved_seals",
    name: "Improved Seals",
    rank: 3,
    x: 2,
    y: 1,
    requiredTreePoints: 5,
    prerequisite: [],
    description:
      "Increases the damage done by your Seals and Judgements by 15%.",
    review: "new",
  },
  {
    id: "unyielding_faith",
    name: "Unyielding Faith",
    rank: 2,
    x: 3,
    y: 1,
    requiredTreePoints: 5,
    prerequisite: [],
    description:
      "Increases your chance to resist Fear and Disorient effects by an additional 10%.",
    review: "classic",
  },
  {
    id: "voice_of_truth",
    name: "Voice of Truth",
    rank: 1,
    x: 0,
    y: 2,
    requiredTreePoints: 10,
    prerequisite: [],
    description:
      "Grants you immunity to Silence and Interrupt effects. Lasts 6 sec.",
    review: "new",
  },
  {
    id: "reverence",
    name: "Reverence",
    rank: 3,
    x: 1,
    y: 2,
    requiredTreePoints: 10,
    prerequisite: [],
    description:
      "Allows 30% of your Mana regeneration to continue while casting.",
    review: "new",
  },
  {
    id: "purifying_power",
    name: "Purifying Power",
    rank: 2,
    x: 2,
    y: 2,
    requiredTreePoints: 10,
    prerequisite: [],
    description:
      "Reduces the mana cost of your Cleanse and Purify spells by 20% and reduces the cooldown of your Exorcism and Holy Wrath spells by 34%.",
    review: "new",
  },
  {
    id: "infusion_of_light",
    name: "Infusion of Light",
    rank: 2,
    x: 0,
    y: 3,
    requiredTreePoints: 15,
    prerequisite: [],
    description:
      "Your Holy Shock and Flash of Light critical hits reduce the cast time of your next Holy Light cast within 15 sec by 1.0 sec.",
    review: "new",
  },
  {
    id: "illumination",
    name: "Illumination",
    rank: 5,
    x: 1,
    y: 3,
    requiredTreePoints: 15,
    prerequisite: ["reverence"],
    description:
      "After getting a critical effect from your Flash of Light, Holy Light, or Holy Shock heal spell, gives you a 100% chance to gain Mana equal to the base cost of the spell.",
    review: "classic",
  },
  {
    id: "divine_favor",
    name: "Divine Favor",
    rank: 1,
    x: 2,
    y: 3,
    requiredTreePoints: 15,
    prerequisite: [],
    description:
      "When activated, gives your next Flash of Light, Holy Light, or Holy Shock spell a 100% critical effect chance.",
    review: "classic",
  },
  {
    id: "divine_precision",
    name: "Divine Precision",
    rank: 3,
    x: 0,
    y: 4,
    requiredTreePoints: 20,
    prerequisite: ["holy_shock"],
    description: "Increases your chance to hit with Holy spells by 18%.",
    review: "new",
  },
  {
    id: "holy_shock",
    name: "Holy Shock",
    rank: 1,
    x: 1,
    y: 4,
    requiredTreePoints: 20,
    prerequisite: [],
    description:
      "Blasts the target with Holy energy, causing 204 to 220 Holy damage to an enemy, or 204 to 220 healing to an ally.",
    review: "classic",
  },
  {
    id: "consecrated_ground",
    name: "Consecrated Ground",
    rank: 2,
    x: 2,
    y: 4,
    requiredTreePoints: 20,
    prerequisite: [],
    description:
      "Gives your Holy spells 10% increased damage against the first 4 enemies that enter your Consecration.",
    review: "new",
  },
  {
    id: "holy_power",
    name: "Holy Power",
    rank: 5,
    x: 2,
    y: 5,
    requiredTreePoints: 25,
    prerequisite: [],
    description:
      "Increases the critical effect chance of your Holy spells by 5%.",
    review: "classic",
  },
  {
    id: "light_s_vigil",
    name: "Light's Vigil",
    rank: 1,
    x: 1,
    y: 6,
    requiredTreePoints: 30,
    prerequisite: ["holy_shock"],
    description:
      "Applies Light's Vigil to the target for 30 sec. Your next Holy Shock cast on them triggers no cooldown and causes friendly targets to heal their party for 315 to 333, or enemy targets to suffer 175 to 189 Holy damage and refund 75% of Light's Vigil's Mana cost. You may only have 1 Light's Vigil active per Paladin, per party.",
    review: "new",
  },
];

const protection: RawTalent[] = [
  {
    id: "toughness",
    name: "Toughness",
    rank: 5,
    x: 1,
    y: 0,
    requiredTreePoints: 0,
    prerequisite: [],
    description: "Increases your armor value from items by 10%.",
    review: "classic",
  },
  {
    id: "redoubt",
    name: "Redoubt",
    rank: 5,
    x: 2,
    y: 0,
    requiredTreePoints: 0,
    prerequisite: [],
    description:
      "Increases your chance to block attacks with your shield by 30% after being the victim of a critical strike.  Lasts 10 sec or 5 blocks.",
    review: "updated",
  },
  {
    id: "precision",
    name: "Precision",
    rank: 3,
    x: 0,
    y: 1,
    requiredTreePoints: 5,
    prerequisite: [],
    description: "Increases your chance to hit with melee weapons by 3%.",
    review: "classic",
  },
  {
    id: "guardian_s_favor",
    name: "Guardian's Favor",
    rank: 2,
    x: 1,
    y: 1,
    requiredTreePoints: 5,
    prerequisite: [],
    description:
      "Reduces the cooldown of your Blessing of Protection by 120 sec and increases the duration of your Blessing of Freedom by 6 sec.",
    review: "classic",
  },
  {
    id: "anticipation",
    name: "Anticipation",
    rank: 5,
    x: 3,
    y: 1,
    requiredTreePoints: 5,
    prerequisite: [],
    description: "Increases your Defense skill by 10.",
    review: "updated",
  },
  {
    id: "improved_seal_of_fury",
    name: "Improved Seal of Fury",
    rank: 1,
    x: 0,
    y: 2,
    requiredTreePoints: 10,
    prerequisite: [],
    description:
      "When Seal of Fury's shield is fully absorbed, restore 38 Mana, increased by 15% per level the attacker is above you, up to 45%.",
    review: "new",
  },
  {
    id: "improved_righteous_fury",
    name: "Improved Righteous Fury",
    rank: 3,
    x: 1,
    y: 2,
    requiredTreePoints: 10,
    prerequisite: [],
    description:
      "Increases the amount of threat generated by your Righteous Fury spell by 50%.",
    review: "classic",
  },
  {
    id: "shield_specialization",
    name: "Shield Specialization",
    rank: 3,
    x: 2,
    y: 2,
    requiredTreePoints: 10,
    prerequisite: ["redoubt"],
    description:
      "Increases the amount of damage absorbed by your shield by 30%.",
    review: "classic",
  },
  {
    id: "sacred_duty",
    name: "Sacred Duty",
    rank: 2,
    x: 3,
    y: 2,
    requiredTreePoints: 10,
    prerequisite: [],
    description:
      "Increases your total Stamina by 4% and reduces the cooldown of your Divine Shield, Divine Protection, and Templar's Bulwark spells by 60 sec.",
    review: "new",
  },
  {
    id: "swift_judgement",
    name: "Swift Judgement",
    rank: 1,
    x: 0,
    y: 3,
    requiredTreePoints: 15,
    prerequisite: ["improved_seal_of_fury"],
    description:
      "Finishes the remaining cooldown on your Judgement ability and reduces the Mana cost of your next Judgement by 100%.",
    review: "new",
  },
  {
    id: "one_handed_weapon_specialization",
    name: "One-Handed Weapon Specialization",
    rank: 3,
    x: 1,
    y: 3,
    requiredTreePoints: 15,
    prerequisite: [],
    description:
      "Increases the damage you deal with one-handed melee weapons by 6%.",
    review: "classic",
  },
  {
    id: "improved_hammer_of_justice",
    name: "Improved Hammer of Justice",
    rank: 3,
    x: 2,
    y: 3,
    requiredTreePoints: 15,
    prerequisite: [],
    description:
      "Decreases the cooldown of your Hammer of Justice spell by 15 sec.",
    review: "classic",
  },
  {
    id: "templar_s_bulwark",
    name: "Templar's Bulwark",
    rank: 1,
    x: 1,
    y: 4,
    requiredTreePoints: 20,
    prerequisite: [],
    description:
      "When activated, this ability grants you an absorb shield equal to 100% of your maximum health for 8 sec. Applies Forbearance for 1 min. Cannot be cast while Forbearance is active.",
    review: "new",
  },
  {
    id: "reckoning",
    name: "Reckoning",
    rank: 5,
    x: 2,
    y: 4,
    requiredTreePoints: 20,
    prerequisite: [],
    description:
      "Gives you a 40% chance to gain an extra attack after Blocking a melee attack and a 100% chance to gain an extra attack after being the victim of a non-periodic critical strike.",
    review: "updated",
  },
  {
    id: "iron_creed",
    name: "Iron Creed",
    rank: 5,
    x: 2,
    y: 5,
    requiredTreePoints: 25,
    prerequisite: [],
    description:
      "Increases the threat generated by your Holy Strike ability 25%. While Righteous Fury is active, Holy Strike also reduces your damage taken by 10% for 6 sec.",
    review: "new",
  },
  {
    id: "holy_shield",
    name: "Holy Shield",
    rank: 1,
    x: 1,
    y: 6,
    requiredTreePoints: 30,
    prerequisite: ["templar_s_bulwark"],
    description:
      "Increases chance to block by 20% for 10 sec, and deals 110 Holy damage for each attack blocked while active. Damage caused by Holy Shield causes 20% additional threat. Each block expends a charge. 4 charges.",
    review: "classic",
  },
];

const retribution: RawTalent[] = [
  {
    id: "deflection",
    name: "Deflection",
    rank: 5,
    x: 1,
    y: 0,
    requiredTreePoints: 0,
    prerequisite: [],
    description: "Increases your Parry chance by 5%.",
    review: "classic",
  },
  {
    id: "benediction",
    name: "Benediction",
    rank: 5,
    x: 2,
    y: 0,
    requiredTreePoints: 0,
    prerequisite: [],
    description:
      "Reduces the Mana cost of your Judgement and Seal spells by 15%.",
    review: "updated",
  },
  {
    id: "improved_judgement",
    name: "Improved Judgement",
    rank: 2,
    x: 0,
    y: 1,
    requiredTreePoints: 5,
    prerequisite: [],
    description: "Decreases the cooldown of your Judgement spell by 2 sec.",
    review: "updated",
  },
  {
    id: "holy_conduit",
    name: "Holy Conduit",
    rank: 2,
    x: 1,
    y: 1,
    requiredTreePoints: 5,
    prerequisite: [],
    description:
      "Reduces the mana cost of your Consecration, Holy Wrath, Exorcism, and Hammer of Wrath spells by 40%.",
    review: "new",
  },
  {
    id: "conviction",
    name: "Conviction",
    rank: 5,
    x: 2,
    y: 1,
    requiredTreePoints: 5,
    prerequisite: [],
    description:
      "Increases your chance to get a critical strike with melee weapons by 5%.",
    review: "classic",
  },
  {
    id: "vindication",
    name: "Vindication",
    rank: 3,
    x: 0,
    y: 2,
    requiredTreePoints: 10,
    prerequisite: [],
    description:
      "Gives the Paladin's damaging melee attacks a chance to reduce the target's Strength and Agility by 15% for 10 sec.",
    review: "updated",
  },
  {
    id: "sanctified_judgement",
    name: "Sanctified Judgement",
    rank: 3,
    x: 1,
    y: 2,
    requiredTreePoints: 10,
    prerequisite: [],
    description:
      "Gives your Judgement ability a 100% chance to return 60% of the Mana cost of the judged seal.",
    review: "new",
  },
  {
    id: "seal_of_command",
    name: "Seal of Command",
    rank: 1,
    x: 2,
    y: 2,
    requiredTreePoints: 10,
    prerequisite: [],
    description:
      "Gives the Paladin a chance to deal additional Holy damage equal to 70% of normal weapon damage. Only one Seal can be active on the Paladin at any one time. Lasts 30 sec. Unleashing this Seal's energy will judge an enemy, instantly causing 68 to 73 Holy damage, 137 to 146 if the target is stunned or incapacitated.",
    review: "updated",
  },
  {
    id: "pursuit_of_justice",
    name: "Pursuit of Justice",
    rank: 2,
    x: 3,
    y: 2,
    requiredTreePoints: 10,
    prerequisite: [],
    description:
      "Increases movement and mounted movement speed by 8%.  This does not stack with other movement speed increasing effects.",
    review: "classic",
  },
  {
    id: "eye_for_an_eye",
    name: "Eye for an Eye",
    rank: 2,
    x: 0,
    y: 3,
    requiredTreePoints: 15,
    prerequisite: [],
    description:
      "All critical strikes against you cause 10% of the damage taken to the attacker as well. The damage caused by Eye for an Eye will not exceed 50% of the Paladin's total health.",
    review: "updated",
  },
  {
    id: "sacred_arbiter",
    name: "Sacred Arbiter",
    rank: 1,
    x: 2,
    y: 3,
    requiredTreePoints: 15,
    prerequisite: [],
    description:
      "Increases the damage of your Holy Strike ability by 10% and causes it to refresh all Judgement effects on the target.",
    review: "new",
  },
  {
    id: "crusade",
    name: "Crusade",
    rank: 2,
    x: 3,
    y: 3,
    requiredTreePoints: 15,
    prerequisite: [],
    description:
      "Increases all damage dealt by 2%. Increased by an additional 2% against Demon and Undead targets.",
    review: "new",
  },
  {
    id: "two_handed_weapon_specialization",
    name: "Two-Handed Weapon Specialization",
    rank: 3,
    x: 0,
    y: 4,
    requiredTreePoints: 20,
    prerequisite: [],
    description:
      "Increases the damage you deal with two-handed melee weapons by 9%.",
    review: "updated",
  },
  {
    id: "vengeance",
    name: "Vengeance",
    rank: 3,
    x: 1,
    y: 4,
    requiredTreePoints: 20,
    prerequisite: ["sanctified_judgement"],
    description:
      "Gives you a 9% bonus to Physical and Holy damage you deal for 8 sec after dealing a critical strike from a weapon swing, spell, or ability.",
    review: "updated",
  },
  {
    id: "repentance",
    name: "Repentance",
    rank: 1,
    x: 2,
    y: 4,
    requiredTreePoints: 20,
    prerequisite: [],
    description:
      "Puts the enemy target in a state of meditation, incapacitating them for up to 6 sec. Any damage caused will awaken the target. Only works against Humanoids.",
    review: "classic",
  },
  {
    id: "champion_of_the_light",
    name: "Champion of the Light",
    rank: 3,
    x: 1,
    y: 5,
    requiredTreePoints: 25,
    prerequisite: [],
    description:
      "Increases your spell damage and healing by up to 99% of your Intellect.",
    review: "new",
  },
  {
    id: "instrument_of_law",
    name: "Instrument of Law",
    rank: 2,
    x: 2,
    y: 5,
    requiredTreePoints: 25,
    prerequisite: [],
    description:
      "Reduces the cast time of your Hammer of Wrath by 1 sec, and reduces all threat you generate by 20% while Righteous Fury is not active.",
    review: "new",
  },
  {
    id: "twist_of_light",
    name: "Twist of Light",
    rank: 1,
    x: 1,
    y: 6,
    requiredTreePoints: 30,
    prerequisite: [],
    description:
      "When you replace your Seal of Command, Seal of Righteousness, Seal of Fury, or Seal of Justice with a different Seal, gain an Echo. Your next melee attack applies the replaced Seal's effects, consuming the Echo.",
    review: "new",
  },
];

function toTalents(branch: Branch, raw: RawTalent[]): Talent[] {
  return raw.map((talent) => {
    const officiallyNamed = OFFICIALLY_NAMED_TALENTS.has(talent.id);
    const sources: TalentSource[] = [
      {
        type: "demo_recording",
        label: "WoW Forever public demo",
        locator: `${branchNames[branch]} talent tree`,
      },
      {
        type: "community_transcription",
        label: "Talents Forever transcription",
        url: COMMUNITY_TRANSCRIPTION_URL,
      },
    ];

    if (officiallyNamed) {
      sources.unshift({
        type: "official",
        label: "Blizzard WoW Forever Deep Dive",
        url: OFFICIAL_DEEP_DIVE_URL,
        locator: "A Closer Look at Paladins",
      });
    }

    if (talent.review === "classic") {
      sources.push({
        type: "classic_reference",
        label: "Warcraft Wiki Classic comparison",
        url: CLASSIC_REFERENCE_URL,
      });
    }

    return {
      id: talent.id,
      name: talent.name,
      branch,
      maxRank: talent.rank,
      requiredTreePoints: talent.requiredTreePoints,
      prerequisite: talent.prerequisite.length
        ? talent.prerequisite.map((talentId) => ({ talentId, requiredRank: null }))
        : undefined,
      icon: BRANCH_ICON[branch],
      dataVersion: PREVIEW_DATA_VERSION,
      changeType:
        talent.review === "classic" ? "classic_unchanged" : talent.review,
      verificationStatus: "demo_verified",
      verification: {
        name: officiallyNamed ? "official_confirmed" : "demo_verified",
        maxRank: "demo_verified",
        tier: "demo_verified",
        description: "demo_verified",
        prerequisiteLink: "demo_verified",
        prerequisiteRule: "derived_assumption",
      },
      description: talent.description,
      row: talent.y,
      column: talent.x,
      x: COLUMN_X[talent.x],
      y: TIER_Y[talent.y],
      sources,
    };
  });
}

export const communityPreviewTalents: Talent[] = [
  ...toTalents("holy", holy),
  ...toTalents("protection", protection),
  ...toTalents("retribution", retribution),
];

type BetaTalentRecord =
  | (typeof betaTalentData.talents)[number]
  | (typeof previousBetaTalentData.talents)[number];

function toBetaTalent(
  record: BetaTalentRecord,
  source: { dataVersion: TalentDataVersion; clientBuild: string; url: string; label: string },
): Talent {
  const branch = record.branch as Branch;
  const sources: TalentSource[] = [
    {
      type: "beta_client",
      label: `WoW Forever Beta client ${source.clientBuild}`,
      url: source.url,
      locator: `${branchNames[branch]} · row ${record.row + 1}, column ${record.column + 1}`,
    },
    {
      type: "community_transcription",
      label: source.label,
      url: source.url,
    },
  ];

  if (OFFICIALLY_NAMED_TALENTS.has(record.id)) {
    sources.push({
      type: "official",
      label: "Blizzard WoW Forever Deep Dive",
      url: OFFICIAL_DEEP_DIVE_URL,
      locator: "A Closer Look at Paladins",
    });
  }

  if (record.changeType !== "new") {
    sources.push({
      type: "classic_reference",
      label: "Warcraft Wiki Classic comparison",
      url: CLASSIC_REFERENCE_URL,
    });
  }

  return {
    id: record.id,
    name: record.name,
    branch,
    maxRank: record.maxRank,
    requiredTreePoints: record.requiredTreePoints,
    prerequisite: record.prerequisite.length
      ? record.prerequisite.map((talentId) => ({ talentId, requiredRank: null }))
      : undefined,
    icon: BRANCH_ICON[branch],
    dataVersion: source.dataVersion,
    changeType: record.changeType as ChangeType,
    verificationStatus: "client_verified",
    verification: {
      name: "client_verified",
      maxRank: "client_verified",
      tier: "client_verified",
      description: "client_verified",
      prerequisiteLink: "client_verified",
      prerequisiteRule: "derived_assumption",
    },
    description: record.description,
    rankDescriptions: record.rankDescriptions,
    clientNodeId: "nodeId" in record ? record.nodeId : undefined,
    spellId: "spellId" in record ? record.spellId : undefined,
    confirmedRanks: record.confirmedRanks,
    complete: record.complete,
    row: record.row,
    column: record.column,
    x: COLUMN_X[record.column],
    y: TIER_Y[record.row],
    sources,
  };
}

export const betaTalents: Talent[] = betaTalentData.talents.map((record) =>
  toBetaTalent(record, {
    dataVersion: BETA_DATA_VERSION,
    clientBuild: betaTalentData.clientBuild,
    url: BETA_DATA_URL,
    label: "WoW Classic Forever client-data export",
  }),
);

export const previousBetaTalents: Talent[] = previousBetaTalentData.talents.map((record) =>
  toBetaTalent(record, {
    dataVersion: "wow_forever_beta_1.60.1.69876",
    clientBuild: previousBetaTalentData.clientBuild,
    url: PREVIOUS_BETA_DATA_URL,
    label: "Talents Forever client-data export",
  }),
);

// The interactive calculator uses the reviewed Beta dataset. The demo
// transcription remains available separately for the public change log.
export const talents = betaTalents;

export function talentEvidenceLabel(talent: Talent): string {
  if (talent.verificationStatus === "client_verified") {
    return "Verified from Beta client data";
  }
  if (talent.verification.name === "official_confirmed") {
    return "Officially confirmed name · Demo-verified details";
  }
  return "Archived public demo transcription";
}
