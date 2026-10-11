import type { Branch } from './lib/build'
import { PALADIN_COMPARATOR_PATH, snapshotGate } from './data/paladinDecisionTools'
import { protectionPlannerHref } from './data/protectionCurrentRoute'
import { OCTOBER_8_GAMEPLAY_SOURCE } from './data/october8Gameplay'

const questions: Record<Branch, Array<{ title: string; body: string; href: string; link: string }>> = {
  holy: [
    { title: 'Where do my remaining Holy points go?', body: 'In our 21/0/0 editorial example, points 17–20 fill Illumination and point 21 takes Holy Shock. That is a legal route in the reviewed 70245 tree, not a measured leveling or healing winner. Compare it with healing-first choices for your group and gear.', href: PALADIN_COMPARATOR_PATH, link: 'Inspect the 21-point Holy route' },
    { title: 'Is Holy worth leveling at 30?', body: 'Separate solo questing from group healing. Our Holy starter is a healing-oriented planning route; it is not a measured solo-leveling winner. Compare the Holy Shock example with the Ret route under the same equipment and encounter conditions.', href: PALADIN_COMPARATOR_PATH, link: 'Compare Holy Shock and Ret' },
    { title: 'Holy healer or Shockadin?', body: 'Access to Holy Shock alone does not turn a healing allocation into an optimized damage build. The comparator shows a 21/0/0 editorial snapshot example, with healing support talents and explicit limits on current-client verification.', href: PALADIN_COMPARATOR_PATH, link: 'Inspect the 21-point example' },
    { title: "Light’s Vigil or traditional tank healing?", body: `In the reviewed 70245 tree, Light’s Vigil needs at least ${snapshotGate('light_s_vigil').points} points, above the standard Level 30 budget. Do not plan a 21-point healing route around it. Its September 24 mana clarification is tracked separately from community-resolved rank text.`, href: '/wow-forever-paladin-beta-talent-changes#build-impact', link: 'Read the recorded changes' },
  ],
  protection: [
    { title: 'Holy Shield at Level 30?', body: `No in the reviewed 70245 structure: Holy Shield needs ${snapshotGate('holy_shield').points} Protection points, including the capstone point after 30 spent. Its position and Templar’s Bulwark arrow also appear in the focused 70170 Protection review. Even a modeled 26-point Level 30 Talented budget is short.`, href: '/wow-forever-protection-paladin-talents', link: 'Inspect the Protection tree' },
    { title: 'Bulwark or Reckoning for the 21st point?', body: 'The focused 70170 review places Templar’s Bulwark and Reckoning in the same Protection row. After 20 Protection points, either can take your 21st point instead of the third Improved Righteous Fury rank in our editorial route. The community-resolved Reckoning text mentions a Block trigger and a critical-hit trigger. A shield-only Reckoning restriction is not verified from these client records, so test a 2H setup in the Beta before ruling it out.', href: '/wow-forever-protection-paladin-talents', link: 'Compare their talent records' },
    { title: 'How does Seal of Fury threat work?', body: 'Treat the ability, its talent modifiers and actual threat output as separate evidence. The older spellbook lists trainer metadata for Seal of Fury, not its full effect or a current threat coefficient. The reviewed Improved Seal of Fury talent text ties mana restoration to a fully consumed absorb shield; the October 8 server fixes on this page are separate evidence. We do not turn damage values into threat-per-second estimates without a verified formula.', href: '/wow-forever-paladin-abilities', link: 'Inspect Seal of Fury ability sources' },
    { title: 'Struggling with single-target threat?', body: 'Record your Seal, active Righteous Fury state, ability order, misses and target changes before changing talents. The route below includes Improved Righteous Fury, but a selected talent is not proof of a live threat multiplier or a guaranteed fix.', href: '/wow-forever-protection-paladin-dungeon-build', link: 'Review the dungeon route' },
    { title: 'Which Level 30 dungeon build can I edit?', body: 'Load the 0/21/0 editorial route: Toughness 5, Redoubt 5, Precision 3, Anticipation 5 and Improved Righteous Fury 3. Those selected nodes were checked against 70170. Redoubt’s October 1 tuning is listed separately; the complete calculator now uses reviewed 70245 structure and separately sourced community rank text.', href: protectionPlannerHref(30), link: 'Edit the Level 30 tank route' },
  ],
  retribution: [
    { title: 'Where do my remaining Ret points go?', body: 'Our 0/0/21 editorial route puts point 17 into Sanctified Judgement, points 18–20 into Vindication, and point 21 into Vengeance. Moving points into Holy makes a different hybrid allocation; compare each 21-point choice in the reviewed 70245 planner. This is not a measured speed or damage ranking.', href: '/wow-forever-retribution-paladin-leveling-build', link: 'Replay the Ret point order' },
    { title: 'Twist of Light versus Holy Shock?', body: `They do not have the same point gate in our imported tree. Holy Shock fits 21 Holy points; Twist needs ${snapshotGate('twist_of_light').points} Retribution points. The comparator makes this budget difference visible instead of advertising two equivalent Level 30 builds.`, href: PALADIN_COMPARATOR_PATH, link: 'Compare the talent gates' },
    { title: 'Do Ret Paladins need Holy talents?', body: 'Our community leveling route spends 0/0/21 and does not require a Holy investment. A Holy Shock route uses a separate 21/0/0 allocation. Neither allocation proves which is faster or stronger in the current client.', href: PALADIN_COMPARATOR_PATH, link: 'Compare the allocations' },
    { title: 'Can I plan traditional two-handed Ret at 30?', body: 'Yes: replay the existing melee-first route through Benediction, Conviction, Pursuit of Justice, Seal of Command and later Ret talents. It excludes the removed Improved Holy Strike and the client-confirmed removed Crusade node. Vengeance and Sacred Arbiter rank text has separate community evidence; confirm live gameplay before comparing output.', href: '/wow-forever-retribution-paladin-leveling-build', link: 'Replay every leveling point' },
  ],
}
function ProtectionGameplayReview() {
  return <>
    <section className="patch-impact" aria-labelledby="protection-oct8-heading">
      <div className="eyebrow">Official gameplay notes · October 8, 2026</div>
      <h3 id="protection-oct8-heading">October 8 Protection gameplay changes</h3>
      <ul>
        <li>Mana restoration from Improved Seal of Fury and Shield Specialization no longer generates threat.</li>
        <li>Seal of Fury’s unintended mana return without Improved Seal of Fury was fixed.</li>
        <li>Reckoning can trigger at most once every 1.5 seconds.</li>
      </ul>
      <p>A lower threat result after these fixes does not by itself establish another undocumented nerf. Check your Seal, Righteous Fury state and ability sequence before comparing pulls.</p>
      <p><a href={OCTOBER_8_GAMEPLAY_SOURCE.url} target="_blank" rel="noreferrer">{OCTOBER_8_GAMEPLAY_SOURCE.label}</a></p>
      <small>The calculator still uses reviewed 70245 structure and separately sourced rank text. These server notes do not verify a newer client tree or rewrite its archived tooltips.</small>
    </section>
    <section aria-labelledby="protection-weapon-heading">
      <h3 id="protection-weapon-heading">Fast or slow weapon for Protection Paladin?</h3>
      <p>Players are comparing Holy Strike hit size with mana sustain. This is a community question, not a verified best-weapon recommendation. Holy Strike’s cooldown change was announced September 24; it is not a new October 8 change.</p>
      <div className="decision-table-scroll"><table className="decision-table">
        <caption>Protection weapon-speed comparison checklist</caption>
        <thead><tr><th scope="col">Weapon choice</th><th scope="col">What to measure</th><th scope="col">What to check</th></tr></thead>
        <tbody>
          <tr><th scope="row">Faster weapon</th><td>Landed swings, absorb-shield consumption and net mana over the same time window.</td><td>Does more frequent swinging actually improve your observed sustain? Do not assume mana on every hit.</td></tr>
          <tr><th scope="row">Slower weapon</th><td>Holy Strike hit size, misses, total damage and mana spent over that window.</td><td>Does a larger observed hit compensate for the other changes? One large hit does not establish higher sustained threat.</td></tr>
        </tbody>
      </table></div>
      <p>For a useful comparison, keep your character level, ability ranks, talents, buffs, Seal, Righteous Fury and encounter consistent. Record each weapon’s DPS, stats and enchant; those differences can confound a speed comparison. Compare several pulls rather than one crit. Use combat-log observations; this page does not model proc rules or exact TPS.</p>
      <p><a href="https://us.forums.blizzard.com/en/wow/t/prot-paladin-holy-strike-weapon-speed/2378322" target="_blank" rel="noreferrer">Read the October 10 player discussion</a> · <a href={protectionPlannerHref(30)}>Edit the same Level 30 route</a></p>
    </section>
  </>
}

