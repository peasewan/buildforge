import { PALADIN_COMPARISON_ROUTES } from './data/paladinDecisionTools'
import { DATA_VERSION } from './data/talents'
import { encodeBuild } from './lib/build'

const scheduleSource = 'https://raider.io/events/the-forever-open/event-format'
const rulesSource = 'https://raider.io/events/the-forever-open/qualifiers-finals-format-and-rules'

/** A dated organizer-rule checklist, not an equipment or tournament eligibility validator. */
export default function PaladinTournamentPrep() {
  return <section className="shell pvp-starting-routes" id="forever-open" aria-labelledby="forever-open-heading">
    <header><div className="eyebrow">Organizer rules checked October 15, 2026</div>
      <h2 id="forever-open-heading">Forever Open: Level 30 Paladin preparation</h2>
      <p>This community tournament runs October 17–18. Registration closed October 2; this checklist is for already registered competitors. The organizer requires an eligible Level 30 Horde character and check-in. These are event rules, not Blizzard’s general PvP rules.</p>
      <p><a href={scheduleSource} target="_blank" rel="noreferrer">Check registration requirements and the official event schedule</a></p>
    </header>
    <div className="pvp-starting-grid">
      <article><h3>Confirm your locked talents</h3>
        <p>Qualifier character and talents lock immediately when you confirm them during check-in, even before the check-in window closes. The same build must be used throughout the qualifier. Finals talents may differ and have a separate submission deadline.</p>
        <p>Legacy points are allowed by the organizer. This calculator models standard progression: Level 30 gives 21 talent points. It does not calculate Legacy bonuses or certify tournament eligibility.</p>
      </article>
      <article><h3>Inspect gear and bags</h3>
        <ul>
          <li>Quest and dungeon reward items above item level 45 are prohibited.</li>
          <li>Profession items and tools requiring skill 226 or higher are prohibited. This wording is not a blanket character profession-skill cap.</li>
          <li>Damage-dealing non-equippable pet summons are prohibited; equippable summons and trinkets such as Dog Whistle are permitted under the remaining rules.</li>
          <li>Prohibited items must also be removed from bags before inspection.</li>
        </ul>
      </article>
    </div>
    <details><summary>Consumables and buffs to check before inspection</summary>
      <p>The organizer’s named prohibitions include Student Fodder, Deviate Fish, Flash Bomb, Magic Dust, Slumber Sand, Furbolg Medicine Pouch, Green Leaf Tea, Minor Magic Resistance Potion, Crystal Basilisk Spine, Green Whelp Armor, Goblin Sapper Charge and Gnomish Mind Control Cap.</p>
      <p>Also check the bans on school-protection potions, holiday buffs and consumables, campfire buffs, and temporary world/objective/quest buffs. Only class self-buffs are permitted. The linked stage-specific rules take priority over general guidelines and may be updated.</p>
    </details>
    <p><a href={rulesSource} target="_blank" rel="noreferrer">Read the complete qualifier and finals rules, including inspections and prohibited items</a></p>
    <h3>Check-in and play times</h3>
    <ul>
      <li>October 17 check-in: 7–8 a.m. PT / 9–10 a.m. CT. Shanghai: October 17, 22:00–23:00.</li>
      <li>Qualifiers: October 17, 10 a.m. PT / noon CT. Shanghai: October 18, 01:00.</li>
      <li>Finals: October 18; play time is not yet specified in the organizer’s schedule.</li>
    </ul>
    <h3>Draft a standard 21-point starting allocation</h3>
    <p>These existing Ret and Holy Shock examples are editable planning starts, not tournament-tested recommendations. Compare your choices, copy your final link, then submit through the organizer’s check-in system. Copying a BuildForgeTools link does not register or submit your build.</p>
    <div className="pvp-starting-grid">{PALADIN_COMPARISON_ROUTES.map(route => {
      const build = route.steps.at(-1)!.build
      const query = new URLSearchParams({ id: encodeBuild(build), level: '30', dataset: DATA_VERSION, spec: route.id === 'shockadin' ? 'holy' : 'retribution' })
      return <article key={route.id}><h3>{route.label} · {route.allocation}</h3><p>{route.style}</p><a className="button primary" href={`/build?${query}#calculator`}>Edit {route.label} at Level 30 →</a></article>
    })}</div>
  </section>
}
