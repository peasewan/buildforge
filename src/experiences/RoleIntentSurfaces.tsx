import { useState } from 'react'
import { ArrowRight, Check, Compass, HeartPulse, PawPrint, Shield, Swords, Waypoints } from 'lucide-react'
import type { ClassBuild, ClassDefinition, ClassPageDefinition, ClassTalent } from '../lib/classPage'
import { classPlannerHref, publishedClassPages } from '../lib/classPage'
import { encodePlannerBuild } from '../lib/talentPlanner'
import { diffBuilds } from './buildExperience'
import './role-surfaces.css'

export type RoleSurfaceProps = { classDef: ClassDefinition; page: ClassPageDefinition }

function publishedBuilds(def: ClassDefinition): ClassBuild[] {
  const paths = new Set(publishedClassPages([def]).map(({ page }) => `/${page.slug}`))
  return def.builds.filter((build) => paths.has(build.href))
}

function routesFor(def: ClassDefinition, page: ClassPageDefinition): ClassBuild[] {
  const available = publishedBuilds(def)
  if (page.kind === 'pvp' || page.kind === 'specPvp') {
    return available.filter((build) => build.intent === 'pvp' && (page.kind !== 'specPvp' || build.spec === page.spec))
  }
  const ids = new Set([page.primaryBuildId, ...page.relatedBuildIds])
  return available.filter((build) => ids.has(build.id))
}

function selectedTalents(def: ClassDefinition, build: ClassBuild): ClassTalent<string>[] {
  return def.talents.filter((talent) => (build.build[talent.id] ?? 0) > 0)
}

function EditLink({ def, build }: { def: ClassDefinition; build: ClassBuild }) {
  return (
    <a className="ix-action" href={classPlannerHref(def, encodePlannerBuild(build.build), build.level)}>
      Edit in Calculator <ArrowRight size={16} aria-hidden="true" />
    </a>
  )
}

function Unavailable({ def, page }: { def: ClassDefinition; page: ClassPageDefinition }) {
  const available = publishedBuilds(def)
  return (
    <div className="rs-unavailable">
      <h2>What can be planned now</h2>
      <p>A role-specific legal allocation has not been published. Review the documented limitations below before choosing a supported route.</p>
      <p className="rs-small">The talent records remain readable; an unsupported role allocation is not loaded into the calculator.</p>
      {available.length > 0 && (
        <nav aria-label={`Available ${def.name} routes`}>
          {available.slice(0, 4).map((build) => <a key={build.id} href={build.href}>{build.title}</a>)}
        </nav>
      )}
      {page.sections[0]?.paragraphs[0] && <p className="rs-small">{page.sections[0].paragraphs[0]}</p>}
    </div>
  )
}

function RouteChooser({ builds, selected, onChange, label }: { builds: ClassBuild[]; selected: ClassBuild; onChange: (id: string) => void; label: string }) {
  if (builds.length < 2) return null
  return (
    <label className="rs-route-picker">
      {label}
      <select value={selected.id} onChange={(event) => onChange(event.target.value)}>
        {builds.map((build) => <option key={build.id} value={build.id}>{build.title}</option>)}
      </select>
    </label>
  )
}

function Allocation({ def, build, heading = 'Editable allocation' }: { def: ClassDefinition; build: ClassBuild; heading?: string }) {
  return (
    <article className="rs-allocation">
      <small>EDITORIAL EXAMPLE · LEVEL {build.level} · {build.evidence.replace('_', ' ')}</small>
      <h3>{heading}</h3>
      <strong className="rs-allocation-number">{build.allocation}</strong>
      <p>{def.branchNames[build.spec] ?? build.spec} · {build.role}</p>
      <EditLink def={def} build={build} />
      <span className="rs-small">Talent snapshot through client build {build.verifiedThroughBuild}. Build recommendations are editorial.</span>
    </article>
  )
}

