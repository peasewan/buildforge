export const PALADIN_CLIENT_TABLES = [
  'SkillLineXTraitTree', 'TraitNode', 'TraitNodeXTraitNodeEntry',
  'TraitNodeEntry', 'TraitDefinition', 'SpellName', 'Spell', 'TraitEdge',
] as const
export type PaladinClientTable = typeof PALADIN_CLIENT_TABLES[number]
type Row = Record<string, string>

export interface PaladinTalentRecord {
  id: string; name: string; branch: string; maxRank: number; row: number; column: number
  requiredTreePoints: number; prerequisite: string[]; rankDescriptions: string[]
  description: string; nodeId: number; spellId: number; changeType: string
  iconName: string; complete: boolean; confirmedRanks: number[]
  [key: string]: unknown
}
export interface PaladinSnapshot {
  sourceVersion: string; clientBuild: string; talents: PaladinTalentRecord[]
  [key: string]: unknown
}
interface ResolvedTalent {
  name: string; max: number; row: number; col: number; desc: string[]
  complete: boolean; confirmed: number[]
}
interface ResolvedExport {
  license: string
  attribution: string
  talents: { Paladin: { source: string; trees: { name: string; talents: ResolvedTalent[] }[] } }
}
export interface ReconcileInput {
  baseline: PaladinSnapshot; build: string
  tables: Record<PaladinClientTable, string>; resolved: ResolvedExport
  resolvedClientTables?: Record<PaladinClientTable, string>
}
type Identity = { id: string; name: string; nodeId: number }
type FieldChange<T> = Identity & { before: T; after: T }
type TooltipChange = Identity & { ranks: { rank: number; before: string; after: string }[] }
type Position = { branch: string; row: number; column: number; requiredTreePoints: number }
export interface PaladinClientDiff {
  from: string; to: string
  summary: Record<'added' | 'removed' | 'moved' | 'rank_changed' | 'tooltip_changed' | 'prerequisite_changed' | 'unchanged', number>
  added: Identity[]; removed: Identity[]; moved: FieldChange<Position>[]
  rank_changed: FieldChange<number>[]; tooltip_changed: TooltipChange[]
  prerequisite_changed: FieldChange<string[]>[]; unchanged: Identity[]
}

/** Handles quoted commas, escaped quotes and embedded newlines in Wago CSV. */
export function parseClientCsv(input: string): Row[] {
  const lines: string[][] = []
  let fields: string[] = [], field = '', quoted = false
  for (let i = 0; i < input.length; i += 1) {
    const c = input[i]
    if (quoted) {
      if (c === '"' && input[i + 1] === '"') { field += '"'; i += 1 }
      else if (c === '"') quoted = false
      else field += c
    } else if (c === '"' && field === '') quoted = true
    else if (c === ',') { fields.push(field); field = '' }
    else if (c === '\n') { fields.push(field); lines.push(fields); fields = []; field = '' }
    else if (c !== '\r') field += c
  }
  if (quoted) throw new Error('Unclosed client CSV quote')
  if (field || fields.length) { fields.push(field); lines.push(fields) }
  if (!lines.length) throw new Error('Empty client CSV')
  const [header, ...records] = lines
  if (new Set(header).size !== header.length) throw new Error('Duplicate client CSV header')
  return records.filter((record) => record.some(Boolean)).map((record, index) => {
    if (record.length !== header.length) throw new Error('Client CSV column count at row ' + (index + 2))
    return Object.fromEntries(header.map((name, column) => [name, record[column]]))
  })
}

