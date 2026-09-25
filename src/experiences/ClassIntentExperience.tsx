import { discoveryGroups } from '../data/siteDiscovery'
import { useState } from 'react'
import {
  ArrowRight,
  Ban,
  Check,
  Search,
  Waypoints,
} from 'lucide-react'
import type {
  ClassBuild,
  ClassDefinition,
  ClassPageDefinition,
  ClassTalent,
} from '../lib/classPage'
import {
  classPlannerHref,
  publishedClassPages,
  unallocatableBranches,
} from '../lib/classPage'
import {
  encodePlannerBuild,
  totalPlannerPoints,
  type PlannerBuild,
} from '../lib/talentPlanner'
import VerificationBadge from '../VerificationBadge'
import {
  buildsUsingTalent,
  diffBuilds,
  progressionForBuild,
} from './buildExperience'

import { experienceLabel } from './experienceLabels'
import { PvpPlanner, DungeonPlanner, TankPlanner, HealingPlanner, PetPlanner, TotemPlanner } from './RoleIntentSurfaces'

type Props = { classDef: ClassDefinition; page: ClassPageDefinition }
const allocation = (def: ClassDefinition, build: PlannerBuild) =>
  def.branches
    .map((b) =>
      def.talents
        .filter((t) => t.branch === b)
        .reduce((sum, t) => sum + (build[t.id] ?? 0), 0),
    )
    .join('/')
const href = (def: ClassDefinition, build: ClassBuild, points = build.build) =>
  classPlannerHref(def, encodePlannerBuild(points), build.level)