function TalentInventory({ def, build, heading = 'Selected talent ranks', filter }: { def: ClassDefinition; build: ClassBuild; heading?: string; filter?: (talent: ClassTalent<string>) => boolean }) {
  const talents = selectedTalents(def, build).filter(filter ?? (() => true))
  return (
    <article className="rs-evidence">
      <h3>{heading}</h3>
      {talents.length ? (
        <ul>
          {talents.map((talent) => {
            const rank = build.build[talent.id] ?? 0
            const description = talent.rankDescriptions?.[rank - 1]?.trim() || talent.description?.trim()
            return (
              <li key={talent.id}>
                {talent.icon && <img src={talent.icon} alt="" loading="lazy" />}
                <div>
                  <strong>{talent.name} <span>{rank}/{talent.maxRank}</span></strong>
                  <p>{description || 'A verified effect description for this rank is not available.'}</p>
                  <small>{talent.verificationStatus.replace('_', ' ')} · client {talent.verifiedThroughBuild}</small>
                </div>
              </li>
            )
          })}
        </ul>
      ) : <p>No selected talent in this allocation has a verified record for this view.</p>}
    </article>
  )
}

function FocusButtons({ options, selected, onChange, label }: { options: readonly string[]; selected: string; onChange: (value: string) => void; label: string }) {
  return (
    <div className="rs-options" role="group" aria-label={label}>
      {options.map((option) => (
        <button key={option} type="button" aria-pressed={selected === option} onClick={() => onChange(option)}>{option}</button>
      ))}
    </div>
  )
}

function SameAllocation({ def, baseline, build }: { def: ClassDefinition; baseline?: ClassBuild; build: ClassBuild }) {
  if (!baseline) return <p className="rs-small">No same-specialization baseline is published for this comparison.</p>
  const differences = diffBuilds(def, baseline, build)
  return differences.length ? (
    <div className="rs-diff"><strong>Ranks that differ from {baseline.shortTitle}</strong><ul>{differences.map((item) => <li key={item.talentId}>{item.name}: {item.left} → {item.right}</li>)}</ul></div>
  ) : (
    <p className="rs-small">These routes use the same talent allocation. Their intended use differs; no talent changes or performance advantage are implied.</p>
  )
}

export function PvpPlanner({ classDef: def, page }: RoleSurfaceProps) {
  const routes = routesFor(def, page)
  const [id, setId] = useState(routes.find((build) => build.id === page.primaryBuildId)?.id ?? routes[0]?.id)
  const [focus, setFocus] = useState('Opening position')
  const build = routes.find((route) => route.id === id)
  const baseline = publishedBuilds(def).find((route) => route.spec === build?.spec && route.intent === 'spec' && route.id !== build?.id)
  const prompts: Record<string, string> = {
    'Opening position': 'Record whether the planned position lets you take a useful first action. Opponent and terrain can change the result.',
    'Sustained pressure': 'Compare repeatable actions and recovery during the full encounter; one opening hit is not an outcome measure.',
    'Recovery and exit': 'Note whether you can reset or support the next exchange after pressure changes.',
  }
  return (
    <section className="rs-surface rs-pvp" data-surface="pvp-matchup" aria-label="PvP encounter planner">
      <div className="rs-first rs-pvp-board">
        <div className="rs-kicker"><Swords aria-hidden="true" /> PVP TEST PLAN</div>
        <h2>Set the encounter focus</h2>
        <FocusButtons options={Object.keys(prompts)} selected={focus} onChange={setFocus} label="Encounter focus" />
        <p aria-live="polite">{prompts[focus]}</p>
        <p className="rs-small">Editorial observation prompts. No matchup win rate or simulated damage is claimed.</p>
      </div>
      {build ? (
        <div className="rs-pvp-details">
          <div>
            <RouteChooser builds={routes} selected={build} onChange={setId} label="PvP route" />
            <Allocation def={def} build={build} heading="Starting route" />
          </div>
          <div className="rs-role-support">
            <h3>Compare the route</h3>
            <p>{page.sections[0]?.paragraphs[0] ?? build.role}</p>
            <SameAllocation def={def} baseline={baseline} build={build} />
          </div>
          <TalentInventory def={def} build={build} />
        </div>
      ) : <Unavailable def={def} page={page} />}
    </section>
  )
}

