import { encodeBuild, type Build } from '../lib/build'

/**
 * The five selected nodes were checked against the Paladin TraitTree (1100) in
 * the 70170 Beta client. ForeverDiff reports the 70205 client tables identical
 * to 70170. This is route evidence, not a replacement for the imported 69913
 * all-tree snapshot or an in-game performance test.
 */
export const PROTECTION_ROUTE_EVIDENCE = {
  treeId: 1100,
  reviewedClientBuild: '1.60.1.70170',
  equivalentClientBuild: '1.60.1.70205',
  reviewedAt: 'October 5, 2026',
  traitNodes: 'https://wago.tools/db2/TraitNode/csv?build=1.60.1.70170',
  traitEntries: 'https://wago.tools/db2/TraitNodeEntry/csv?build=1.60.1.70170',
  nodeEntryLinks: 'https://wago.tools/db2/TraitNodeXTraitNodeEntry/csv?build=1.60.1.70170',
  definitions: 'https://wago.tools/db2/TraitDefinition/csv?build=1.60.1.70170',
  skillLineTrees: 'https://wago.tools/db2/SkillLineXTraitTree/csv?build=1.60.1.70170',
  spellNames: 'https://wago.tools/db2/SpellName/csv?build=1.60.1.70170',
  traitEdges: 'https://wago.tools/db2/TraitEdge/csv?build=1.60.1.70170',
  equivalentDiff: 'https://foreverdiff.com/builds/1.60.1.70205/',
  officialPatch: 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696/1',
  nodes: [
    { id: 'toughness', nodeId: 105630, spellId: 20143, posX: 5620, posY: 2130, maxRank: 5 },
    { id: 'redoubt', nodeId: 105626, spellId: 20127, posX: 6220, posY: 2130, maxRank: 5 },
    { id: 'precision', nodeId: 105638, spellId: 20189, posX: 5020, posY: 2730, maxRank: 3 },
    { id: 'anticipation', nodeId: 105636, spellId: 20096, posX: 6820, posY: 2730, maxRank: 5 },
    { id: 'improved_righteous_fury', nodeId: 105634, spellId: 20468, posX: 5620, posY: 3330, maxRank: 3 },
  ],
} as const

export const PROTECTION_LEVEL_20: Build = { toughness: 5, redoubt: 5, precision: 1 }
export const PROTECTION_LEVEL_30: Build = {
  toughness: 5,
  redoubt: 5,
  precision: 3,
  anticipation: 5,
  improved_righteous_fury: 3,
}

export const protectionPlannerHref = (level: 20 | 30) =>
  `/build?id=${encodeBuild(level === 20 ? PROTECTION_LEVEL_20 : PROTECTION_LEVEL_30)}&level=${level}#calculator`