export default function PaladinBuildDecisions({ branch }: { branch: Branch }) {
  return <section className="shell build-decisions" id="beta-build-decisions">
    <div className="eyebrow">Level 30 · 21 standard points</div>
    <h2>Beta build decisions: {branch === 'holy' ? 'healing and Holy Shock' : branch === 'protection' ? 'dungeon tanking and threat' : 'Ret, twisting and Holy Shock'}</h2>
    <p>Standard Level 30 progression gives 21 points. Blizzard says <a href="https://news.blizzard.com/en-us/article/24307383/get-to-know-the-world-of-warcraft-forever-legacy-system" target="_blank" rel="noreferrer">Legacy: Talented</a> can unlock points up to five levels early, which models up to 26 points at Level 30 if the perk and future points are available. Its exact Beta timing is unverified; the linked routes use 21 points.</p>
    <p>Data scope: the full 50-node 70245 tree has reviewed client structure. The earlier 70170 review checked the selected Protection route nodes; resolved rank text is community-verified and prerequisite-rank rules are assumptions. These checks do not measure build performance.</p>
    {branch === 'protection' && <ProtectionGameplayReview />}
    <div className="decision-grid">{questions[branch].map(question => <article key={question.title}><h3>{question.title}</h3><p>{question.body}</p><a href={question.href}>{question.link} →</a></article>)}</div>
  </section>
}