export function DungeonPlanner({ classDef: def, page }: RoleSurfaceProps) {
  const routes = routesFor(def, page)
  const [id, setId] = useState(routes.find((route) => route.id === page.primaryBuildId)?.id ?? routes[0]?.id)
  const [phase, setPhase] = useState('Before the pull')
  const build = routes.find((route) => route.id === id)
  const prompts: Record<string, string> = {
    'Before the pull': 'Agree on the target, group roles and recovery needed before entering the next pack.',
    'During the pull': 'Watch target selection, positioning and any interruption or control loss. Record what actually happened.',
    'After the pull': 'Separate recovery, missed actions and uncontrolled enemies before changing a talent rank.',
  }
  return (
    <section className="rs-surface rs-dungeon" data-surface="dungeon-pull" aria-label="Dungeon pull planner">
      <div className="rs-first rs-dungeon-timeline">
        <div className="rs-kicker"><Waypoints aria-hidden="true" /> GROUP PULL</div>
        <h2>Prepare a pull</h2>
        <FocusButtons options={Object.keys(prompts)} selected={phase} onChange={setPhase} label="Pull phase" />
        <p aria-live="polite">{prompts[phase]}</p>
        <p className="rs-small">Planning checklist, not a verified dungeon encounter script.</p>
      </div>
      {build ? (
        <div className="rs-dungeon-details">
          <RouteChooser builds={routes} selected={build} onChange={setId} label="Dungeon route" />
          <Allocation def={def} build={build} heading="Group route" />
          <div className="rs-role-support"><h3>What the route asks you to test</h3><p>{page.sections[0]?.paragraphs[0] ?? build.role}</p></div>
          <TalentInventory def={def} build={build} />
        </div>
      ) : <Unavailable def={def} page={page} />}
    </section>
  )
}

export function TankPlanner({ classDef: def, page }: RoleSurfaceProps) {
  const routes = routesFor(def, page)
  const build = routes.find((route) => route.id === page.primaryBuildId) ?? routes[0]
  const [focus, setFocus] = useState('Enemy control')
  const prompts: Record<string, string> = {
    'Enemy control': 'Record when an enemy leaves the intended target and what happened immediately before it did.',
    'Incoming damage': 'Compare damage received across similar pulls and note healer recovery separately.',
    'Healer recovery': 'Record the group’s recovery time after comparable pulls before changing the allocation.',
  }
  return (
    <section className="rs-surface rs-tank" data-surface="tank-inventory" aria-label="Tank review ledger">
      <div className="rs-first rs-tank-ledger">
        <div className="rs-kicker"><Shield aria-hidden="true" /> TANK REVIEW</div>
        <h2>Tank review ledger</h2>
        <FocusButtons options={Object.keys(prompts)} selected={focus} onChange={setFocus} label="Tank observation" />
        <p aria-live="polite">{prompts[focus]}</p>
        <p className="rs-small">These are observations to make in play. Talent records do not calculate threat or mitigation here.</p>
      </div>
      {build ? (
        <div className="rs-tank-details">
          <TalentInventory def={def} build={build} />
          <Allocation def={def} build={build} heading="Tank starting point" />
          <div className="rs-role-support"><h3>Role condition</h3><p>{page.sections[0]?.paragraphs[0] ?? build.role}</p></div>
        </div>
      ) : <Unavailable def={def} page={page} />}
    </section>
  )
}