function number(value: string | undefined, field: string): number {
  const parsed = Number(value)
  if (!value || !Number.isSafeInteger(parsed)) throw new Error('Invalid ' + field + ': ' + value)
  return parsed
}
function indexRows(rows: Row[], name: string): Map<number, Row> {
  const result = new Map<number, Row>()
  for (const row of rows) {
    const id = number(row.ID, name + '.ID')
    if (result.has(id)) throw new Error('Duplicate ' + name + ' ID ' + id)
    result.set(id, row)
  }
  return result
}
function getRow(rows: Map<number, Row>, id: number, name: string): Row {
  const row = rows.get(id)
  if (!row) throw new Error('Missing ' + name + ' ' + id)
  return row
}
function grid(x: number, y: number): Omit<Position, 'requiredTreePoints'> {
  const branch = x < 4000 ? 'holy' : x < 8000 ? 'protection' : 'retribution'
  const base = branch === 'holy' ? 1020 : branch === 'protection' ? 5020 : 9080
  const column = Math.round((x - base) / 600), row = Math.round((y - 2130) / 600)
  if (column < 0 || column > 3 || row < 0 || row > 6 ||
      Math.abs(x - (base + column * 600)) > 20 || y !== 2130 + row * 600) {
    throw new Error('Unreviewed Paladin grid position ' + x + ',' + y)
  }
  return { branch, row, column }
}
function idOf(talent: PaladinTalentRecord): Identity {
  return { id: talent.id, name: talent.name, nodeId: talent.nodeId }
}
function compare(old: PaladinSnapshot, next: PaladinSnapshot): PaladinClientDiff {
  const before = new Map(old.talents.map((talent) => [talent.nodeId, talent]))
  const after = new Map(next.talents.map((talent) => [talent.nodeId, talent]))
  const diff: PaladinClientDiff = {
    from: old.clientBuild, to: next.clientBuild,
    summary: { added: 0, removed: 0, moved: 0, rank_changed: 0, tooltip_changed: 0, prerequisite_changed: 0, unchanged: 0 },
    added: [], removed: [], moved: [], rank_changed: [], tooltip_changed: [], prerequisite_changed: [], unchanged: [],
  }
  for (const talent of old.talents) if (!after.has(talent.nodeId)) diff.removed.push(idOf(talent))
  for (const talent of next.talents) {
    const previous = before.get(talent.nodeId)
    if (!previous) { diff.added.push(idOf(talent)); continue }
    let changed = false
    const oldPosition = { branch: previous.branch, row: previous.row, column: previous.column, requiredTreePoints: previous.requiredTreePoints }
    const newPosition = { branch: talent.branch, row: talent.row, column: talent.column, requiredTreePoints: talent.requiredTreePoints }
    if (JSON.stringify(oldPosition) !== JSON.stringify(newPosition)) {
      diff.moved.push({ ...idOf(talent), before: oldPosition, after: newPosition }); changed = true
    }
    if (previous.maxRank !== talent.maxRank) {
      diff.rank_changed.push({ ...idOf(talent), before: previous.maxRank, after: talent.maxRank }); changed = true
    }
    const ranks: TooltipChange['ranks'] = []
    for (let i = 0; i < Math.max(previous.rankDescriptions.length, talent.rankDescriptions.length); i += 1) {
      const prior = previous.rankDescriptions[i] ?? '', current = talent.rankDescriptions[i] ?? ''
      if (prior !== current) ranks.push({ rank: i + 1, before: prior, after: current })
    }
    if (ranks.length) { diff.tooltip_changed.push({ ...idOf(talent), ranks }); changed = true }
    if (JSON.stringify(previous.prerequisite) !== JSON.stringify(talent.prerequisite)) {
      diff.prerequisite_changed.push({ ...idOf(talent), before: previous.prerequisite, after: talent.prerequisite }); changed = true
    }
    if (!changed) diff.unchanged.push(idOf(talent))
  }
  for (const key of Object.keys(diff.summary) as (keyof PaladinClientDiff['summary'])[]) diff.summary[key] = diff[key].length
  return diff
}

