import { useState } from 'react'
import {
  ArrowRight,
  Ban,
  Check,
  Search,
  Shield,
  Swords,
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
    <section className="ix-comparison" aria-label="Build comparison">
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
    [level, setLevel] = useState(10)
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
    step = result.steps.find((s) => s.level === current),
    next = result.steps.find((s) => s.level === current + 1)
  const nextTalent = def.talents.find((t) => t.id === next?.talentId),
    points = step?.allocation ?? {}
  return (
    <section className="ix-progression" aria-label="Talent progression">
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
              <span>{next ? `At level ${current + 1}` : 'Route complete'}</span>
              <strong>
                {nextTalent
                  ? `${nextTalent.name} ${next!.rank}/${nextTalent.maxRank}`
                  : 'You have reached this route’s endpoint.'}
              </strong>
            </div>
          </div>
          <p className="ix-note">
            One point per level from 10 is a planner assumption.{' '}
            {result.orderStatus === 'editorial'
              ? 'Uses the recorded editorial point order.'
              : 'Step order is derived from the published allocation, checked for legal prerequisites.'}
          </p>
        </article>
        <article className="ix-panel">
          <h2>Your allocation at level {current}</h2>
          <RankList def={def} points={points} />
          <EditLink
            def={def}
            build={build}
            points={points}
            label="Edit this level in Calculator"
          />
          <p className="ix-note">
            Loads these exact points in the calculator’s Level {build.level}{' '}
            budget; it does not change the live Beta level cap.
          </p>
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
              <strong>{l - 9} points</strong>
              <span>
                {
                  def.talents.find(
                    (t) =>
                      t.id ===
                      result.steps.find((s) => s.level === l)?.talentId,
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
    <section className="ix-workbench">
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
function RoleExperience({ classDef: def, page }: Props) {
  const all = availableBuilds(def),
    pvp = page.kind === 'pvp' || page.kind === 'specPvp',
    roleBuilds = pvp
      ? all.filter(
          (b) =>
            b.intent === 'pvp' &&
            (page.kind !== 'specPvp' || b.spec === page.spec),
        )
      : all.filter(
          (b) =>
            b.id === page.primaryBuildId || page.relatedBuildIds.includes(b.id),
        )
  const [id, setId] = useState(
      roleBuilds.find((b) => b.id === page.primaryBuildId)?.id ??
        roleBuilds[0]?.id,
    ),
    [checked, setChecked] = useState<string[]>([])
  const build = roleBuilds.find((b) => b.id === id),
    baseline = all.find(
      (b) =>
        b.spec === build?.spec && b.intent === 'spec' && b.id !== build?.id,
    )
  if (!build)
    return (
      <section className="ix-panel">
        <h2>What can be planned now</h2>
        <p>
          A role-specific legal allocation has not been published. Review the
          documented limitations below before choosing a supported route.
        </p>
        <ul>
          {all.map((b) => (
            <li key={b.id}>
              <a href={b.href}>{b.title}</a>
            </li>
          ))}
        </ul>
      </section>
    )
  const tools = def.talents.filter((t) => (build.build[t.id] ?? 0) > 0)
  const loadout = ['dungeon', 'specDungeon', 'tank'].includes(page.kind)
  const checklist = (
    <article className="ix-panel ix-role-checklist">
      <h3>{pvp ? 'Encounter checklist' : 'Preparation checklist'}</h3>
      <p className="ix-note">
        Editorial testing notes for this route, not verified encounter results.
      </p>
      <div className="ix-checklist-items">
        {build.playstyle.map((note, i) => (
          <label className="ix-check" key={`${id}-${i}`}>
            <input
              type="checkbox"
              checked={checked.includes(note)}
              onChange={() =>
                setChecked(
                  checked.includes(note)
                    ? checked.filter((n) => n !== note)
                    : [...checked, note],
                )
              }
            />
            <span>{note}</span>
          </label>
        ))}
      </div>
      <p aria-live="polite">
        {checked.length} / {build.playstyle.length} notes reviewed
      </p>
      {!loadout && (
        <>
          <strong className="ix-allocation">{build.allocation}</strong>
          <EditLink def={def} build={build} />
        </>
      )}
    </article>
  )
  const toolkit = (
    <article className="ix-panel ix-role-tools">
      <h3>
        {loadout ? 'Your dungeon toolkit' : 'Talents supporting this setup'}
      </h3>
      {loadout && (
        <div className="ix-loadout-summary">
          <strong className="ix-allocation">{build.allocation}</strong>
          <EditLink def={def} build={build} />
        </div>
      )}
      <div className="ix-tool-grid">
        {tools.map((t) => (
          <div className="ix-tool" key={t.id}>
            <strong>
              {t.name} · {build.build[t.id]}/{t.maxRank}
            </strong>
            <p>
              {t.rankDescriptions?.[(build.build[t.id] ?? 1) - 1] ??
                t.description ??
                'A verified effect description for this rank is not available.'}
            </p>
          </div>
        ))}
      </div>
    </article>
  )
  return (
    <section className={`ix-role ix-role--${page.kind}`}>
      <div className="ix-role-heading">
        {pvp ? <Swords size={30} /> : <Shield size={30} />}
        <div>
          <p className="ix-eyebrow">
            {pvp ? 'ENCOUNTER PLANNING' : 'ROLE PREPARATION'}
          </p>
          <h2>{build.role}</h2>
        </div>
      </div>
      {roleBuilds.length > 1 && (
        <RoutePicker
          label={pvp ? 'PvP route' : 'Role route'}
          builds={roleBuilds}
          value={id!}
          onChange={(v) => {
            setId(v)
            setChecked([])
          }}
        />
      )}
      <div className={loadout ? 'ix-loadout' : 'ix-two'}>
        {loadout ? (
          <>
            {toolkit}
            {checklist}
          </>
        ) : (
          <>
            {checklist}
            {toolkit}
          </>
        )}
      </div>
      {baseline && <DiffTable def={def} left={baseline} right={build} />}
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
        {t.rankDescriptions?.[rank - 1] ??
          'This rank’s tooltip is not available in the reviewed dataset.'}
      </p>
      <div className="ix-record-facts">
        <span>{t.requiredTreePoints} earlier tree points</span>
        <span>Client {t.verifiedThroughBuild}</span>
        <span>Change: {t.changeStatus}</span>
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
      <details>
        <summary>Sources &amp; {used.length} editorial build records</summary>
        <ul>
          {t.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        {used.length ? (
          <>
            <p className="ix-note">
              Published editorial examples, including reused allocations. These
              are not player popularity statistics.
            </p>
            <ul>
              {used.map((b) => (
                <li key={b.id}>
                  <a href={b.href}>{b.title}</a>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>No published example currently selects this talent.</p>
        )}
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
    <section className="ix-reference">
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
    <section className="ix-hub">
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
    <section className="ix-cap">
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
  else if (
    [
      'pvp',
      'specPvp',
      'dungeon',
      'specDungeon',
      'tank',
      'healing',
      'pet',
      'totem',
    ].includes(k)
  )
    body = <RoleExperience {...props} />
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
