import type { ClassTalent } from './classPage'

export type ClientRow = Record<string, string>
interface CrosscheckNode {
  sourceTalentId: number; name: string; row: number; col: number; maxRanks: number
  spellIds?: number[]; ranks?: Record<string, string>; iconName?: string | null
  change?: { kind?: string }; requires?: { id: string; rank?: number }[]; id?: string
}
export interface ClientClassInput {
  classId: string; classMask: number; build: string; talents: ClientRow[]; tabs: ClientRow[]; spells: ClientRow[]
  crosscheck: { trees: { id: string; nodes: CrosscheckNode[] }[] }
}
export interface ImportedClassTalent extends ClassTalent<string> {
  nodeId: number; spellId: number; spellIds: number[]; dataNotes: string[]
}

/** Minimal RFC4180 reader: quoted commas, escaped quotes, CRLF and embedded newlines. */
export function parseClientCsv(csv: string): ClientRow[] {
  const records: string[][] = []; let row: string[] = []; let field = ''; let quoted = false
  for (let i = 0; i < csv.length; i++) {
    const char = csv[i]
    if (char === '"') {
      if (quoted && csv[i + 1] === '"') { field += '"'; i++ } else quoted = !quoted
    } else if (char === ',' && !quoted) { row.push(field); field = '' }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && csv[i + 1] === '\n') i++
      row.push(field); if (row.some(Boolean)) records.push(row); row = []; field = ''
    } else field += char
  }
  if (quoted) throw new Error('Unterminated CSV field')
  if (field || row.length) { row.push(field); records.push(row) }
  const header = records.shift() ?? []
  return records.map((cells) => {
    if (cells.length !== header.length) throw new Error('CSV column count mismatch')
    return Object.fromEntries(header.map((key, i) => [key, cells[i]]))
  })
}

const branchSlug = (name: string) => name.toLowerCase().replace(/feral[ -]combat/, 'feral').replaceAll(' ', '-')
const readable = (text?: string) => text && !/\$|\bX[% ]|\d+\.\d+\.\d+/.test(text) ? text : ''

export function importClientClass(input: ClientClassInput) {
  const { classId, classMask, build } = input
  const tabs = input.tabs.filter((tab) => Number(tab.ClassMask) === classMask).sort((a, b) => Number(a.OrderIndex) - Number(b.OrderIndex))
  const tabById = new Map(tabs.map((tab) => [tab.ID, tab]))
  const names = new Map(input.spells.map((spell) => [Number(spell.ID), spell.Name_lang]))
  const reference = new Map(input.crosscheck.trees.flatMap((tree) => tree.nodes.map((node) => [node.sourceTalentId, { ...node, branch: branchSlug(tree.id) }] as const)))
  const rows = input.talents.filter((talent) => tabById.has(talent.TabID))
  const conflicts: string[] = []
  const sources = [
    { label: `Wago Talent client table ${build}`, type: 'beta_client' as const, url: `https://wago.tools/db2/Talent?build=${build}` },
    { label: `TheWoWDB ${classId} client cross-check`, type: 'beta_client_crosscheck' as const, url: `https://thewowdb.com/wow-forever/talents/${classId}/` },
  ]
  const talents: ImportedClassTalent[] = rows.map((row) => {
    const nodeId = Number(row.ID); const tab = tabById.get(row.TabID)!
    const branch = branchSlug(tab.Name_lang); const cross = reference.get(nodeId)
    const spellIds = Array.from({ length: 9 }, (_, i) => Number(row[`SpellRank_${i}`] ?? 0)).filter(Boolean)
    const maxRank = spellIds.length; const tier = Number(row.TierID); const column = Number(row.ColumnIndex)
    const name = names.get(spellIds[0]); const notes: string[] = []
    if (!cross) conflicts.push(`${nodeId}: missing structural cross-check`)
    else {
      if (cross.branch !== branch || cross.row !== tier || cross.col !== column) conflicts.push(`${nodeId}: branch/position mismatch`)
      if (cross.maxRanks !== maxRank || (cross.spellIds && cross.spellIds.join() !== spellIds.join())) conflicts.push(`${nodeId}: rank/spell mismatch`)
      if (name && cross.name !== name) notes.push(`Primary SpellName record overrides reference label: ${cross.name}.`)
    }
    if (!name) notes.push('Client spell name is unreadable; a historical reference label is shown. Effects remain unverified.')
    const prerequisite = Array.from({ length: 3 }, (_, i) => Number(row[`PrereqTalent_${i}`] ?? 0)).filter(Boolean).map((id) => ({ talentId: `${classId}-${id}`, requiredRank: null }))
    for (const requirement of prerequisite) if (!rows.some((candidate) => `${classId}-${candidate.ID}` === requirement.talentId)) conflicts.push(`${nodeId}: missing prerequisite ${requirement.talentId}`)
    const rankDescriptions = Array.from({ length: maxRank }, (_, i) => readable(cross?.ranks?.[String(i + 1)]))
    if (rankDescriptions.some((text) => !text)) notes.push('Some rank tooltips are unavailable or contain unresolved client variables. No missing values are interpolated.')
    const iconName = cross?.iconName && /^[a-z0-9_]+$/.test(cross.iconName) ? cross.iconName : undefined
    return {
      id: `${classId}-${nodeId}`, nodeId, sourceTalentId: nodeId, spellId: spellIds[0], spellIds,
      name: name ?? cross?.name ?? `Client talent ${nodeId}`, branch,
      row: tier + 1, column: column + 1, x: 12.5 + column * 25, y: (tier + 0.5) / 7 * 100,
      maxRank, requiredTreePoints: tier * 5, ...(prerequisite.length ? { prerequisite } : {}),
      rankDescriptions, description: 'Exact text for this rank is not available in the reviewed client transcription.',
      ...(iconName ? { iconName, icon: `/images/class-talents/${iconName}.jpg` } : {}),
      sourceClientBuild: build, verifiedThroughBuild: build,
      fieldEvidence: {
        name: name ? 'client_verified' : 'unknown', branch: 'client_verified', row: 'client_verified', column: 'client_verified', maxRank: 'client_verified', sourceTalentId: 'client_verified',
        requiredTreePoints: 'derived_assumption', prerequisiteLink: 'client_verified', rankDescriptions: rankDescriptions.some(Boolean) ? 'client_datamined' : 'unknown', iconName: iconName ? 'client_datamined' : 'unknown', changeStatus: 'unknown',
      },
      verificationStatus: 'client_verified', prerequisiteRuleStatus: prerequisite.length ? 'derived_assumption' : 'not_applicable',
      // No baseline snapshot was imported for these classes. Do not invent a Beta-vs-Classic diff.
      changeStatus: 'unknown', sources, dataNotes: notes,
    }
  })
  for (const talent of talents) if (!talent.maxRank || talent.row < 1 || talent.row > 7 || talent.column < 1 || talent.column > 4) conflicts.push(`${talent.nodeId}: invalid structural values`)
  const occupied = new Set<string>()
  for (const talent of talents) {
    const cell = `${talent.branch}:${talent.row}:${talent.column}`
    if (occupied.has(cell)) conflicts.push(`${talent.nodeId}: duplicate tree position`)
    occupied.add(cell)
  }
  return { classId, build, branches: tabs.map((tab) => branchSlug(tab.Name_lang)), talents: talents.sort((a, b) => tabs.findIndex((t) => branchSlug(t.Name_lang) === a.branch) - tabs.findIndex((t) => branchSlug(t.Name_lang) === b.branch) || a.row - b.row || a.column - b.column), sources, conflicts, ready: rows.length > 0 && conflicts.length === 0 }
}
