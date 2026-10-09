import { parseClientCsv } from './paladinClientReconcile'

export const CURRENT_CLASS_CLIENT_TABLES = [
  'SkillLineXTraitTree', 'TraitTree', 'TraitNode', 'TraitNodeXTraitNodeEntry',
  'TraitNodeEntry', 'TraitDefinition', 'SpellName', 'Spell', 'TraitEdge',
] as const
export type CurrentClassClientTable = typeof CURRENT_CLASS_CLIENT_TABLES[number]
export type CurrentClassTables = Record<CurrentClassClientTable, string>
export type CurrentClassId = 'hunter' | 'warrior' | 'rogue' | 'priest' | 'druid' | 'warlock' | 'shaman'
type Row = Record<string, string>
export const CURRENT_CLASS_CONFIGS = {
  hunter: { name: 'Hunter', skillLineId: 50, branches: ['beast-mastery', 'marksmanship', 'survival'] },
  warrior: { name: 'Warrior', skillLineId: 26, branches: ['arms', 'fury', 'protection'] },
  rogue: { name: 'Rogue', skillLineId: 38, branches: ['assassination', 'combat', 'subtlety'] },
  priest: { name: 'Priest', skillLineId: 613, branches: ['discipline', 'holy', 'shadow'] },
  druid: { name: 'Druid', skillLineId: 574, branches: ['balance', 'feral', 'restoration'] },
  warlock: { name: 'Warlock', skillLineId: 354, branches: ['affliction', 'demonology', 'destruction'] },
  shaman: { name: 'Shaman', skillLineId: 373, branches: ['elemental', 'enhancement', 'restoration'] },
} as const
interface LegacyTalent {
  id: string; name: string; branch: string; maxRank: number; row: number; column: number
  requiredTreePoints: number; rankDescriptions?: string[]; prerequisite?: unknown[]
  nodeId?: number; spellId?: number; sourceTalentId?: number
}
export interface CurrentClassTalentRecord extends LegacyTalent {
  nodeId: number; spellId: number; rawPosX?: number; rawPosY?: number; description: string; rankDescriptions: string[]
  prerequisite: string[]; x: number; y: number; iconName: string; icon: string
  sourceClientBuild: string; verifiedThroughBuild: string; rankTextVerification: 'community_verified'
  verificationStatus: 'client_verified'; prerequisiteRuleStatus: 'derived_assumption' | 'not_applicable'
  complete: true; confirmedRanks: number[]; changeStatus: 'new' | 'changed' | 'same' | 'unknown'
  fieldEvidence: Record<string, string>; sources: { label: string; type: 'beta_client' | 'beta_client_crosscheck'; url: string }[]
  dataNotes: string[]
}
export interface CurrentClassSnapshot {
  classId: CurrentClassId; build: string; clientBuild: string; sourceVersion: string; generated: string
  branches: string[]; treeId: number; skillLineId: number; basedOnBuild: string
  sourceUrl: string; resolvedRankSourceUrl: string; resolvedRankSourceBuild: string
  resolvedRankLicense: string; resolvedRankLicenseUrl: string; resolvedRankAdaptationNotice: string
  license: string; attribution: string; verificationSummary: string
  verificationSources: { label: string; url: string }[]
  sources: { label: string; type: 'beta_client' | 'beta_client_crosscheck'; url: string }[]
  ready: boolean; conflicts: string[]; talents: CurrentClassTalentRecord[]
  rawClientNodeCount: number; quarantinedClientNodes: ReviewedClientQuarantine[]
  activeMembershipVerification: 'client_verified' | 'community_verified'
  quarantinedClientEdges: ReviewedClientEdgeQuarantine[]
  reviewedGridPositions?: ReviewedClientGridPosition[]
  reviewedEdgeInterpretations?: ReviewedClientEdgeInterpretation[]
}
interface ResolvedTalent {
  name: string; max: number; row: number; col: number; desc: string[]
  complete: boolean; confirmed: number[]; icon: string; req?: string
  classic?: { status?: string }
}
interface ResolvedExport {
  license: string; attribution: string
  talents: Record<string, { source: string; trees: { name: string; talents: ResolvedTalent[] }[] }>
}
export interface ReviewedIdentityMapping {
  currentName: string; currentBranch: string; previousId: string; expectedSpellId: number
  expectedPreviousSpellId?: number; reason?: string; sourceUrl?: string
}
export interface ReviewedClientQuarantine {
  nodeId: number; name: string; spellId: number; posX: number; posY: number
  replacementNodeId: number; reason: string; sourceUrl: string
}
export interface ReviewedClientEdgeQuarantine {
  edgeId: number; leftNodeId: number; rightNodeId: number; reason: string; sourceUrl: string
}
export interface ReviewedClientGridPosition {
  nodeId: number; name: string; spellId: number; posX: number; posY: number
  branch: string; row: number; column: number; reason: string; sourceUrl: string
}
export interface ReviewedClientEdgeInterpretation {
  edgeId: number; leftNodeId: number; rightNodeId: number; type: number
  prerequisite: boolean; reason: string; sourceUrl: string
}
export interface CurrentClassReconcileInput {
  classId: CurrentClassId; build: string; tables: CurrentClassTables
  baseline: { classId: string; clientBuild: string; branches: readonly string[]; talents: LegacyTalent[] }
  resolved: ResolvedExport; reviewedIdentityMappings?: ReviewedIdentityMapping[]; reviewedQuarantines?: ReviewedClientQuarantine[]; reviewedEdgeQuarantines?: ReviewedClientEdgeQuarantine[]; reviewedGridPositions?: ReviewedClientGridPosition[]; reviewedEdgeInterpretations?: ReviewedClientEdgeInterpretation[]
}
type Identity = { id: string; name: string; nodeId?: number }
export interface CurrentClassDiff {
  from: string; to: string
  summary: Record<'added' | 'removed' | 'moved' | 'rank_changed' | 'tooltip_changed' | 'prerequisite_changed' | 'unchanged', number>
  added: Identity[]; removed: Identity[]; moved: (Identity & { before: unknown; after: unknown })[]
  rank_changed: (Identity & { before: number; after: number })[]
  tooltip_changed: (Identity & { ranks: { rank: number; before: string; after: string }[] })[]
  prerequisite_changed: (Identity & { before: string[]; after: string[] })[]; unchanged: Identity[]
}
const integer = (value: string | undefined, field: string): number => {
  const n = Number(value)
  if (value === undefined || value === '' || !Number.isSafeInteger(n)) throw new Error('Invalid ' + field)
  return n
}
const index = (rows: Row[], table: string): Map<number, Row> => {
  const map = new Map<number, Row>()
  for (const row of rows) {
    const id = integer(row.ID, table + '.ID')
    if (map.has(id)) throw new Error('Duplicate ' + table + ' ID ' + id)
    map.set(id, row)
  }
  return map
}
const rowAt = (rows: Map<number, Row>, id: number, table: string): Row => {
  const row = rows.get(id)
  if (!row) throw new Error('Missing ' + table + ' ID ' + id)
  return row
}
function decodeGrid(x: number, y: number, branches: readonly string[]) {
  const branchIndex = x < 4000 ? 0 : x < 8000 ? 1 : 2
  const base = [1020, 5020, 9080][branchIndex]
  const column = Math.round((x - base) / 600) + 1, row = Math.round((y - 2130) / 600) + 1
  if (column < 1 || column > 4 || row < 1 || row > 7 || x !== base + (column - 1) * 600 || y !== 2130 + (row - 1) * 600) {
    throw new Error('Unreviewed class grid position ' + x + ',' + y)
  }
  return { branch: branches[branchIndex], row, column }
}
interface ClientRecord { rawPosX: number; rawPosY: number; gridVerification: 'client_verified' | 'community_verified'; nodeId: number; spellId: number; name: string; branch: string; row: number; column: number; maxRank: number; prerequisiteNodes: number[]; linkVerification: 'client_verified' | 'community_verified' }
export function readCurrentClassClientStructure(classId: CurrentClassId, tables: CurrentClassTables, reviewedQuarantines: readonly ReviewedClientQuarantine[] = [], reviewedEdgeQuarantines: readonly ReviewedClientEdgeQuarantine[] = [], reviewedGridPositions: readonly ReviewedClientGridPosition[] = [], reviewedEdgeInterpretations: readonly ReviewedClientEdgeInterpretation[] = []) {
  const config = CURRENT_CLASS_CONFIGS[classId]
  if (!config) throw new Error('Unsupported class')
  const csv = Object.fromEntries(CURRENT_CLASS_CLIENT_TABLES.map(table => [table, parseClientCsv(tables[table])])) as Record<CurrentClassClientTable, Row[]>
  const maps = csv.SkillLineXTraitTree.filter(row => integer(row.SkillLineID, 'SkillLineID') === config.skillLineId && row.Variant === '0')
  if (maps.length !== 1) throw new Error(classId + ' must map uniquely to one TraitTree')
  const treeId = integer(maps[0].TraitTreeID, 'TraitTreeID')
  rowAt(index(csv.TraitTree, 'TraitTree'), treeId, 'TraitTree')
  const nodes = csv.TraitNode.filter(row => integer(row.TraitTreeID, 'TraitTreeID') === treeId)
  if (!nodes.length) throw new Error('Empty class TraitTree')
  const active = new Set(nodes.map(row => integer(row.ID, 'TraitNode.ID')))
  if (active.size !== nodes.length) throw new Error('Duplicate client node ID')
  const links = new Map<number, number>()
  for (const row of csv.TraitNodeXTraitNodeEntry) {
    const id = integer(row.TraitNodeID, 'TraitNodeID')
    if (!active.has(id)) continue
    if (links.has(id)) throw new Error('Ambiguous client node entry ' + id)
    links.set(id, integer(row.TraitNodeEntryID, 'TraitNodeEntryID'))
  }
  const entries = index(csv.TraitNodeEntry, 'TraitNodeEntry'), definitions = index(csv.TraitDefinition, 'TraitDefinition')
  const names = index(csv.SpellName, 'SpellName'), spells = index(csv.Spell, 'Spell')
  const edgeQuarantines=new Map(reviewedEdgeQuarantines.map(edge=>[edge.edgeId,edge]))
  if(edgeQuarantines.size!==reviewedEdgeQuarantines.length) throw new Error('Duplicate reviewed edge quarantine')
  const consumedEdgeQuarantines=new Set<number>(), reconciledLinks=new Set<number>()
  const edgeInterpretations = new Map(reviewedEdgeInterpretations.map(edge => [edge.edgeId, edge]))
  if (edgeInterpretations.size !== reviewedEdgeInterpretations.length || reviewedEdgeInterpretations.some(edge => edgeQuarantines.has(edge.edgeId))) throw new Error('Duplicate/conflicting reviewed edge interpretation')
  const consumedEdgeInterpretations = new Set<number>()
  const arrows = new Map<number, number[]>()
  for (const edge of csv.TraitEdge) {
    const left = integer(edge.LeftTraitNodeID, 'LeftTraitNodeID'), right = integer(edge.RightTraitNodeID, 'RightTraitNodeID')
    const edgeId=integer(edge.ID,'TraitEdge.ID'), quarantine=edgeQuarantines.get(edgeId)
    if (quarantine) {
      if (quarantine.leftNodeId!==left || quarantine.rightNodeId!==right || edge.Type!=='2' || !active.has(left) || !active.has(right) || !quarantine.reason.trim() || !quarantine.sourceUrl.startsWith('https://')) throw new Error('Edge quarantine identity mismatch '+edgeId)
      if (!csv.TraitEdge.some(other=>other.LeftTraitNodeID===edge.RightTraitNodeID && other.RightTraitNodeID===edge.LeftTraitNodeID && other.Type==='2')) throw new Error('Reviewed edge is not a reciprocal cycle '+edgeId)
      consumedEdgeQuarantines.add(edgeId); reconciledLinks.add(right); continue
    }
    const interpretation = edgeInterpretations.get(edgeId)
    if (interpretation) {
      if (interpretation.leftNodeId !== left || interpretation.rightNodeId !== right || interpretation.type !== integer(edge.Type, 'TraitEdge.Type') || interpretation.type === 2 || !active.has(left) || !active.has(right) || typeof interpretation.prerequisite !== 'boolean' || !interpretation.reason.trim() || !interpretation.sourceUrl.startsWith('https://')) throw new Error('Edge interpretation identity mismatch ' + edgeId)
      consumedEdgeInterpretations.add(edgeId); reconciledLinks.add(left); reconciledLinks.add(right)
      if (!interpretation.prerequisite) continue
    }
    if (!active.has(left) && !active.has(right)) continue
    if (!active.has(left) || !active.has(right) || (edge.Type !== '2' && !interpretation)) throw new Error('Unreviewed client edge ' + edge.ID)
    const parents = arrows.get(right) ?? []
    if (parents.includes(left)) throw new Error('Duplicate client edge ' + edge.ID)
    arrows.set(right, [...parents, left])
  }
  if (consumedEdgeInterpretations.size !== edgeInterpretations.size) throw new Error('Reviewed edge interpretation absent from client')
  if (consumedEdgeQuarantines.size!==edgeQuarantines.size) throw new Error('Reviewed edge quarantine absent from client')
  const quarantines = new Map(reviewedQuarantines.map(item => [item.nodeId, item]))
  if (quarantines.size !== reviewedQuarantines.length || reviewedQuarantines.some(item => !active.has(item.nodeId) || !active.has(item.replacementNodeId) || !item.reason.trim() || !item.sourceUrl.startsWith('https://'))) throw new Error('Invalid reviewed quarantine reference')
  const gridReviews = new Map(reviewedGridPositions.map(item => [item.nodeId, item]))
  if (gridReviews.size !== reviewedGridPositions.length || reviewedGridPositions.some(item => !active.has(item.nodeId) || quarantines.has(item.nodeId) || !item.reason.trim() || !item.sourceUrl.startsWith('https://') || !(config.branches as readonly string[]).includes(item.branch) || !Number.isInteger(item.row) || !Number.isInteger(item.column) || item.row < 1 || item.row > 7 || item.column < 1 || item.column > 4)) throw new Error('Invalid reviewed grid reference')
  const records: ClientRecord[] = nodes.flatMap(node => {
    const nodeId = integer(node.ID, 'TraitNode.ID')
    if (node.Type !== '0' || node.TraitSubTreeID !== '0') throw new Error('Unsupported client node ' + nodeId)
    const entryId = links.get(nodeId)
    if (entryId === undefined) throw new Error('Missing entry for node ' + nodeId)
    const entry = rowAt(entries, entryId, 'TraitNodeEntry')
    const def = rowAt(definitions, integer(entry.TraitDefinitionID, 'TraitDefinitionID'), 'TraitDefinition')
    if (def.OverrideName_lang || def.OverrideDescription_lang || def.OverridesSpellID !== '0' || def.VisibleSpellID !== '0') throw new Error('Unreviewed trait override ' + nodeId)
    const spellId = integer(def.SpellID, 'SpellID')
    const name = rowAt(names, spellId, 'SpellName').Name_lang
    if (!name || !rowAt(spells, spellId, 'Spell').Description_lang) throw new Error('Missing client spell text ' + spellId)
    const maxRank = integer(entry.MaxRanks, 'MaxRanks')
    if (maxRank < 1 || maxRank > 5) throw new Error('Invalid rank cap ' + nodeId)
    const posX=integer(node.PosX,'PosX'), posY=integer(node.PosY,'PosY'), quarantine=quarantines.get(nodeId)
    if (quarantine) {
      if (quarantine.name!==name || quarantine.spellId!==spellId || quarantine.posX!==posX || quarantine.posY!==posY) throw new Error('Quarantine identity mismatch '+nodeId)
      if (arrows.has(nodeId) || [...arrows.values()].some(parents=>parents.includes(nodeId))) throw new Error('Quarantined node participates in current prerequisite edges '+nodeId)
      try { decodeGrid(posX,posY,config.branches) } catch { return [] }
      throw new Error('Quarantine must be an independently reviewed off-grid remnant '+nodeId)
    }
    const reviewedGrid = gridReviews.get(nodeId)
    let grid: { branch: string; row: number; column: number }
    if (reviewedGrid) {
      if (reviewedGrid.name !== name || reviewedGrid.spellId !== spellId || reviewedGrid.posX !== posX || reviewedGrid.posY !== posY) throw new Error('Grid review identity mismatch ' + nodeId)
      let exactGrid = false
      try { decodeGrid(posX, posY, config.branches); exactGrid = true } catch { /* Exact reviewed exceptions retain malformed raw coordinates. */ }
      if (exactGrid) throw new Error('Grid review must target a malformed raw position ' + nodeId)
      grid = { branch: reviewedGrid.branch, row: reviewedGrid.row, column: reviewedGrid.column }
    } else grid = decodeGrid(posX, posY, config.branches)
    return [{ nodeId, spellId, rawPosX: posX, rawPosY: posY, name, maxRank, ...grid, gridVerification: reviewedGrid ? 'community_verified' as const : 'client_verified' as const, prerequisiteNodes: (arrows.get(nodeId) ?? []).sort((a,b) => a-b), linkVerification:reconciledLinks.has(nodeId)?'community_verified' as const:'client_verified' as const }]
  }).sort((a,b) => config.branches.indexOf(a.branch as never) - config.branches.indexOf(b.branch as never) || a.row-b.row || a.column-b.column)
  return { treeId, skillLineId: config.skillLineId, records, rawClientNodeCount:nodes.length, quarantinedClientNodes:[...reviewedQuarantines],quarantinedClientEdges:[...reviewedEdgeQuarantines],reviewedGridPositions:[...reviewedGridPositions],reviewedEdgeInterpretations:[...reviewedEdgeInterpretations] }
}
const identity = (talent: LegacyTalent): Identity => ({ id: talent.id, name: talent.name, nodeId: talent.nodeId })
const oldPrerequisites = (talent: LegacyTalent): string[] => (talent.prerequisite ?? []).map(prior => typeof prior === 'string' ? prior : (prior as { talentId: string }).talentId).sort()
function diffClass(baseline: CurrentClassReconcileInput['baseline'], candidate: CurrentClassSnapshot): CurrentClassDiff {
  const before = new Map(baseline.talents.map(talent => [talent.id, talent])), after = new Set(candidate.talents.map(talent => talent.id))
  const diff: CurrentClassDiff = { from: baseline.clientBuild, to: candidate.clientBuild, summary: { added:0, removed:0, moved:0, rank_changed:0, tooltip_changed:0, prerequisite_changed:0, unchanged:0 }, added:[], removed:[], moved:[], rank_changed:[], tooltip_changed:[], prerequisite_changed:[], unchanged:[] }
  for (const talent of baseline.talents) if (!after.has(talent.id)) diff.removed.push(identity(talent))
  for (const talent of candidate.talents) {
    const old = before.get(talent.id)
    if (!old) { diff.added.push(identity(talent)); continue }
    let changed = old.name !== talent.name
    const position = (t: LegacyTalent) => ({ branch:t.branch,row:t.row,column:t.column,requiredTreePoints:t.requiredTreePoints })
    if (JSON.stringify(position(old)) !== JSON.stringify(position(talent))) { diff.moved.push({ ...identity(talent),before:position(old),after:position(talent) }); changed=true }
    if (old.maxRank !== talent.maxRank) { diff.rank_changed.push({ ...identity(talent),before:old.maxRank,after:talent.maxRank }); changed=true }
    const ranks = Array.from({ length:Math.max(old.rankDescriptions?.length ?? 0,talent.rankDescriptions.length) },(_,i)=>({rank:i+1,before:old.rankDescriptions?.[i] ?? '',after:talent.rankDescriptions[i] ?? ''})).filter(rank=>rank.before!==rank.after)
    if (ranks.length) { diff.tooltip_changed.push({ ...identity(talent),ranks }); changed=true }
    const previous = oldPrerequisites(old)
    if (JSON.stringify(previous)!==JSON.stringify(talent.prerequisite)) { diff.prerequisite_changed.push({ ...identity(talent),before:previous,after:talent.prerequisite });changed=true }
    if (!changed) diff.unchanged.push(identity(talent))
  }
  for (const key of Object.keys(diff.summary) as (keyof CurrentClassDiff['summary'])[]) diff.summary[key]=diff[key].length
  return diff
}