/** Independent publication gate for a saved versioned candidate. */
export function validatePaladinCandidate(candidate: PaladinSnapshot, clientNodeIds: readonly number[]): string[] {
  const errors: string[] = []
  if (candidate.sourceVersion !== 'wow_forever_beta_' + candidate.clientBuild) {
    errors.push('Source version does not match client build')
  }
  const requiredText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
  if (!requiredText(candidate.basedOnBuild) || candidate.basedOnBuild === candidate.clientBuild) {
    errors.push('Missing candidate comparison build')
  }
  if (!requiredText(candidate.verificationSummary) ||
      !candidate.verificationSummary.includes(candidate.clientBuild)) {
    errors.push('Missing candidate verification summary')
  }
  const verificationSources = candidate.verificationSources
  const hasVerificationSource = (url: string): boolean => Array.isArray(verificationSources) &&
    verificationSources.some((source) => typeof source === 'object' && source !== null &&
      (source as Record<string, unknown>).url === url)
  if (!hasVerificationSource('https://wago.tools/db2/TraitNode/csv?build=' + candidate.clientBuild) ||
      !hasVerificationSource('https://talentsforever.com/data.json')) {
    errors.push('Missing candidate verification sources')
  }
  if (!requiredText(candidate.sourceUrl) || !candidate.sourceUrl.includes('wago.tools/db2/TraitNode/') ||
      !candidate.sourceUrl.includes(candidate.clientBuild)) errors.push('Missing client source URL')
  if (!requiredText(candidate.resolvedRankSourceUrl) ||
      !candidate.resolvedRankSourceUrl.includes('talentsforever.com/data.json')) errors.push('Missing resolved rank source URL')
  if (!requiredText(candidate.resolvedRankSourceBuild)) errors.push('Missing resolved rank source build')
  if (!requiredText(candidate.license) || !candidate.license.includes('CC-BY-4.0') ||
      candidate.resolvedRankLicense !== 'CC-BY-4.0') errors.push('Missing resolved rank license')
  if (candidate.resolvedRankLicenseUrl !== 'https://creativecommons.org/licenses/by/4.0/') {
    errors.push('Missing resolved rank license URL')
  }
  if (!requiredText(candidate.attribution) || !candidate.attribution.includes('Talents Forever') ||
      !candidate.attribution.includes('adapted')) errors.push('Missing rank text attribution')
  if (!requiredText(candidate.resolvedRankAdaptationNotice) ||
      !candidate.resolvedRankAdaptationNotice.includes('adapted')) errors.push('Missing adaptation notice')
  const expectedNodes = new Set(clientNodeIds)
  const candidateNodes = new Set(candidate.talents.map((talent) => talent.nodeId))
  if (!clientNodeIds.length || expectedNodes.size !== clientNodeIds.length) errors.push('Invalid client node reference set')
  for (const nodeId of expectedNodes) if (!candidateNodes.has(nodeId)) errors.push('Missing client node ' + nodeId)
  for (const nodeId of candidateNodes) if (!expectedNodes.has(nodeId)) errors.push('Extra candidate node ' + nodeId)
  if (candidate.talents.length !== clientNodeIds.length) errors.push('Candidate/client node count mismatch')
  const ids = new Set<string>(), nodes = new Set<number>(), spells = new Set<number>(), cells = new Set<string>()
  const byId = new Map(candidate.talents.map((talent) => [talent.id, talent]))
  for (const talent of candidate.talents) {
    const cell = talent.branch + ':' + talent.row + ':' + talent.column
    if (ids.has(talent.id)) errors.push(talent.id + ': duplicate stable ID')
    if (nodes.has(talent.nodeId)) errors.push(talent.id + ': duplicate node ID')
    if (spells.has(talent.spellId)) errors.push(talent.id + ': duplicate spell ID')
    if (cells.has(cell)) errors.push(talent.id + ': duplicate grid cell')
    ids.add(talent.id); nodes.add(talent.nodeId); spells.add(talent.spellId); cells.add(cell)
    if (!['holy', 'protection', 'retribution'].includes(talent.branch) ||
        !Number.isInteger(talent.row) || talent.row < 0 || talent.row > 6 ||
        !Number.isInteger(talent.column) || talent.column < 0 || talent.column > 3 ||
        talent.requiredTreePoints !== talent.row * 5) errors.push(talent.id + ': invalid grid or point requirement')
    if (!Number.isInteger(talent.maxRank) || talent.maxRank < 1 ||
        talent.rankDescriptions.length !== talent.maxRank ||
        talent.rankDescriptions.some((description) => !description.trim()) ||
        talent.description !== talent.rankDescriptions[talent.maxRank - 1]) errors.push(talent.id + ': incomplete rank descriptions')
    if (!talent.complete || JSON.stringify(talent.confirmedRanks) !==
        JSON.stringify(Array.from({ length: talent.maxRank }, (_, i) => i + 1))) errors.push(talent.id + ': incomplete confirmed ranks')
    if (talent.rankTextVerification !== 'community_verified' && talent.rankTextVerification !== 'official') {
      errors.push(talent.id + ': missing rank text source status')
    }
    for (const prior of talent.prerequisite) {
      const parent = byId.get(prior)
      if (!parent) errors.push(talent.id + ': missing prerequisite ' + prior)
      else if (parent.branch !== talent.branch) errors.push(talent.id + ': cross-tree prerequisite ' + prior)
    }
  }
  const visiting = new Set<string>(), visited = new Set<string>()
  const hasCycle = (id: string): boolean => {
    if (visiting.has(id)) return true
    if (visited.has(id)) return false
    visiting.add(id)
    const cycle = (byId.get(id)?.prerequisite ?? []).some((prior) => byId.has(prior) && hasCycle(prior))
    visiting.delete(id); visited.add(id)
    return cycle
  }
  if (candidate.talents.some((talent) => hasCycle(talent.id))) errors.push('Prerequisite cycle')
  return errors
}

