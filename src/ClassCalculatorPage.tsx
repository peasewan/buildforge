import { experienceEnabled } from './experiences/rollout'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Check, Copy, Lock, Minus, RotateCcw, Shield, Sparkles, Swords } from 'lucide-react'
import SiteFooter from './SiteFooter'
import VerificationBadge from './VerificationBadge'
import type { ClassBuild, ClassDefinition, ClassTalent, PlannerLevel } from './lib/classPage'
import { classPlannerHref } from './lib/classPage'
import type { PlannerBuild, PlannerConfig } from './lib/talentPlanner'
import {
  canIncrementPlannerTalent,
  decodeValidatedPlannerBuild,
  decrementPlannerTalent,
  dominantPlannerBranch,
  encodePlannerBuild,
  incrementPlannerTalent,
  isValidPlannerBuild,
  plannerBranchPoints,
  plannerLockReason,
  totalPlannerPoints,
} from './lib/talentPlanner'
import { track } from './lib/analytics'
import { copyTextToClipboard } from './lib/clipboard'
import { claimBuildCompletion, loadClaimedBuildCompletions, saveClaimedBuildCompletions } from './lib/buildCompletion'
import { usePlannerView } from './lib/usePlannerView'

function defaultLevel<B extends string>(classDef: ClassDefinition<B>): PlannerLevel {
  return classDef.plannerModes[0]?.level ?? (classDef.beta.levelCap as PlannerLevel)
}

function pointCapFor<B extends string>(classDef: ClassDefinition<B>, level: PlannerLevel): number {
  return classDef.plannerModes.find((mode) => mode.level === level)?.points ?? classDef.beta.pointsAtCap
}

function requestedLevel<B extends string>(classDef: ClassDefinition<B>, candidate: number): PlannerLevel | undefined {
  return classDef.plannerModes.find((mode) => mode.level === candidate)?.level
}

function readStoredBuild<B extends string>(classDef: ClassDefinition<B>): { build: PlannerBuild; level: PlannerLevel; notice?: string } {
  if (typeof window === 'undefined') return { build: {}, level: defaultLevel(classDef) }
  const params = new URLSearchParams(window.location.search)
  const level = requestedLevel(classDef, Number(params.get('level'))) ?? defaultLevel(classDef)
  const code = params.get('build')
  const config = { ...classDef.plannerConfig, pointCap: pointCapFor(classDef, level) }
  if (params.has('build')) {
    const build = decodeValidatedPlannerBuild(code ?? '', classDef.talents, config)
    if (build && (!params.has('level') || requestedLevel(classDef, Number(params.get('level'))))) return { build, level }
    return { build: {}, level, notice: 'This shared build is invalid or outdated. Start a new build with the current talent rules.' }
  }
  try {
    const raw = localStorage.getItem(classDef.storageKey)
    if (!raw) return { build: {}, level }
    const stored = JSON.parse(raw) as { build?: PlannerBuild; level?: PlannerLevel }
    if (!stored || typeof stored !== 'object' || Array.isArray(stored) || (stored.level !== undefined && !requestedLevel(classDef, Number(stored.level)))) {
      localStorage.removeItem(classDef.storageKey)
      return { build: {}, level, notice: 'Your saved build is invalid or outdated. Start a new build with the current talent rules.' }
    }
    const storedLevel = requestedLevel(classDef, Number(stored.level)) ?? level
    const saved = stored.build ?? {}
    if (!isValidPlannerBuild(saved, classDef.talents, { ...classDef.plannerConfig, pointCap: pointCapFor(classDef, storedLevel) })) {
      localStorage.removeItem(classDef.storageKey)
      return { build: {}, level, notice: 'Your saved build is invalid or outdated. Start a new build with the current talent rules.' }
    }
    return { build: saved, level: storedLevel }
  } catch {
    try { localStorage.removeItem(classDef.storageKey) } catch { /* Browser storage may be unavailable. */ }
    return { build: {}, level, notice: 'Your saved build is invalid or outdated. Start a new build with the current talent rules.' }
  }
}

function allocationFor<B extends string>(build: PlannerBuild, classDef: ClassDefinition<B>): string {
  return classDef.branches.map((branch) => plannerBranchPoints(build, branch, classDef.talents)).join('/')
}

// One canvas row per talent row, matching the published Warrior tree rhythm (7 rows -> 658px).
const CANVAS_ROW_HEIGHT = 94

/** The canvas must be as tall as the deepest row in the dataset, not as tall as any one fixture. */
function canvasHeightFor<B extends string>(classDef: ClassDefinition<B>): number {
  const rows = classDef.talents.reduce((deepest, talent) => Math.max(deepest, talent.row), 1)
  return rows * CANVAS_ROW_HEIGHT
}