export function reconcileCurrentClassClient(input: CurrentClassReconcileInput): { candidate: CurrentClassSnapshot; diff: CurrentClassDiff } {
  if (!/^1\.60\.1\.\d+$/.test(input.build) || input.baseline.classId!==input.classId) throw new Error('Invalid build or baseline class')
  if (input.resolved.license!=='CC-BY-4.0' || !input.resolved.attribution.includes('talentsforever.com')) throw new Error('Resolved export lacks reviewed license/attribution')
  const config = CURRENT_CLASS_CONFIGS[input.classId], resolved = input.resolved.talents[config.name]
  if (!resolved?.source.includes('beta client') || resolved.source.match(/1\.60\.1\.\d+/)?.[0]!==input.build) throw new Error('Resolved source build mismatch')
  const structure = readCurrentClassClientStructure(input.classId,input.tables,input.reviewedQuarantines,input.reviewedEdgeQuarantines,input.reviewedGridPositions,input.reviewedEdgeInterpretations)
  const rankRecords = new Map<string, ResolvedTalent>()
  for (const tree of resolved.trees) {
    const sourceBranch = tree.name.toLowerCase().replaceAll(' ','-')
    const branch = input.classId === 'druid' && sourceBranch === 'feral-combat' ? 'feral' : sourceBranch
    if (!(config.branches as readonly string[]).includes(branch)) throw new Error('Unrecognized resolved branch ' + branch)
    for (const talent of tree.talents) {
      const key = branch + ':' + talent.row + ':' + talent.col
      if (rankRecords.has(key)) throw new Error('Duplicate resolved cell ' + key)
      rankRecords.set(key,talent)
    }
  }
  const oldIds = new Set(input.baseline.talents.map(talent=>talent.id))
  if (oldIds.size!==input.baseline.talents.length) throw new Error('Duplicate baseline stable ID')
  const consumedIdentities = new Set<string>()
  const sources = [
    { label:'Wago DB2 — '+config.name+' client structure '+input.build,type:'beta_client' as const,url:'https://wago.tools/db2/TraitNode/csv?build='+input.build },
    { label:'Talents Forever — '+config.name+' resolved rank descriptions (CC BY 4.0)',type:'beta_client_crosscheck' as const,url:'https://talentsforever.com/data.json' },
  ]
  const used = new Set<string>()
  const talents: CurrentClassTalentRecord[] = structure.records.map(record=>{
    const key=record.branch+':'+record.row+':'+record.column, tooltip=rankRecords.get(key)
    if (!tooltip) throw new Error('Missing resolved rank cell '+key)
    used.add(key)
    if (tooltip.name!==record.name) throw new Error('Client/resolved name mismatch at '+key)
    if (tooltip.max!==record.maxRank || !tooltip.complete || tooltip.desc.length!==record.maxRank || tooltip.desc.some(text=>typeof text!=='string'||!text.trim()||/\$[a-zA-Z0-9]/.test(text)) || JSON.stringify(tooltip.confirmed)!==JSON.stringify(Array.from({length:record.maxRank},(_,i)=>i+1))) throw new Error('Incomplete resolved ranks for '+record.name)
    if (!/^[a-z0-9_]+$/.test(tooltip.icon)) throw new Error('Invalid resolved icon '+record.name)
    const mapping = input.reviewedIdentityMappings?.filter(mapping=>mapping.currentName===record.name && mapping.currentBranch===record.branch) ?? []
    if (mapping.length>1) throw new Error('Ambiguous reviewed identity mapping '+record.name)
    let old: LegacyTalent | undefined
    if (mapping.length) {
      old=input.baseline.talents.find(talent=>talent.id===mapping[0].previousId)
      if (!old || mapping[0].expectedSpellId!==record.spellId || (old.spellId!==undefined&&old.spellId!==(mapping[0].expectedPreviousSpellId??record.spellId))) throw new Error('Reviewed identity spell mismatch '+record.name)
    } else {
      const matches=input.baseline.talents.filter(talent=>talent.name===record.name&&talent.branch===record.branch)
      if (matches.length>1) throw new Error('Ambiguous baseline identity '+record.name)
      old=matches[0]
      if (old?.spellId!==undefined&&old.spellId!==record.spellId) throw new Error('Changed identity spell requires review '+record.name)
    }
    const id=old?.id ?? input.classId+'-'+record.branch+'-'+record.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
    if (consumedIdentities.has(id)) throw new Error('Duplicate stable identity '+id)
    consumedIdentities.add(id)
    const changeStatus=tooltip.classic?.status==='new'?'new':tooltip.classic?.status==='same'?'same':tooltip.classic?.status?'changed':'unknown'
    return {
      id,name:record.name,branch:record.branch,row:record.row,column:record.column,maxRank:record.maxRank,
      nodeId:record.nodeId,spellId:record.spellId,rawPosX:record.rawPosX,rawPosY:record.rawPosY,...(old?.sourceTalentId===undefined?{}:{sourceTalentId:old.sourceTalentId}),
      requiredTreePoints:(record.row-1)*5,prerequisite:[],rankDescriptions:[...tooltip.desc],description:tooltip.desc[record.maxRank-1],
      x:((record.column-0.5)/4)*100,y:((record.row-0.5)/7)*100,iconName:tooltip.icon,
      icon:'/images/'+(input.classId==='warrior'?'warrior-talents':'class-talents')+'/'+tooltip.icon+'.jpg',
      sourceClientBuild:input.build,verifiedThroughBuild:input.build,verificationStatus:'client_verified',rankTextVerification:'community_verified',
      prerequisiteRuleStatus:record.prerequisiteNodes.length?'derived_assumption':'not_applicable',changeStatus,complete:true,confirmedRanks:[...tooltip.confirmed],
      fieldEvidence:{name:'client_verified',branch:'client_verified',row:record.gridVerification,column:record.gridVerification,rawPosX:'client_verified',rawPosY:'client_verified',maxRank:'client_verified',nodeId:'client_verified',spellId:'client_verified',requiredTreePoints:'derived_assumption',prerequisiteLink:record.linkVerification,rankDescriptions:'community_verified',iconName:'community_verified',changeStatus:'community_verified'},
      sources,dataNotes:[...(record.gridVerification==='community_verified'?['Display row and column are an exact community-reviewed interpretation of malformed raw coordinates; rawPosX/rawPosY preserve the independently verified client values.']:[]),...(old?.sourceTalentId===undefined?[]:['Legacy Talent-table ID retained from the historical snapshot for stable share identity; current structural identifiers are nodeId and spellId.']),...(record.linkVerification==='community_verified'?['An exact nonstandard client connection was reconciled after comparison with the licensed visible tree; prerequisite direction is community reviewed, not client-only proof.']:[]),'Resolved rank descriptions and icon names adapted from Talents Forever (CC BY 4.0); raw client structure independently reconciled.','Five points per tier and full-rank prerequisites are planning assumptions; client links do not prove the required rank.'],
    }
  })
  if (used.size!==rankRecords.size) throw new Error('Resolved export has talent absent from client tree')
  const byNode=new Map(talents.map(talent=>[talent.nodeId,talent]))
  for (const record of structure.records) {
    const talent=byNode.get(record.nodeId)!
    const parents=record.prerequisiteNodes.map(nodeId=>byNode.get(nodeId)!)
    if (parents.some(parent=>parent.branch!==record.branch)) throw new Error('Cross-tree prerequisite '+record.name)
    const tooltip=rankRecords.get(record.branch+':'+record.row+':'+record.column)!
    const namedParents=tooltip.req ? [tooltip.req] : []
    if (JSON.stringify(parents.map(parent=>parent.name).sort())!==JSON.stringify(namedParents.sort())) throw new Error('Client/resolved prerequisite mismatch '+record.name)
    talent.prerequisite=parents.map(parent=>parent.id).sort()
  }
  const candidate: CurrentClassSnapshot={
    classId:input.classId,build:input.build,clientBuild:input.build,sourceVersion:'wow_forever_beta_'+input.build,generated:new Date().toISOString().slice(0,10),
    branches:[...config.branches],treeId:structure.treeId,skillLineId:structure.skillLineId,basedOnBuild:input.baseline.clientBuild,
    sourceUrl:sources[0].url,resolvedRankSourceUrl:sources[1].url,resolvedRankSourceBuild:input.build,resolvedRankLicense:'CC-BY-4.0',resolvedRankLicenseUrl:'https://creativecommons.org/licenses/by/4.0/',
    resolvedRankAdaptationNotice:'Rank descriptions and icon names adapted from Talents Forever for BuildForgeTools under CC BY 4.0. Structure is reconciled field by field from Wago DB2, with explicit community-reviewed exceptions for visible membership, display positions or connection roles where recorded; original raw records are preserved.',
    license:'Game client factual data; rank descriptions and icon names adapted under CC-BY-4.0',attribution:'Resolved rank text and icon names adapted from Talents Forever (talentsforever.com, CC-BY-4.0); client structure from Wago DB2 '+input.build,
    verificationSummary:'',verificationSources:sources.map(source=>({label:source.label,url:source.url})),sources,ready:true,conflicts:[],talents,
    rawClientNodeCount:structure.rawClientNodeCount,quarantinedClientNodes:structure.quarantinedClientNodes,activeMembershipVerification:structure.quarantinedClientNodes.length?'community_verified':'client_verified',quarantinedClientEdges:structure.quarantinedClientEdges,reviewedGridPositions:structure.reviewedGridPositions,reviewedEdgeInterpretations:structure.reviewedEdgeInterpretations,
  }
  const diff=diffClass(input.baseline,candidate)
  candidate.verificationSummary=`${input.build} ${config.name}: ${talents.length} nodes and ${talents.reduce((sum,talent)=>sum+talent.maxRank,0)} complete rank descriptions; compared with ${input.baseline.clientBuild}: ${diff.summary.added} added, ${diff.summary.removed} removed, ${diff.summary.moved} moved, ${diff.summary.rank_changed} rank-cap changes, ${diff.summary.tooltip_changed} talents with rank-description changes, ${diff.summary.prerequisite_changed} prerequisite-link changes. Structural provenance is recorded per field: client identity, rank caps and exact raw geometry are client_verified; explicit reviewed exceptions and resolved text are community_verified; tier costs and prerequisite required ranks remain derived_assumption.`
  if (structure.quarantinedClientNodes.length) candidate.verificationSummary+=` Raw TraitTree contains ${structure.rawClientNodeCount} records; ${structure.quarantinedClientNodes.length} exact off-grid remnants are quarantined under an explicit source review, leaving ${talents.length} community-reconciled visible nodes. No invalid coordinates are corrected or promoted as client facts.`
  if (structure.quarantinedClientEdges.length) candidate.verificationSummary+=` ${structure.quarantinedClientEdges.length} exact reciprocal-cycle client connection is quarantined under community graph review; affected prerequisite direction is community_verified rather than client_verified.`
  if (structure.reviewedGridPositions.length) candidate.verificationSummary+=` ${structure.reviewedGridPositions.length} exact active nodes have malformed raw coordinates; licensed visible-tree cells are community_verified and original rawPosX/rawPosY are retained as client_verified.`
  if (structure.reviewedEdgeInterpretations.length) candidate.verificationSummary+=` ${structure.reviewedEdgeInterpretations.length} exact nonstandard connection records have explicit community-reviewed roles; raw IDs, types and direction are retained without treating interpreted prerequisite direction as client-only proof.`
  const errors=validateCurrentClassCandidate(candidate,input.tables,input.reviewedQuarantines,input.reviewedEdgeQuarantines,input.reviewedGridPositions,input.reviewedEdgeInterpretations)
  if (errors.length) throw new Error('Candidate validation failed: '+errors.join('; '))
  return {candidate,diff}
}