export function reconcilePaladinClient(input: ReconcileInput): { candidate: PaladinSnapshot; diff: PaladinClientDiff } {
  if (!/^1\.60\.1\.\d+$/.test(input.build)) throw new Error('Invalid client build ' + input.build)
  const csv = Object.fromEntries(PALADIN_CLIENT_TABLES.map((table) => [table, parseClientCsv(input.tables[table])])) as Record<PaladinClientTable, Row[]>
  const maps = csv.SkillLineXTraitTree.filter((row) => row.SkillLineID === '184')
  if (maps.length !== 1 || maps[0].TraitTreeID !== '1100') throw new Error('Paladin SkillLine 184 must map uniquely to TraitTree 1100')
  const nodes = csv.TraitNode.filter((row) => row.TraitTreeID === '1100')
  if (!nodes.length) throw new Error('Empty Paladin TraitTree 1100')
  const active = new Set(nodes.map((row) => number(row.ID, 'TraitNode.ID')))
  const old = new Map(input.baseline.talents.map((talent) => [talent.nodeId, talent]))
  const archiveOrder = new Map(input.baseline.talents.map((talent, index) => [talent.nodeId, index]))
  if (old.size !== input.baseline.talents.length) throw new Error('Duplicate baseline node ID')
  const links = new Map<number, number>()
  for (const row of csv.TraitNodeXTraitNodeEntry) {
    const node = number(row.TraitNodeID, 'TraitNodeXTraitNodeEntry.TraitNodeID')
    if (!active.has(node)) continue
    if (links.has(node)) throw new Error('Multiple entries for Paladin node ' + node)
    links.set(node, number(row.TraitNodeEntryID, 'TraitNodeXTraitNodeEntry.TraitNodeEntryID'))
  }
  const entries = indexRows(csv.TraitNodeEntry, 'TraitNodeEntry')
  const definitions = indexRows(csv.TraitDefinition, 'TraitDefinition')
  const names = indexRows(csv.SpellName, 'SpellName')
  const spells = indexRows(csv.Spell, 'Spell')
  const resolved = new Map<string, ResolvedTalent>()
  const resolvedPaladin = input.resolved?.talents?.Paladin
  if (input.resolved.license !== 'CC-BY-4.0' || !input.resolved.attribution?.includes('talentsforever.com')) {
    throw new Error('Resolved rank export lacks reviewed license or attribution')
  }
  if (!resolvedPaladin?.source?.includes('beta client') || !Array.isArray(resolvedPaladin.trees)) {
    throw new Error('Resolved Paladin ranks lack client source')
  }
  const resolvedBuild = resolvedPaladin.source.match(/1\.60\.1\.\d+/)?.[0]
  if (!resolvedBuild) throw new Error('Resolved Paladin ranks lack a source build')
  if (resolvedBuild !== input.build) {
    if (!input.resolvedClientTables) throw new Error('Resolved source client tables are required for a different build')
    for (const table of PALADIN_CLIENT_TABLES) {
      if (input.tables[table] !== input.resolvedClientTables[table]) {
        throw new Error('Client tables differ between ' + resolvedBuild + ' and ' + input.build + ': ' + table)
      }
    }
  }
  for (const tree of resolvedPaladin.trees) for (const talent of tree.talents) {
    const key = tree.name.toLowerCase() + ':' + talent.row + ':' + talent.col
    if (resolved.has(key)) throw new Error('Duplicate resolved talent at ' + key)
    resolved.set(key, talent)
  }
  const arrows = new Map<number, number[]>()
  for (const edge of csv.TraitEdge) {
    const left = number(edge.LeftTraitNodeID, 'TraitEdge.LeftTraitNodeID')
    const right = number(edge.RightTraitNodeID, 'TraitEdge.RightTraitNodeID')
    if (!active.has(left) && !active.has(right)) continue
    if (!active.has(left) || !active.has(right) || edge.Type !== '2') throw new Error('Unreviewed Paladin edge ' + edge.ID)
    arrows.set(right, [...(arrows.get(right) ?? []), left])
  }
  const used = new Set<string>()
  const talents = nodes.map((node): PaladinTalentRecord => {
    const nodeId = number(node.ID, 'TraitNode.ID')
    const archived = old.get(nodeId)
    if (!archived) throw new Error('New Paladin node ' + nodeId + ' requires stable ID review')
    const entryId = links.get(nodeId)
    if (entryId === undefined) throw new Error('Missing entry for Paladin node ' + nodeId)
    const entry = getRow(entries, entryId, 'TraitNodeEntry')
    const definition = getRow(definitions, number(entry.TraitDefinitionID, 'TraitDefinitionID'), 'TraitDefinition')
    if (definition.OverrideName_lang || definition.OverrideDescription_lang) throw new Error('Unreviewed trait override ' + nodeId)
    const spellId = number(definition.SpellID, 'TraitDefinition.SpellID')
    const name = getRow(names, spellId, 'SpellName').Name_lang
    if (!name || !getRow(spells, spellId, 'Spell').Description_lang) throw new Error('Missing client spell text ' + spellId)
    if (archived.name !== name) throw new Error('Changed talent name for ' + archived.id + ' needs identity review')
    const { branch, row, column } = grid(number(node.PosX, 'PosX'), number(node.PosY, 'PosY'))
    const key = branch + ':' + (row + 1) + ':' + (column + 1)
    const tooltip = resolved.get(key)
    if (!tooltip) throw new Error('Missing resolved rank text at ' + key)
    used.add(key)
    if (tooltip.name !== name) throw new Error('Client/resolved name mismatch at ' + key + ': ' + name + ' vs ' + tooltip.name)
    const maxRank = number(entry.MaxRanks, 'MaxRanks')
    if (tooltip.max !== maxRank || !tooltip.complete || tooltip.desc.length !== maxRank ||
        tooltip.desc.some((description) => typeof description !== 'string' || !description.trim())) {
      throw new Error('Incomplete resolved ranks for ' + name)
    }
    if (JSON.stringify(tooltip.confirmed) !== JSON.stringify(Array.from({ length: maxRank }, (_, i) => i + 1))) {
      throw new Error('Missing confirmed ranks for ' + name)
    }
    if (archived.spellId !== spellId) throw new Error('Changed spell ID for ' + archived.id + ' needs identity review')
    const prerequisite = (arrows.get(nodeId) ?? []).map((prior) => {
      const parent = old.get(prior)
      if (!parent) throw new Error('Unmapped prerequisite node ' + prior)
      return parent.id
    }).sort()
    return {
      ...archived, name, branch, maxRank, row, column, requiredTreePoints: row * 5,
      prerequisite, rankDescriptions: tooltip.desc, description: tooltip.desc[maxRank - 1],
      complete: true, confirmedRanks: Array.from({ length: maxRank }, (_, i) => i + 1),
      rankTextVerification: 'community_verified',
      nodeId, spellId,
    }
  }).sort((a, b) => (archiveOrder.get(a.nodeId) ?? 0) - (archiveOrder.get(b.nodeId) ?? 0))
  if (used.size !== resolved.size) throw new Error('Resolved export has talent absent from client tree')
  if (new Set(talents.map((talent) => talent.id)).size !== talents.length) throw new Error('Duplicate imported stable ID')
  const candidate: PaladinSnapshot = {
    sourceVersion: 'wow_forever_beta_' + input.build, clientBuild: input.build,
    generated: new Date().toISOString().slice(0, 10),
    license: 'Game client factual data; resolved rank descriptions adapted from Talents Forever under CC-BY-4.0',
    attribution: input.build + ' structure and raw spell text from Wago DB2; resolved rank descriptions adapted from Talents Forever (CC-BY-4.0); selected tuning checked against Blizzard Beta notes',
    sourceUrl: 'https://wago.tools/db2/TraitNode/csv?build=' + input.build,
    basedOnBuild: input.baseline.clientBuild,
    verificationSources: [
      { label: 'Wago DB2 — Paladin TraitTree 1100, client build ' + input.build,
        url: 'https://wago.tools/db2/TraitNode/csv?build=' + input.build },
      { label: 'Talents Forever — resolved Paladin rank descriptions, source build ' + resolvedBuild + ' (CC BY 4.0)',
        url: 'https://talentsforever.com/data.json' },
      { label: 'Blizzard Beta development notes — selected tuning checks',
        url: 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696' },
    ],
    resolvedRankSourceUrl: 'https://talentsforever.com/data.json',
    resolvedRankSourceBuild: resolvedBuild,
    resolvedRankLicense: input.resolved.license,
    resolvedRankLicenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    resolvedRankAdaptationNotice: 'Rank descriptions adapted from the Talents Forever export for BuildForgeTools; selected tuning checked against Blizzard Beta notes, with unresolved discrepancies recorded in the review.',
    talents,
  }
  const diff = compare(input.baseline, candidate)
  const changedRankStrings = diff.tooltip_changed.reduce((total, change) => total + change.ranks.length, 0)
  candidate.verificationSummary = `${input.build} compared with ${input.baseline.clientBuild}: ` +
    `${diff.summary.added} added, ${diff.summary.removed} removed, ${diff.summary.moved} moved, ` +
    `${diff.summary.rank_changed} rank-cap changes, ` +
    `${diff.summary.tooltip_changed} talent${diff.summary.tooltip_changed === 1 ? '' : 's'} with rank-description changes ` +
    `(${changedRankStrings} rank strings), ${diff.summary.prerequisite_changed} prerequisite-link changes. ` +
    `Resolved rank descriptions are adapted from the ${resolvedBuild} Talents Forever export; selected tuning was checked against Blizzard Beta notes.`
  return { candidate, diff }
}
