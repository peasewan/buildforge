import type { MageBranch } from './mageTalentReconcile'

export interface MagePublishableTalent {
  id: string
  name: string
  branch: MageBranch
  maxRank: number
  rankDescriptions?: string[]
  prerequisiteName?: string
}

const identity = (talent: { branch: MageBranch; name: string }) => `${talent.branch}::${talent.name.trim().toLowerCase()}`

// Spec error handling: the import script must fail on duplicate ids, broken prerequisite
// targets, and a published rank-description/maxRank mismatch. The prerequisite check is the
// load-bearing one: the production JSON stores prerequisites by name, so a target that
// reconcile dropped (identity-only-on-one-source, or a planner-legal conflict) would
// otherwise vanish silently and be relabelled `prerequisiteRuleStatus: 'not_applicable'` —
// a planner-legal falsehood that lets the calculator spend the talent with no prerequisite.
export function assertMagePublishable(talents: MagePublishableTalent[]): void {
  const errors: string[] = []
  const publishedByName = new Map<string, MagePublishableTalent>()
  const seenIds = new Set<string>()

  for (const talent of talents) {
    if (seenIds.has(talent.id)) {
      errors.push(`duplicate id "${talent.id}" (${talent.branch}:${talent.name})`)
    }
    seenIds.add(talent.id)
    publishedByName.set(identity(talent), talent)
  }

  for (const talent of talents) {
    const label = `${talent.branch}:${talent.name}`

    if (talent.prerequisiteName && !publishedByName.has(identity({ branch: talent.branch, name: talent.prerequisiteName }))) {
      errors.push(`${label} requires "${talent.prerequisiteName}", which is not a published ${talent.branch} talent`)
    }

    if (talent.rankDescriptions && talent.rankDescriptions.length !== talent.maxRank) {
      errors.push(`${label} publishes ${talent.rankDescriptions.length} rankDescriptions but maxRank is ${talent.maxRank}`)
    }
  }

  if (errors.length) {
    throw new Error(`Mage import produced an unpublishable dataset:\n- ${errors.join('\n- ')}`)
  }
}
