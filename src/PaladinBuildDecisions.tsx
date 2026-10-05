import type { Branch } from './lib/build'
import { PALADIN_COMPARATOR_PATH, snapshotGate } from './data/paladinDecisionTools'
import { protectionPlannerHref } from './data/protectionCurrentRoute'

const questions: Record<Branch, Array<{ title: string; body: string; href: string; link: string }>> = {
  holy: [
    { title: 'Is Holy worth leveling at 30?', body: 'Separate solo questing from group healing. Our Holy starter is a healing-oriented planning route; it is not a measured solo-leveling winner. Compare the Holy Shock example with the Ret route under the same equipment and encounter conditions.', href: PALADIN_COMPARATOR_PATH, link: 'Compare Holy Shock and Ret' },
    { title: 'Holy healer or Shockadin?', body: 'Access to Holy Shock alone does not turn a healing allocation into an optimized damage build. The comparator shows a 21/0/0 editorial snapshot example, with healing support talents and explicit limits on current-client verification.', href: PALADIN_COMPARATOR_PATH, link: 'Inspect the 21-point example' },
    { title: "Light’s Vigil or traditional tank healing?", body: `In the imported 69913 tree, Light’s Vigil needs at least ${snapshotGate('light_s_vigil').points} points, above the standard Level 30 budget. Do not plan a 21-point healing route around it. Its September 24 mana clarification is tracked separately from the old tooltip.`, href: '/wow-forever-paladin-beta-talent-changes#build-impact', link: 'Read the recorded changes' },
  ],
  protection: [
    { title: 'How does Seal of Fury threat work?', body: 'Treat the ability, its talent modifiers and actual threat output as separate evidence. The spellbook preserves client text; it does not establish a current threat coefficient. We do not turn damage values into threat-per-second estimates without a verified formula.', href: '/wow-forever-paladin-abilities', link: 'Inspect Seal of Fury ability sources' },
    { title: 'Struggling with single-target threat?', body: 'Record your Seal, active Righteous Fury state, ability order, misses and target changes before changing talents. The route below includes Improved Righteous Fury, but a selected talent is not proof of a live threat multiplier or a guaranteed fix.', href: '/wow-forever-protection-paladin-dungeon-build', link: 'Review the dungeon route' },
    { title: 'Which Level 30 dungeon build can I edit?', body: 'Load the 0/21/0 editorial route: Toughness 5, Redoubt 5, Precision 3, Anticipation 5 and Improved Righteous Fury 3. Those selected nodes were checked against 70170. Redoubt’s October 1 tuning is listed separately; the whole calculator remains the older snapshot.', href: protectionPlannerHref(30), link: 'Edit the Level 30 tank route' },
  ],
  retribution: [
    { title: 'Twist of Light versus Holy Shock?', body: `They do not have the same point gate in our imported tree. Holy Shock fits 21 Holy points; Twist needs ${snapshotGate('twist_of_light').points} Retribution points. The comparator makes this budget difference visible instead of advertising two equivalent Level 30 builds.`, href: PALADIN_COMPARATOR_PATH, link: 'Compare the talent gates' },
    { title: 'Do Ret Paladins need Holy talents?', body: 'Our community leveling route spends 0/0/21 and does not require a Holy investment. A Holy Shock route uses a separate 21/0/0 allocation. Neither allocation proves which is faster or stronger in the current client.', href: PALADIN_COMPARATOR_PATH, link: 'Compare the allocations' },
    { title: 'Can I plan traditional two-handed Ret at 30?', body: 'Yes: replay the existing melee-first route through Benediction, Conviction, Pursuit of Justice, Seal of Command and later Ret talents. It excludes the removed Improved Holy Strike and the under-review Crusade node. Check later Vengeance and Sacred Arbiter tuning before relying on old tooltips.', href: '/wow-forever-retribution-paladin-leveling-build', link: 'Replay every leveling point' },
  ],
}
export default function PaladinBuildDecisions({ branch }: { branch: Branch }) {
  return <section className="shell build-decisions" id="beta-build-decisions"><div className="eyebrow">Level 30 · 21 standard points</div><h2>Beta build decisions: {branch === 'holy' ? 'healing and Holy Shock' : branch === 'protection' ? 'dungeon tanking and threat' : 'Ret, twisting and Holy Shock'}</h2><p>Use point budgets and documented data to choose a route. These answers distinguish planning examples from current-client verification and measured performance.</p><div className="decision-grid">{questions[branch].map(question => <article key={question.title}><h3>{question.title}</h3><p>{question.body}</p><a href={question.href}>{question.link} →</a></article>)}</div></section>
}