function TalentNode<B extends string>({ talent, build, classDef, config, onAdd, onRemove, onInspect }: {
  talent: ClassTalent<B>
  build: PlannerBuild
  classDef: ClassDefinition<B>
  config: PlannerConfig<B>
  onAdd: () => void
  onRemove: () => void
  onInspect: () => void
}) {
  const rank = build[talent.id] ?? 0
  const reason = plannerLockReason(build, talent, classDef.talents, config)
  const available = canIncrementPlannerTalent(build, talent, classDef.talents, config)
  return <article className={`class-talent ${rank ? 'selected' : ''} ${!available && !rank ? 'locked' : ''}`} data-testid="class-talent" id={talent.id} style={{ left: `${talent.x}%`, top: `${talent.y}%` }}>
    <button className="class-talent-main" type="button" aria-label={`Add rank to ${talent.name}`} disabled={!available} onClick={() => { onAdd(); onInspect() }}>
      {talent.icon ? <img src={talent.icon} alt="" /> : <span className="class-talent-glyph" aria-hidden="true">{talent.name.slice(0, 2)}</span>}
      {!available && !rank && <Lock className="node-lock" size={17} />}
      <span>{rank}/{talent.maxRank}</span>
    </button>
    {rank > 0 && <button className="class-rank-minus" type="button" aria-label={`Remove rank from ${talent.name}`} onClick={() => { onRemove(); onInspect() }}><Minus size={14} /></button>}
    <button className="class-talent-name" type="button" onClick={onInspect}>{talent.name}</button>
    {reason?.type === 'branch-points' && <small>{reason.required} points required</small>}
  </article>
}

/**
 * Class-neutral talent calculator. Every class-specific value comes from `classDef`:
 * branches, talent nodes, planner modes, presets, storage key, planner path and analytics name.
 */