/** Re-reads raw membership and structure, never trusting the candidate's node list. */
export function validateCurrentClassCandidate(candidate: CurrentClassSnapshot, tables: CurrentClassTables, reviewedQuarantines: readonly ReviewedClientQuarantine[] = [], reviewedEdgeQuarantines: readonly ReviewedClientEdgeQuarantine[] = [], reviewedGridPositions: readonly ReviewedClientGridPosition[] = [], reviewedEdgeInterpretations: readonly ReviewedClientEdgeInterpretation[] = []): string[] {
  const errors: string[]=[]
  if (JSON.stringify(candidate.quarantinedClientNodes)!==JSON.stringify(reviewedQuarantines)) return ['Unapproved quarantine: saved candidate differs from independent source review']
  if (JSON.stringify(candidate.quarantinedClientEdges)!==JSON.stringify(reviewedEdgeQuarantines)) return ['Unapproved edge quarantine: saved candidate differs from independent source review']
  if (JSON.stringify(candidate.reviewedGridPositions ?? [])!==JSON.stringify(reviewedGridPositions)) return ['Unapproved grid review: saved candidate differs from independent source review']
  if (JSON.stringify(candidate.reviewedEdgeInterpretations ?? [])!==JSON.stringify(reviewedEdgeInterpretations)) return ['Unapproved edge interpretation: saved candidate differs from independent source review']
  const structure=readCurrentClassClientStructure(candidate.classId,tables,reviewedQuarantines,reviewedEdgeQuarantines,reviewedGridPositions,reviewedEdgeInterpretations), byNode=new Map(candidate.talents.map(talent=>[talent.nodeId,talent]))
  if (candidate.sourceVersion!=='wow_forever_beta_'+candidate.clientBuild||candidate.build!==candidate.clientBuild||candidate.treeId!==structure.treeId||candidate.skillLineId!==structure.skillLineId) errors.push('Candidate version/tree mismatch')
  if (candidate.resolvedRankSourceBuild!==candidate.clientBuild||candidate.resolvedRankLicense!=='CC-BY-4.0'||candidate.resolvedRankLicenseUrl!=='https://creativecommons.org/licenses/by/4.0/'||!candidate.attribution.includes('Talents Forever')||!candidate.resolvedRankAdaptationNotice.includes('adapted')) errors.push('Missing rank attribution or source-build proof')
  if (!candidate.verificationSummary.includes(candidate.clientBuild)||candidate.sourceUrl!=='https://wago.tools/db2/TraitNode/csv?build='+candidate.clientBuild||candidate.resolvedRankSourceUrl!=='https://talentsforever.com/data.json') errors.push('Missing current verification sources')
  if (byNode.size!==candidate.talents.length||candidate.talents.length!==structure.records.length) errors.push('Candidate/client node count mismatch')
  const ids=new Set<string>(),cells=new Set<string>(),currentNodes=new Set(structure.records.map(record=>record.nodeId))
  const byId=new Map(candidate.talents.map(talent=>[talent.id,talent]))
  for (const record of structure.records) {
    const talent=byNode.get(record.nodeId)
    if (!talent) {errors.push('Missing client node '+record.nodeId);continue}
    if (['name','branch','row','column','maxRank','spellId'].some(key=>talent[key as keyof CurrentClassTalentRecord]!==record[key as keyof ClientRecord])) errors.push(talent.id+': client structure mismatch')
    const hasRawPosition = talent.rawPosX !== undefined || talent.rawPosY !== undefined || record.gridVerification === 'community_verified'
    if (talent.fieldEvidence.row !== record.gridVerification || talent.fieldEvidence.column !== record.gridVerification || (hasRawPosition && (talent.rawPosX !== record.rawPosX || talent.rawPosY !== record.rawPosY || talent.fieldEvidence.rawPosX !== 'client_verified' || talent.fieldEvidence.rawPosY !== 'client_verified'))) errors.push(talent.id+': invalid grid provenance')
    const expected=record.prerequisiteNodes.map(node=>byNode.get(node)?.id).sort()
    if (JSON.stringify(talent.prerequisite)!==JSON.stringify(expected)) errors.push(talent.id+': client prerequisite mismatch')
  }
  for (const talent of candidate.talents) {
    if (!currentNodes.has(talent.nodeId)) errors.push('Extra candidate node '+talent.nodeId)
    const cell=talent.branch+':'+talent.row+':'+talent.column
    if (ids.has(talent.id)||cells.has(cell)) errors.push(talent.id+': duplicate stable ID or grid cell')
    ids.add(talent.id);cells.add(cell)
    if (talent.requiredTreePoints!==(talent.row-1)*5||talent.fieldEvidence.requiredTreePoints!=='derived_assumption') errors.push(talent.id+': invalid planning threshold')
    if (talent.rankDescriptions.length!==talent.maxRank||talent.rankDescriptions.some(text=>!text.trim()||/\$[a-zA-Z0-9]/.test(text))||talent.description!==talent.rankDescriptions[talent.maxRank-1]||!talent.complete||JSON.stringify(talent.confirmedRanks)!==JSON.stringify(Array.from({length:talent.maxRank},(_,i)=>i+1))) errors.push(talent.id+': incomplete rank descriptions')
    if (talent.rankTextVerification!=='community_verified'||talent.fieldEvidence.rankDescriptions!=='community_verified'||talent.fieldEvidence.prerequisiteLink!==(structure.records.find(record=>record.nodeId===talent.nodeId)?.linkVerification??'client_verified')||talent.sourceClientBuild!==candidate.clientBuild||talent.verifiedThroughBuild!==candidate.clientBuild) errors.push(talent.id+': incorrect field provenance')
    for (const prior of talent.prerequisite) if (!byId.has(prior)) errors.push(talent.id+': unknown prerequisite '+prior)
  }
  const visiting=new Set<string>(),visited=new Set<string>()
  const cycle=(id:string):boolean=>{
    if (visiting.has(id)) return true
    if (visited.has(id)) return false
    visiting.add(id)
    const found=(byId.get(id)?.prerequisite??[]).some(prior=>byId.has(prior)&&cycle(prior))
    visiting.delete(id);visited.add(id);return found
  }
  if (candidate.talents.some(talent=>cycle(talent.id))) errors.push('Prerequisite cycle')
  return errors
}
