import type { MageBranch, MageChangeStatus, MageSourceTalent } from './mageTalentReconcile'

// ForeverDiff `status` and TheWoWDB `change.kind` are two spellings of the same fact
// ("how does this node differ from Classic"), so both map onto the shared vocabulary.
// An absent or unrecognised value yields `undefined`, which reconcile scores as `unknown`
// rather than inventing a difference.
const foreverDiffChangeStatus: Record<string, MageChangeStatus> = {
  added: 'new',
  changed: 'changed',
  unchanged: 'same',
}

const wowDbChangeStatus: Record<string, MageChangeStatus> = {
  changed: 'changed',
  renamed: 'changed',
  unchanged: 'same',
}

const extractJson = (html: string, id: string) => {
  const marker = `id="${id}"`
  const start = html.indexOf(marker)
  if (start < 0) throw new Error(`Missing JSON script ${id}`)
  const open = html.indexOf('>', start) + 1
  const close = html.indexOf('</script>', open)
  return JSON.parse(html.slice(open, close)) as unknown
}

const slugBranch = (value: string): MageBranch => {
  const branch = value.toLowerCase()
  if (branch === 'arcane' || branch === 'fire' || branch === 'frost') return branch
  throw new Error(`Unknown Mage branch ${value}`)
}

interface ForeverDiffTalent {
  id: number
  name: string
  tier: number
  column: number
  maxRank: number
  ranks?: string[]
  prereqs?: { id: number; rank?: number }[]
  gate?: { spent?: number }
  status?: string
}

interface ForeverDiffTree {
  tabs: { key: string; talents: ForeverDiffTalent[] }[]
}

interface WowDbNode {
  id: string
  name: string
  row: number
  col: number
  maxRanks: number
  ranks?: Record<string, string>
  sourceTalentId?: number
  iconName?: string
  requires?: { id: string }[]
  change?: { kind?: string; notes?: string[] }
}

interface WowDbPayload {
  trees: { id: string; nodes: WowDbNode[] }[]
}

const ranksFromRecord = (ranks: Record<string, string> | undefined, maxRank: number) => {
  if (!ranks) return undefined
  const list: string[] = []
  for (let rank = 1; rank <= maxRank; rank += 1) {
    const text = ranks[String(rank)]
    if (!text) break
    list.push(text)
  }
  return list.length ? list : undefined
}

export function parseForeverDiffMage(html: string): MageSourceTalent[] {
  const tree = extractJson(html, 'tc-tree') as ForeverDiffTree
  const byId = new Map<number, ForeverDiffTalent>()
  for (const tab of tree.tabs) for (const talent of tab.talents) byId.set(talent.id, talent)
  const parsed: MageSourceTalent[] = []
  for (const tab of tree.tabs) {
    const branch = slugBranch(tab.key)
    for (const talent of tab.talents) {
      const prerequisite = talent.prereqs?.[0] ? byId.get(talent.prereqs[0].id)?.name : undefined
      parsed.push({
        name: talent.name,
        branch,
        row: talent.tier + 1,
        column: talent.column + 1,
        maxRank: talent.maxRank,
        rankDescriptions: talent.ranks?.length ? talent.ranks : undefined,
        sourceTalentId: talent.id,
        prerequisiteName: prerequisite,
        requiredTreePoints: talent.gate?.spent ?? talent.tier * 5,
        changeStatus: talent.status ? foreverDiffChangeStatus[talent.status] : undefined,
      })
    }
  }
  return parsed
}

export function parseTheWowDbMage(html: string): MageSourceTalent[] {
  const payload = extractJson(html, 'forever-data') as WowDbPayload
  const nameById = new Map<string, string>()
  for (const tree of payload.trees) for (const node of tree.nodes) nameById.set(node.id, node.name)
  const parsed: MageSourceTalent[] = []
  for (const tree of payload.trees) {
    const branch = slugBranch(tree.id)
    for (const node of tree.nodes) {
      parsed.push({
        name: node.name,
        branch,
        row: node.row + 1,
        column: node.col + 1,
        maxRank: node.maxRanks,
        rankDescriptions: ranksFromRecord(node.ranks, node.maxRanks),
        sourceTalentId: node.sourceTalentId,
        prerequisiteName: node.requires?.[0] ? nameById.get(node.requires[0].id) : undefined,
        iconName: node.iconName,
        requiredTreePoints: node.row * 5,
        changeStatus: node.change?.kind ? wowDbChangeStatus[node.change.kind] : undefined,
      })
    }
  }
  return parsed
}