const availableBuilds = (def: ClassDefinition) => {
  const paths = new Set(
    publishedClassPages([def]).map(({ page: p }) => `/${p.slug}`),
  )
  return def.builds.filter((b) => paths.has(b.href))
}
function EditLink({
  def,
  build,
  points,
  label = 'Edit in Calculator',
}: {
  def: ClassDefinition
  build: ClassBuild
  points?: PlannerBuild
  label?: string
}) {
  return (
    <a className="ix-action" href={href(def, build, points)}>
      {label}
      <ArrowRight size={16} />
    </a>
  )
}
function RankList({
  def,
  points,
}: {
  def: ClassDefinition
  points: PlannerBuild
}) {
  return (
    <ul className="ix-ranks">
      {def.talents
        .filter((t) => (points[t.id] ?? 0) > 0)
        .map((t) => (
          <li key={t.id}>
            {t.icon && <img src={t.icon} alt="" loading="lazy" />}
            <span>{t.name}</span>
            <b>
              {points[t.id]}/{t.maxRank}
            </b>
          </li>
        ))}
    </ul>
  )
}
function RoutePicker({
  label,
  builds,
  value,
  onChange,
}: {
  label: string
  builds: ClassBuild[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <label className="ix-field">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {builds.map((b) => (
          <option value={b.id} key={b.id}>
            {b.title}
          </option>
        ))}
      </select>
    </label>
  )
}
function DiffTable({
  def,
  left,
  right,
}: {
  def: ClassDefinition
  left: ClassBuild
  right: ClassBuild
}) {
  const diff = diffBuilds(def, left, right)
  return (
    <div className="ix-diff">
      <h3>Talent differences</h3>
      {diff.length ? (
        <div className="ix-table-wrap">
          <table>
            <caption>
              {left.shortTitle} compared with {right.shortTitle}
            </caption>
            <thead>
              <tr>
                <th scope="col">Talent</th>
                <th scope="col">Left route</th>
                <th scope="col">Right route</th>
              </tr>
            </thead>
            <tbody>
              {diff.map((d) => (
                <tr key={d.talentId}>
                  <th scope="row">{d.name}</th>
                  <td>{d.left}</td>
                  <td>{d.right}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="ix-same">
          These routes use the same talent allocation. Their intended use
          differs; no talent changes or performance advantage are implied.
        </p>
      )}
    </div>
  )
}
function Comparison({ classDef: def, page }: Props) {
  const builds = availableBuilds(def),
    preferred = [page.primaryBuildId, ...page.relatedBuildIds].flatMap(
      (id) => builds.find((b) => b.id === id) ?? [],
    )
  const [leftId, setLeft] = useState(preferred[0]?.id ?? builds[0]?.id),
    [rightId, setRight] = useState(
      preferred.find((b) => b.id !== preferred[0]?.id)?.id ?? builds[1]?.id,
    )
  const left = builds.find((b) => b.id === leftId),
    right = builds.find((b) => b.id === rightId)
  if (!left || !right)
    return (
      <p>Two reviewed build records are not yet available for comparison.</p>
    )
  return (
    <section className="ix-comparison" aria-label="Build comparison" data-surface="route-comparison">
      <div className="ix-two">
        {[
          { b: left, label: 'Left build', set: setLeft },
          { b: right, label: 'Right build', set: setRight },
        ].map(({ b, label, set }) => (
          <article className="ix-panel" key={label}>
            <RoutePicker
              label={label}
              builds={builds}
              value={b.id}
              onChange={set}
            />
            <strong className="ix-allocation">{b.allocation}</strong>
            <p>{b.role}</p>
            <RankList def={def} points={b.build} />
            <EditLink def={def} build={b} />
          </article>
        ))}
      </div>
      <DiffTable def={def} left={left} right={right} />
    </section>
  )
}
function Progression({ classDef: def, page }: Props) {
  const all = availableBuilds(def),
    initial = all.find((b) => b.id === page.primaryBuildId) ?? all[0]
  const [id, setId] = useState(initial?.id),
    [level, setLevel] = useState(10),
    [talentedPreview, setTalentedPreview] = useState(false)
  const build = all.find((b) => b.id === id)
  if (!build)
    return <p>A reviewed point-by-point route is not available yet.</p>
  const result = progressionForBuild(def, build)
  if (result.error)
    return (
      <p role="status">
        This route needs a point-order review before step-by-step planning is
        available. The existing endpoint remains available below.
      </p>
    )
  const end = result.steps.at(-1)?.level ?? 10,
    current = Math.min(level, end),
    advance = talentedPreview ? 5 : 0,
    atLevel = (targetLevel: number, earlyLevels: number) => result.steps.filter((s) => s.level <= targetLevel + earlyLevels).at(-1),
    step = atLevel(current, advance),
    next = result.steps.find((s) => s.level > current + advance)
  const nextTalent = def.talents.find((t) => t.id === next?.talentId),
    points = step?.allocation ?? {},
    standardPoints = totalPlannerPoints(atLevel(current, 0)?.allocation ?? {}),
    modeledPoints = totalPlannerPoints(atLevel(current, 5)?.allocation ?? {})
  return (
    <section className="ix-progression" aria-label="Talent progression" data-surface="level-progression">
      <div className="ix-two">
        <article className="ix-level-control ix-panel">
          <p className="ix-eyebrow">YOUR NEXT POINT</p>
          <RoutePicker
            label="Progression route"
            builds={all.filter(
              (b) =>
                b.intent === 'leveling' ||
                b.id === page.primaryBuildId ||
                b.id === id,
            )}
            value={id!}
            onChange={setId}
          />
          <div className="ix-talented-control">
            <button type="button" role="switch" aria-checked={talentedPreview} aria-label="Legacy: Talented timing preview" onClick={() => setTalentedPreview((value) => !value)}>
              Legacy: Talented <span>{talentedPreview ? 'Preview on' : 'Preview off'}</span>
            </button>
            <p>At level {current}: standard route {standardPoints}/{result.steps.length}; illustrative maximum advance {modeledPoints}/{result.steps.length} points.</p>
          </div>
          <label className="ix-level-field">
            Your level{' '}
            <input
              aria-label="Your level"
              type="number"
              min={10}
              max={end}
              value={current}
              onChange={(e) =>
                setLevel(
                  Math.max(
                    10,
                    Math.min(end, Math.floor(Number(e.target.value) || 10)),
                  ),
                )
              }
            />
          </label>
          <input
            aria-label="Level slider"
            type="range"
            min={10}
            max={end}
            value={current}
            onChange={(e) => setLevel(Number(e.target.value))}
          />
          <p data-testid="progression-current">
            <b>{totalPlannerPoints(points)} points</b> ·{' '}
            {allocation(def, points)}
          </p>
          <div className="ix-next" data-testid="progression-next">
            <Waypoints />
            <div>
              <span>{next ? `At level ${next.level - advance}${talentedPreview ? ' (modeled)' : ''}` : 'Published route complete'}</span>
              <strong>
                {nextTalent
                  ? `${nextTalent.name} ${next!.rank}/${nextTalent.maxRank}`
                  : 'You have reached this route’s endpoint.'}
              </strong>
            </div>
          </div>
          <p className="ix-note">
            {talentedPreview
              ? 'Illustrative maximum five-level advance, not a verified Beta unlock schedule. '
              : 'One point per level from 10 is a planner assumption. '}
            {result.orderStatus === 'editorial'
              ? 'Uses the recorded editorial point order.'
              : 'Step order is derived from the published allocation, checked for legal prerequisites.'}
            {' '}The <a href="https://news.blizzard.com/en-us/article/24307383/get-to-know-the-world-of-warcraft-forever-legacy-system" target="_blank" rel="noreferrer">Blizzard Legacy announcement</a> confirms only that Talented can unlock points up to five levels early. It does not confirm the exact schedule or current Beta availability. This comparison does not model points beyond this published route.
          </p>
        </article>
        <article className="ix-panel">
          <h2>Your allocation at level {current}{talentedPreview ? ' · modeled Talented timing' : ''}</h2>
          <RankList def={def} points={points} />
          <EditLink
            def={def}
            build={build}
            points={points}
            label="Edit this level in Calculator"
          />
          <p className="ix-note">Loads these exact points in the calculator’s Level {build.level} budget. The modeled timing does not change its point cap or verify early access in the live Beta.</p>
        </article>
      </div>
      <div className="ix-milestones" aria-label="Level milestones">
        {[...new Set([10, 15, end])]
          .filter((l) => l <= end)
          .map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={current === l}
              onClick={() => setLevel(l)}
            >
              <small>LEVEL {l}</small>
              <strong>{totalPlannerPoints(atLevel(l, advance)?.allocation ?? {})} route points</strong>
              <span>
                {
                  def.talents.find(
                    (t) =>
                      t.id ===
                      atLevel(l, advance)?.talentId,
                  )?.name
                }
              </span>
            </button>
          ))}
      </div>
    </section>
  )
}
function BuildWorkbench({ classDef: def, page }: Props) {
  const builds = availableBuilds(def),
    build = builds.find((b) => b.id === page.primaryBuildId) ?? builds[0],
    alternatives = builds.filter((b) => b.id !== build?.id)
  const [otherId, setOther] = useState(
    alternatives.find((b) => b.spec === build?.spec)?.id ?? alternatives[0]?.id,
  )
  if (!build) return <p>No reviewed allocation is available for this page.</p>
  const other = alternatives.find((b) => b.id === otherId)
  return (
    <section className="ix-workbench" data-surface="build-workbench">
      <div className="ix-two">
        <article className="ix-panel ix-build-target">
          <p className="ix-eyebrow">TARGET ALLOCATION</p>
          <strong className="ix-allocation">{build.allocation}</strong>
          <p>
            Level {build.level} · {totalPlannerPoints(build.build)} points ·
            Editorial example
          </p>
          <RankList def={def} points={build.build} />
          <EditLink def={def} build={build} />
        </article>
        <article className="ix-panel">
          <h2>What this route is for</h2>
          <p>{build.role}</p>
          <ul className="ix-notes">
            {build.playstyle.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <h3>Compare an alternative</h3>
          {other && (
            <>
              <RoutePicker
                label="Alternative build"
                builds={alternatives}
                value={other.id}
                onChange={setOther}
              />
              <DiffTable def={def} left={build} right={other} />
              <EditLink def={def} build={other} label="Open alternative" />
            </>
          )}
        </article>
      </div>
    </section>
  )
}
function TalentRecord({
  def,
  t,
  excluded,
}: {
  def: ClassDefinition
  t: ClassTalent<string>
  excluded: boolean
}) {
  const [rank, setRank] = useState(1),
    used = buildsUsingTalent(def, t.id)
  return (
    <article
      className="ix-talent-record"
      data-testid="talent-record"
      data-excluded={excluded ? 'true' : undefined}
    >
      <div className="ix-record-head">
        {t.icon && <img src={t.icon} alt="" loading="lazy" />}
        <div>
          <h3>{t.name}</h3>
          <small>
            {def.branchNames[t.branch]} · Tier {t.row} · {t.maxRank} ranks
          </small>
        </div>
        <VerificationBadge status={t.verificationStatus} />
      </div>
      <label className="ix-field">
        Tooltip rank for {t.name}
        <select value={rank} onChange={(e) => setRank(Number(e.target.value))}>
          {Array.from({ length: t.maxRank }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Rank {i + 1}
            </option>
          ))}
        </select>
      </label>
      <p>
        {t.rankDescriptions?.[rank - 1]?.trim() ||
          'This rank’s tooltip is not available in the reviewed dataset.'}
      </p>
      <div className="ix-record-facts">
        <span>{t.requiredTreePoints} earlier tree points</span>
        <span>Client {t.verifiedThroughBuild}</span>
      </div>
      {t.prerequisite?.length ? (
        <p>
          Prerequisite:{' '}
          {t.prerequisite
            .map(
              (r) =>
                `${def.talents.find((n) => n.id === r.talentId)?.name ?? r.talentId} ${r.requiredRank ?? 'full'} ranks`,
            )
            .join('; ')}
          . Required rank: derived assumption.
        </p>
      ) : null}
      {used.length > 0 && (
        <div className="ix-editorial-impact" data-editorial-usage>
          <h4>Used in {used.length} published editorial builds</h4>
          <p>Editorial examples, not player popularity. Some routes reuse the same allocation.</p>
          <ul>
            {used.map((build) => (
              <li key={build.id}>
                <a href={build.href}>{build.title}</a>
                <span>Rank {build.build[t.id]}/{t.maxRank} · Level {build.level} · {build.role}</span>
                {build.keyTalentIds.includes(t.id) && <span>Key talent in this editorial route</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <details>
        <summary>Sources</summary>
        <ul>
          {t.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </article>
  )
}
function TalentReference({ classDef: def, page }: Props) {
  const [query, setQuery] = useState(''),
    [branch, setBranch] = useState(page.spec ?? 'all')
  const unallocatable = unallocatableBranches(def)
  const talents = def.talents.filter(
    (t) =>
      (branch === 'all' || t.branch === branch) &&
      t.name.toLowerCase().includes(query.toLowerCase().trim()),
  )
  return (
    <section className="ix-reference" data-surface="talent-reference">
      <div className="ix-search-bar">
        <label className="ix-field">
          <span>
            <Search size={16} /> Search talents
          </span>
          <input
            aria-label="Search talents"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, e.g. a talent you want to inspect"
          />
        </label>
        <label className="ix-field">
          Specialization
          <select value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option value="all">All specializations</option>
            {def.branches.map((b) => (
              <option key={b} value={b}>
                {def.branchNames[b]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p aria-live="polite">
        {talents.length} matching talents · positions and ranks carry field
        evidence; tooltip gaps stay visible.
      </p>
      <p className="ix-note">No reviewed previous client-build snapshot is available for this catalog, so no talent change since a prior Beta build is claimed here.</p>
      {def.branches
        .filter(
          (b) => unallocatable.has(b) && (branch === 'all' || b === branch),
        )
        .map((b) => (
          <div
            className="ix-exclusion"
            key={b}
            data-branch={b}
            data-excluded="true"
            role="note"
          >
            <Ban size={16} aria-hidden="true" />
            <div>
              <strong>{def.branchNames[b]}</strong>
              <p>Branch cannot be used in build validation</p>
              <small>
                No node in this branch can be taken first: every published node
                here sits behind a tree-point requirement. These records remain
                visible as evidence, not as allocatable recommendations.
              </small>
            </div>
          </div>
        ))}
      <div className="ix-reference-grid">
        {talents.map((t) => (
          <TalentRecord
            key={t.id}
            def={def}
            t={t}
            excluded={unallocatable.has(t.branch)}
          />
        ))}
      </div>
      {!talents.length && (
        <p>No talents match. Try a shorter name or another specialization.</p>
      )}
    </section>
  )
}
function Hub({ classDef: def }: Props) {
  const [query, setQuery] = useState(''),
    pages = publishedClassPages([def])
      .map(({ page }) => page)
      .filter((p) => p.kind !== 'buildsHub' && p.kind !== 'calculator'),
    visible = pages.filter((p) =>
      `${p.h1} ${p.kind}`.toLowerCase().includes(query.toLowerCase()),
    )
  return (
    <section className="ix-hub" data-surface="build-discovery">
      <div className="ix-hub-discovery">
        <h2>Choose a specialization</h2>
        <div className="ix-hub-specs">{def.branches.map(branch => {
          const routes = pages.filter(p => p.spec === branch)
          const example = availableBuilds(def).find(b => b.spec === branch && b.intent === 'spec')
          return <article className="ix-hub-spec" key={branch}><h3>{def.branchIcons?.[branch] && <img src={def.branchIcons[branch]} alt="" />}{def.branchNames[branch]}</h3><p>{def.branchTaglines[branch]}</p>{example && <p><strong>{example.allocation}</strong> · {totalPlannerPoints(example.build)} points · Editorial allocation</p>}<nav aria-label={`${def.branchNames[branch]} routes`}>{routes.length ? routes.map(p => <a key={p.slug} href={`/${p.slug}`}>{experienceLabel(p.kind)}</a>) : <span>No specialization route published yet.</span>}</nav></article>
        })}</div>
        <h2>Choose a playstyle</h2>
        <div className="ix-hub-intents">{discoveryGroups([def], false).filter(g => g.links.length).map(g => <section key={g.id}><h3>{g.label}</h3><p>{g.description}</p><nav aria-label={`${g.label} routes`}>{g.links.map(l => <a href={l.href} key={l.href}>{l.label}</a>)}</nav></section>)}</div>
      </div>
      <label className="ix-field">
        Find a route
        <input
          aria-label="Find a route"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Leveling, PvP, dungeon, specialization…"
        />
      </label>
      <div className="ix-route-grid">
        {visible.map((p) => (
          <a
            className={`ix-route ix-route--${p.kind}`}
            key={p.slug}
            href={`/${p.slug}`}
          >
            <small>{experienceLabel(p.kind)}</small>
            <h2>{p.h1.replace('WoW Forever ', '')}</h2>
            <p>{p.description}</p>
            <span>
              Explore route <ArrowRight size={16} />
            </span>
          </a>
        ))}
      </div>
      {!visible.length && <p>No route matches that search.</p>}
    </section>
  )
}
function CapSnapshot({ classDef: def, page }: Props) {
  const all = availableBuilds(def),
    builds = page.relatedBuildIds.flatMap(
      (id) => all.find((b) => b.id === id) ?? [],
    ),
    routes = builds.length ? builds : all.filter((b) => b.intent === 'spec')
  return (
    <section className="ix-cap" data-surface="cap-snapshot">
      <div className="ix-cap-stats">
        <div>
          <small>PLANNING LEVEL</small>
          <strong>{def.beta.levelCap}</strong>
        </div>
        <div>
          <small>POINT BUDGET</small>
          <strong>{def.beta.pointsAtCap}</strong>
        </div>
        <div>
          <small>CLIENT SNAPSHOT</small>
          <strong>{def.verifiedBuild}</strong>
        </div>
      </div>
      <p className="ix-note">
        {def.dataReview
          ? 'Level and point budget are preview assumptions, not confirmation of the current live server cap.'
          : def.beta.phaseLabel +
            ' — follow the source notes for availability.'}
      </p>
      <div className="ix-cap-routes">
        {routes.map((b) => (
          <article className="ix-panel" key={b.id}>
            <h2>{def.branchNames[b.spec]}</h2>
            <strong className="ix-allocation">{b.allocation}</strong>
            <p>{b.role}</p>
            <RankList def={def} points={b.build} />
            <EditLink def={def} build={b} />
          </article>
        ))}
      </div>
    </section>
  )
}
export default function ClassIntentExperience(props: Props) {
  const k = props.page.kind
  let body
  if (k === 'buildsHub') body = <Hub {...props} />
  else if (k === 'talents' || k === 'specTalents')
    body = <TalentReference {...props} />
  else if (k === 'leveling' || k === 'specLeveling' || k === 'aoe')
    body = <Progression {...props} />
  else if (k === 'comparison') body = <Comparison {...props} />
  else if (k === 'levelCap') body = <CapSnapshot {...props} />
  else if (k === 'pvp' || k === 'specPvp') body = <PvpPlanner {...props} />
  else if (k === 'dungeon' || k === 'specDungeon') body = <DungeonPlanner {...props} />
  else if (k === 'tank') body = <TankPlanner {...props} />
  else if (k === 'healing') body = <HealingPlanner {...props} />
  else if (k === 'pet') body = <PetPlanner {...props} />
  else if (k === 'totem') body = <TotemPlanner {...props} />
  else body = <BuildWorkbench {...props} />
  return (
    <div className={`intent-experience intent-${k}`} data-experience-kind={k}>
      {body}
      <p className="ix-footnote">
        <Check size={14} /> Editable editorial routes · Source limits remain
        visible · No simulated performance scores
      </p>
    </div>
  )
}