export function HealingPlanner({ classDef: def, page }: RoleSurfaceProps) {
  const routes = routesFor(def, page)
  const build = routes.find((route) => route.id === page.primaryBuildId) ?? routes[0]
  const [lens, setLens] = useState('Mana and recovery')
  const prompts: Record<string, string> = {
    'Mana and recovery': 'Track remaining mana and time needed before the next comparable pull.',
    'Group support': 'Track missed support opportunities and whether movement or line of sight limited the group.',
  }
  return (
    <section className="rs-surface rs-healing" data-surface="healing-compare" aria-label="Healing route comparison">
      <div className="rs-first rs-healing-pulse">
        <div className="rs-kicker"><HeartPulse aria-hidden="true" /> HEALING TEST</div>
        <h2>Compare the healing job</h2>
        <FocusButtons options={Object.keys(prompts)} selected={lens} onChange={setLens} label="Healing observation" />
        <p aria-live="polite">{prompts[lens]}</p>
        <p className="rs-small">Compare like-for-like pulls. This planner does not derive healing throughput or a rotation.</p>
      </div>
      {build ? (
        <div className="rs-healing-details">
          <div className="rs-role-support"><h3>Group context</h3><p>{page.sections[0]?.paragraphs[0] ?? build.role}</p></div>
          <Allocation def={def} build={build} heading="Healing route" />
          <TalentInventory def={def} build={build} />
        </div>
      ) : <Unavailable def={def} page={page} />}
    </section>
  )
}

export function PetPlanner({ classDef: def, page }: RoleSurfaceProps) {
  const routes = routesFor(def, page)
  const build = routes.find((route) => route.id === page.primaryBuildId) ?? routes[0]
  const [view, setView] = useState('Selected talents')
  return (
    <section className="rs-surface rs-pet" data-surface="pet-support" aria-label="Pet support talent view">
      <div className="rs-first rs-pet-chain">
        <div className="rs-kicker"><PawPrint aria-hidden="true" /> PET SUPPORT</div>
        <h2>Selected support talents</h2>
        <FocusButtons options={['Selected talents', 'Evidence gaps']} selected={view} onChange={setView} label="Pet data view" />
        {view === 'Evidence gaps' ? (
          <p aria-live="polite">No verified pet-family comparison, pet talent tree or pet scaling calculation is available in this planner.</p>
        ) : (
          <p aria-live="polite">Review the selected player talents, then test pet control and recovery with the same pet in play.</p>
        )}
        <p className="rs-small">No verified pet-family comparison is provided. Player talent ranks are the only editable data here.</p>
      </div>
      {build ? (
        <div className="rs-pet-details">
          <TalentInventory def={def} build={build} heading="Player talent records" />
          <div className="rs-role-support"><h3>Use the same pet in the test</h3><p>{page.sections[0]?.paragraphs[0] ?? build.role}</p></div>
          <Allocation def={def} build={build} heading="Pet-support route" />
        </div>
      ) : <Unavailable def={def} page={page} />}
    </section>
  )
}

export function TotemPlanner({ classDef: def, page }: RoleSurfaceProps) {
  const routes = routesFor(def, page)
  const build = routes.find((route) => route.id === page.primaryBuildId) ?? routes[0]
  const [view, setView] = useState('Talent coverage')
  return (
    <section className="rs-surface rs-totem" data-surface="totem-coverage" aria-label="Totem talent coverage">
      <div className="rs-first rs-totem-field">
        <div className="rs-kicker"><Compass aria-hidden="true" /> TOTEM PLANNING</div>
        <h2>Totem talent coverage</h2>
        <FocusButtons options={['Talent coverage', 'Spell loadout limits']} selected={view} onChange={setView} label="Totem planning view" />
        <p aria-live="polite">{view === 'Talent coverage'
          ? 'Compare the selected talent ranks with the group’s placement and movement needs.'
          : 'Totem spell loadout is not verified here; the calculator does not assign totems to slots or simulate their coverage.'}</p>
        <p className="rs-small">Totem spell loadout is not verified by these talent records.</p>
      </div>
      {build ? (
        <div className="rs-totem-details">
          <TalentInventory def={def} build={build} heading="Totem-related selected ranks" filter={(talent) => /totem/i.test(talent.name)} />
          <div className="rs-role-support"><h3>Placement condition</h3><p>{page.sections[0]?.paragraphs[0] ?? build.role}</p></div>
          <Allocation def={def} build={build} heading="Editable talent route" />
        </div>
      ) : <Unavailable def={def} page={page} />}
      <p className="rs-source-line"><Check size={14} aria-hidden="true" /> Talent ranks come from the class dataset; spell coverage requires separate verification.</p>
    </section>
  )
}