export default function ClassCalculatorPage<B extends string>({ classDef }: { classDef: ClassDefinition<B> }) {
  const [initial] = useState(() => readStoredBuild(classDef))
  const [build, setBuild] = useState<PlannerBuild>(initial.build)
  const [level, setLevel] = useState<PlannerLevel>(initial.level)
  const [selected, setSelected] = useState<ClassTalent<B>>(() => {
    const branch = dominantPlannerBranch(initial.build, classDef.talents, classDef.branches, classDef.branches[0])
    return classDef.talents.find(talent => talent.branch === branch && initial.build[talent.id] > 0)
      ?? classDef.talents.find(talent => talent.branch === branch)
      ?? classDef.talents[0]
  })
  const [copied, setCopied] = useState(false)
  const [manualShareUrl, setManualShareUrl] = useState<string | null>(null)
  const copyRequest = useRef(0)
  const [resetNotice, setResetNotice] = useState<string | null>(initial.notice ?? null)
  const cap = pointCapFor(classDef, level)
  const viewMarker = useRef<HTMLDivElement>(null)
  const treeViewMarker = useRef<HTMLDivElement>(null)
  const completedBuilds = useRef<Set<string> | null>(null)
  if (completedBuilds.current === null) completedBuilds.current = loadClaimedBuildCompletions()
  usePlannerView(viewMarker, classDef.id, level, cap, treeViewMarker)
  const canvasHeight = canvasHeightFor(classDef)
  const config = useMemo<PlannerConfig<B>>(() => ({ ...classDef.plannerConfig, pointCap: cap }), [classDef.plannerConfig, cap])
  const points = totalPlannerPoints(build)
  // Per-rank text is not a property of "having client data", so the trust copy reports the count
  // the class being rendered actually has instead of assuming every node carries it.
  const perRankTextCount = classDef.talents.filter((talent) => talent.rankDescriptions?.some(Boolean)).length
  const activeBranch = dominantPlannerBranch(build, classDef.talents, classDef.branches, classDef.branches[0])
  const calculatorPage = classDef.pages.find((page) => page.kind === 'calculator')
  const heroImage = calculatorPage?.ogImage ?? classDef.ogImage
  const heroStyle = heroImage ? ({ '--class-hero-image': `url("${heroImage}")` } as CSSProperties) : undefined
  const hubPage = classDef.pages.find((page) => page.kind === 'buildsHub') ?? classDef.pages.find((page) => page.kind === 'talents')
  const presets = classDef.recommendedBuildIds
    .map((id) => classDef.builds.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is ClassBuild => Boolean(candidate))

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.has('build') && !window.location.hash) return
    const branch = dominantPlannerBranch(initial.build, classDef.talents, classDef.branches, classDef.branches[0])
    const requested = window.location.hash.slice(1)
    const explicitTarget = requested === 'class-calculator' || requested === 'build-summary' || classDef.branches.some(branch => requested === `tree-${branch}`)
    if (requested && !explicitTarget) return
    const target = explicitTarget ? requested : totalPlannerPoints(initial.build) ? `tree-${branch}` : 'class-calculator'
    ;(document.getElementById(target) ?? document.getElementById('class-calculator'))?.scrollIntoView({ block: 'start', inline: 'nearest' })
  }, [classDef, initial])
  // Only this class's own links: the site-wide class list lives in SiteFooter, which prepends
  // these to it. Nothing here may name another class.
  const footerLinks = classDef.pages
    .filter((page) => page.kind === 'buildsHub' || page.kind === 'talents' || page.kind === 'leveling' || page.kind === 'dungeon')
    .map((page) => ({ href: `/${page.slug}`, label: page.h1 }))
    .concat([{ href: classDef.plannerPath, label: `${classDef.name} Talent Calculator` }])

  const syncSharedRoute = (next: PlannerBuild, nextLevel: PlannerLevel) => {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('build')) return
    url.searchParams.set('build', encodePlannerBuild(next))
    url.searchParams.set('level', String(nextLevel))
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  }

  const commit = (next: PlannerBuild, nextLevel: PlannerLevel = level) => {
    syncSharedRoute(next, nextLevel)
    setBuild(next)
    setResetNotice(null)
    copyRequest.current += 1
    setCopied(false)
    setManualShareUrl(null)
    try {
      localStorage.setItem(classDef.storageKey, JSON.stringify({ build: next, level: nextLevel }))
    } catch {
      // Editing and sharing continue when browser persistence is unavailable.
    }
  }

  const changeLevel = (nextLevel: PlannerLevel) => {
    copyRequest.current += 1
    setCopied(false)
    setManualShareUrl(null)
    setLevel(nextLevel)
    const nextCap = pointCapFor(classDef, nextLevel)
    // Matching the published Warrior rule: lowering the cap below the spent points resets the tree, and says so.
    if (totalPlannerPoints(build) > nextCap) {
      commit({}, nextLevel)
      setResetNotice(`This allocation needed more than ${nextCap} points, so the tree was reset for Level ${nextLevel}.`)
    } else {
      syncSharedRoute(build, nextLevel)
      setResetNotice(null)
      try {
        localStorage.setItem(classDef.storageKey, JSON.stringify({ build, level: nextLevel }))
      } catch {
        // The chosen mode still applies when browser persistence is unavailable.
      }
    }
    track(`${classDef.analyticsClass}_level_mode`, { level: nextLevel })
  }

  const loadPreset = (preset: ClassBuild) => {
    setLevel(preset.level)
    commit(preset.build, preset.level)
    setResetNotice(null)
    const branch = dominantPlannerBranch(preset.build, classDef.talents, classDef.branches, classDef.branches[0])
    setSelected(classDef.talents.find(talent => talent.branch === branch && preset.build[talent.id] > 0) ?? classDef.talents[0])
    document.getElementById(`tree-${branch}`)?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
    track(`${classDef.analyticsClass}_preset_load`, { preset: preset.id })
  }

  const startBlank = () => {
    const url = new URL(window.location.href)
    if (points > 0 && !url.searchParams.has('build')) {
      url.searchParams.set('build', '')
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
    }
    commit({})
    setResetNotice(null)
    track('calculator_start_blank', { class: classDef.id, page_path: window.location.pathname, level })
  }

  const copyBuild = async () => {
    if (!points) return
    const url = new URL(classPlannerHref(classDef, encodePlannerBuild(build), level), window.location.origin)
    url.hash = points ? `tree-${activeBranch}` : 'class-calculator'
    const request = ++copyRequest.current
    const didCopy = await copyTextToClipboard(url.toString())
    if (request !== copyRequest.current) return
    setCopied(didCopy)
    setManualShareUrl(didCopy ? null : url.toString())
    if (!didCopy) return
    track('build_copy', { class: classDef.id, page_path: window.location.pathname, level, point_cap: cap, points, branch: String(activeBranch) })
    track(`${classDef.analyticsClass}_build_copy`, { level, points, specialization: String(activeBranch) })
    window.setTimeout(() => { if (request === copyRequest.current) setCopied(false) }, 1600)
  }

  return <main className="class-page class-calculator-page" data-class={classDef.id} data-intent-calculator={experienceEnabled(classDef.plannerPath) ? "true" : undefined} data-client-preview={classDef.dataReview ? 'true' : undefined}>
    <header className="class-nav shell">
      <a className="class-brand" href="/"><Swords /><span>BUILD<b>FORGE</b></span></a>
      <nav aria-label={`${classDef.name} pages`}>
        <a href={classDef.plannerPath}>{classDef.name} Calculator</a>
        {hubPage && <a href={`/${hubPage.slug}`}>{hubPage.h1}</a>}
      </nav>
    </header>

    <section className="class-hero" style={heroStyle}>
      <div className="shell class-hero-grid">
        <div>
          <p className="class-kicker">{classDef.beta.phaseLabel} · {classDef.talentCount} verified nodes</p>
          <h1>{calculatorPage?.h1 ?? `${classDef.name} Talent Calculator`}</h1>
          <p>{calculatorPage?.description ?? `Plan ${classDef.name} talents from versioned client data.`}</p>
          <div className="class-hero-actions">
            <a className="button class-primary" href="#class-calculator">Start building</a>
            {hubPage && <a className="button ghost" href={`/${hubPage.slug}`}>View {classDef.name} pages</a>}
          </div>
        </div>
        <aside>
          <strong>Current planner</strong>
          <span>{classDef.branchNames[activeBranch]} {classDef.name}</span>
          <b>{points} / {cap}</b>
          <small>Talent points spent</small>
          <p>Client data reviewed through {classDef.verifiedBuild}</p>
          <div className="class-evidence">
            <p><span>Talent data</span><VerificationBadge status="client_verified" /></p>
            <p><span>Build</span><span className="class-build-chip">Community / Editorial Build</span></p>
          </div>
        </aside>
      </div>
    </section>

    <section className="shell class-calculator" id="class-calculator">
      <div className="class-toolbar" ref={viewMarker}>
        <div><p className="class-kicker">Interactive talent trees</p><h2>Build Your {classDef.name}</h2></div>
        <div className="class-levels" aria-label="Planner level">
          {classDef.plannerModes.map((mode) => <button className={level === mode.level ? 'active' : ''} type="button" key={mode.level} onClick={() => changeLevel(mode.level)}>{mode.label}<small>{mode.points} points</small></button>)}
        </div>
      </div>

      {classDef.dataReview && <p className="class-reset-notice">Client-table preview. Tier unlocks and this eleven-point budget are planning assumptions; see data coverage below.</p>}
      {resetNotice && <p className="class-reset-notice" role="status">{resetNotice}</p>}

      <div className="class-presets" data-testid="class-presets">
        <span>Recommended builds</span>
        <span className="class-build-chip">Community / Editorial Build</span>
        {presets.map((preset) => <button type="button" key={preset.id} aria-label={`Load ${preset.shortTitle}`} onClick={() => loadPreset(preset)}>{preset.shortTitle}<small>{preset.allocation}</small></button>)}
      </div>

      {experienceEnabled(classDef.plannerPath) && <nav className="ix-calculator-nav" aria-label="Jump to specialization"><span>Jump to tree</span>{classDef.branches.map(b => <a key={b} href={`#tree-${b}`}>{classDef.branchNames[b]} · {plannerBranchPoints(build,b,classDef.talents)} points</a>)}<a href="#build-summary">Review &amp; share</a></nav>}
      <div className={points >= cap ? 'class-tree-grid has-full-route' : 'class-tree-grid'} ref={treeViewMarker}>
        {classDef.branches.map((branch) => <section className={`class-tree ${branch}`} id={experienceEnabled(classDef.plannerPath) ? `tree-${branch}` : undefined} key={branch}>
          <header>
            <div><Sparkles size={18} /><h3>{classDef.branchNames[branch]}</h3></div>
            <b>{plannerBranchPoints(build, branch, classDef.talents)}</b>
            <p>{classDef.branchTaglines[branch]}</p>
            {branch === activeBranch && points >= cap && <div className="class-full-route" role="status">
              <span>This Level {level} route uses all {cap} points. Remove a rank before adding a different talent, or start a blank build.</span>
              <button type="button" onClick={startBlank}>Start blank build</button>
            </div>}
          </header>
          <div className="class-tree-canvas" data-testid="class-tree-canvas" style={{ height: `${canvasHeight}px`, backgroundSize: `100% ${CANVAS_ROW_HEIGHT}px, 25% 100%` }}>
            {classDef.talents.filter((talent) => talent.branch === branch).map((talent) => <TalentNode
              key={talent.id}
              talent={talent}
              build={build}
              classDef={classDef}
              config={config}
              onInspect={() => setSelected(talent)}
              onAdd={() => {
                const next = incrementPlannerTalent(build, talent, classDef.talents, config)
                if (next !== build) {
                  commit(next)
                  track('talent_click', { class: classDef.analyticsClass, talent: talent.id, rank: next[talent.id] ?? 0 })
                  if (claimBuildCompletion(build, next, completedBuilds.current!, { classId: classDef.id, level, pointCap: cap })) {
                    saveClaimedBuildCompletions(completedBuilds.current!)
                    track('build_complete', {
                      class: classDef.id, page_path: window.location.pathname,
                      level, point_cap: cap, points: totalPlannerPoints(next),
                      branch: String(dominantPlannerBranch(next, classDef.talents, classDef.branches, classDef.branches[0])),
                      selected_talents: Object.values(next).filter(rank => rank > 0).length,
                      completion_source: 'manual',
                    })
                  }
                }
              }}
              onRemove={() => commit(decrementPlannerTalent(build, talent, classDef.talents))}
            />)}
          </div>
        </section>)}
      </div>

      <div className="class-summary" id={experienceEnabled(classDef.plannerPath) ? "build-summary" : undefined}>
        <article>
          <p className="class-kicker">Selected talent</p>
          <div className="class-detail-title">
            <div><h3>{selected.name}</h3><span>{classDef.branchNames[selected.branch]} · Tier {selected.row} · {selected.maxRank} rank{selected.maxRank === 1 ? '' : 's'}</span></div>
          </div>
          <p>{selected.rankDescriptions?.[Math.max(1, build[selected.id] ?? 0) - 1] || selected.description || selected.name}</p>
          {classDef.dataReview && <>
            <p><small>Talent ID {selected.nodeId} · Rank spell IDs: {selected.spellIds?.join(', ')}</small></p>
            <p className="class-talent-evidence"><span>Rank tooltip</span>{selected.rankDescriptions?.[Math.max(1, build[selected.id] ?? 0) - 1] ? <VerificationBadge status="client_datamined" /> : <small>Not available for this rank</small>}</p>
            {selected.dataNotes?.map((note) => <p key={note}><small>{note}</small></p>)}
            {selected.sources.map((source) => <a className="class-source-link" key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}</a>)}
          </>}
          <p className="class-talent-evidence"><span>Talent data</span><VerificationBadge status={selected.verificationStatus} /></p>
          <small>Client record {selected.sourceClientBuild}; verified through {selected.verifiedThroughBuild}.{selected.prerequisiteRuleStatus === 'derived_assumption' ? ' Prerequisite rank rules are derived assumptions.' : ''}</small>
        </article>
        <aside>
          <span>Current build</span>
          <strong>{allocationFor(build, classDef)}</strong>
          <p>{classDef.branchNames[activeBranch]} {classDef.name} · Level {level}</p>
          <div className="class-summary-actions">
            <button type="button" onClick={startBlank}><RotateCcw size={15} /> Reset</button>
            <button type="button" aria-label="Copy build link" disabled={!points} onClick={copyBuild}><Copy size={15} /> {copied ? 'Copied' : 'Copy build link'}</button>
          </div>
          <div className="class-progress"><i style={{ width: `${Math.min(100, (points / cap) * 100)}%` }} /></div>
          <small>{points} / {cap}</small>
          {manualShareUrl && <div className="pvp-manual-share"><p role="status">Clipboard access was unavailable. Select and copy this link manually.</p><label htmlFor={`${classDef.id}-manual-share`}>Build link for manual copy</label><input id={`${classDef.id}-manual-share`} readOnly value={manualShareUrl} onFocus={(event) => event.currentTarget.select()} /></div>}
        </aside>
      </div>
    </section>

    {classDef.dataReview && <section className="shell class-data-review"><h2>Data coverage and planning rules</h2><p>{classDef.dataReview.notice}</p><ul>{classDef.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul></section>}

    <section className="shell class-trust">
      <div><Check /><h2>Versioned client data</h2><p>{classDef.talentCount} {classDef.name} nodes carry client build tags, coordinates and source records; {perRankTextCount} of {classDef.talentCount} also carry per-rank text.</p></div>
      <div><Shield /><h2>Clear evidence labels</h2><p>Client fields and editorial build recommendations stay visibly separate on every surface.</p></div>
      <div><Swords /><h2>Build links that persist</h2><p>Share the exact talent ranks and point budget through {classDef.plannerPath} without creating indexable duplicates.</p></div>
    </section>

    <SiteFooter discovery classLinks={footerLinks} />
  </main>
}
