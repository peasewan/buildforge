import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Clipboard, LockKeyhole, Minus, RotateCcw, Sparkles, UsersRound } from 'lucide-react'
import { EXAMPLE_BUILDS } from './data/builds'
import { BUILD_LANDING_PAGES } from './data/buildLandingPages'
import BuildCard from './BuildCard'
import { PALADIN_BETA_SNAPSHOT } from './data/betaSnapshot'
import { PALADIN_BETA_STATUS } from './data/betaStatus'
import { BETA_SPEC_PATHS } from './data/betaSpecPaths'
import { branchNames, branchTaglines, DATA_SOURCES, talentEvidenceLabel, talents, type Talent } from './data/talents'
import { betaDataset } from './data/datasets'
import { BRANCHES, MAX_TALENT_POINTS, branchPoints, canIncrement, decrementTalent, dominantBranch, encodeBuild, getTalentLockReason, incrementTalent, totalPoints, type Branch, type Build, type TalentLockReason } from './lib/build'
import { decodeValidatedPlannerBuild } from './lib/talentPlanner'
import { claimBuildCompletion, loadClaimedBuildCompletions, saveClaimedBuildCompletions } from './lib/buildCompletion'
import { reportSharedBuild, track } from './lib/analytics'
import { copyTextToClipboard } from './lib/clipboard'
import { usePlannerView } from './lib/usePlannerView'
import SiteFooter from './SiteFooter'
import BetaDataStatus from './BetaDataStatus'
import VerificationBadge from './VerificationBadge'
import ForgePilotPanel from './ForgePilotPanel'

const branchIcons: Record<Branch, string> = {
  holy: '/images/icons/holy-strike.png',
  protection: '/images/icons/shield.png',
  retribution: '/images/icons/hammer.png',
}

const branchMax = (branch: Branch) => talents.filter((talent) => talent.branch === branch).reduce((sum, talent) => sum + talent.maxRank, 0)

const OFFICIAL_OCTOBER_TALENT_NOTES: Record<string, string> = {
  Redoubt: 'Blizzard changed Redoubt to 4/8/12/16/20% Block chance on October 1. The rank text below is from the older 69913 client snapshot.',
  'Holy Shield': 'Blizzard changed Holy Shield to 30% Block chance on October 1. The rank text below is from the older 69913 client snapshot.',
  'Champion of the Light': 'Blizzard changed the Intellect-to-Spell-Damage ratio to 20/40/60% on October 1 and corrected a Healing tooltip error. The rank text below is from the older 69913 client snapshot.',
}

function initialPlannerState(): { build: Build; restored: boolean; forgePilotLevel: number | null; notice?: string } {
  if (typeof window === 'undefined') return { build: {}, restored: false, forgePilotLevel: null }
  const params = new URLSearchParams(window.location.search)
  const shared = params.get('id')
  const config = { branches: BRANCHES, pointCap: MAX_TALENT_POINTS }
  if (params.has('id')) {
    const build = decodeValidatedPlannerBuild(shared ?? '', talents, config)
    if (!build) return { build: {}, restored: false, forgePilotLevel: null, notice: 'This shared build is invalid or outdated. Start a new build with the current talent rules.' }
    const requestedLevel = Number(params.get('level'))
    const forgePilotLevel = requestedLevel === 20 && totalPoints(build) <= 11 ? 20
      : requestedLevel === 60 ? 60 : null
    return { build, restored: false, forgePilotLevel }
  }
  try {
    const code = localStorage.getItem('wow-forever-paladin-build') ?? ''
    const build = decodeValidatedPlannerBuild(code, talents, config)
    if (!build) {
      localStorage.removeItem('wow-forever-paladin-build')
      return { build: {}, restored: false, forgePilotLevel: null, notice: 'Your saved build is invalid or outdated. Start a new build with the current talent rules.' }
    }
    return { build, restored: totalPoints(build) > 0, forgePilotLevel: null }
  } catch {
    return { build: {}, restored: false, forgePilotLevel: null, notice: 'Your saved build could not be loaded. Start a new build with the current talent rules.' }
  }
}

type TalentTreeProps = { branch: Branch; build: Build } & (
  | { readOnly: true; onAdd?: never; onRemove?: never }
  | { readOnly?: false; onAdd: (talent: Talent) => void; onRemove?: (talent: Talent) => void }
)

export function TalentTree({ branch, build, onAdd, onRemove, readOnly = false }: TalentTreeProps) {
  const branchTalents = talents.filter((talent) => talent.branch === branch)
  const spentInBranch = branchPoints(build, branch, talents)
  const [feedbackTalentId, setFeedbackTalentId] = useState<string | null>(null)

  const lockMessage = (reason: TalentLockReason) => {
    if (reason.type === 'removed-official') return 'Removed by the September 24 Beta update. This historical client node cannot be added to a current build.'
    if (reason.type === 'pending-client-review') return 'A 70009 client diff reports this talent removed, but its node identity is under review. This historical 69913 node cannot be added to a current build.'
    if (reason.type === 'point-cap') return 'All 51 talent points are already spent.'
    if (reason.type === 'branch-points') {
      return `Requires ${reason.required} points in ${branchNames[branch]} (${reason.current}/${reason.required}).`
    }
    const prerequisite = talents.find((candidate) => candidate.id === reason.talentId)
    return `Requires ${prerequisite?.name ?? 'the prerequisite talent'} at rank ${reason.required} (${reason.current}/${reason.required}).`
  }

  return (
    <div className="tree-stage" aria-label={`${branchNames[branch]} talent tree`}>
      <div className="tree-watermark">{branchNames[branch]}</div>
      <svg className="tree-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {branchTalents.flatMap((talent) =>
          (talent.prerequisite ?? []).map((requirement) => {
            const prerequisite = talents.find((candidate) => candidate.id === requirement.talentId)
            if (!prerequisite) return null
            return <line key={`${talent.id}-${requirement.talentId}`} x1={prerequisite.x} y1={prerequisite.y} x2={talent.x} y2={talent.y} />
          })
        )}
      </svg>
      {branchTalents.map((talent) => {
        const rank = build[talent.id] ?? 0
        const canAdd = canIncrement(build, talent, talents)
        const unlocked = canAdd || rank > 0
        const lockReason = rank === 0 ? getTalentLockReason(build, talent, talents) : null
        const startingChoice = spentInBranch === 0 && talent.requiredTreePoints === 0 && rank === 0
        const displayedRank = Math.max(1, rank)
        const rankDescription = talent.rankDescriptions?.[displayedRank - 1] ?? talent.description
        const matchingBuilds = EXAMPLE_BUILDS.filter((example) => (example.build[talent.id] ?? 0) > 0)
        const label = `${talent.name}, rank ${rank} of ${talent.maxRank}${unlocked ? '' : ', locked'}`
        const nodeContents = <>
          <img src={talent.icon} alt="" />
          {!unlocked && <LockKeyhole size={17} className="lock-icon" />}
          {lockReason?.type === 'branch-points' && <span className="lock-requirement">{lockReason.required} pts</span>}
          {lockReason?.type === 'prerequisite' && <span className="lock-requirement">Prereq</span>}
          {startingChoice && !readOnly && <span className="start-here">Start here</span>}
          <span className="rank">{rank}/{talent.maxRank}</span>
        </>
        const nodeClass = `talent-node ${rank ? 'selected' : ''} ${unlocked ? 'available' : 'locked'} ${startingChoice && !readOnly ? 'starting-choice' : ''}`
        return (
          <div className="talent-position" style={{ left: `${talent.x}%`, top: `${talent.y}%` }} key={talent.id}>
            {readOnly
              ? <span className={`${nodeClass} read-only`} role="img" tabIndex={0} aria-label={label} aria-describedby={`tip-${talent.id}`}>{nodeContents}</span>
              : <button className={nodeClass} onClick={() => { if (lockReason) setFeedbackTalentId(talent.id); else onAdd?.(talent) }} aria-label={label} aria-describedby={`tip-${talent.id}`}>{nodeContents}</button>}
            {rank > 0 && onRemove && !readOnly && <button className="rank-minus" onClick={() => onRemove(talent)} aria-label={`Remove one rank from ${talent.name}`}><Minus size={12} /></button>}
            <div className="talent-tip" id={`tip-${talent.id}`}>
              <strong>{talent.name}</strong>
              {OFFICIAL_OCTOBER_TALENT_NOTES[talent.name] && <span className="talent-october-notice">{OFFICIAL_OCTOBER_TALENT_NOTES[talent.name]} <a href={PALADIN_BETA_STATUS.levelCapSource} target="_blank" rel="noreferrer">Official update</a></span>}
              <span>{rankDescription}</span>
              {lockReason && <span className="talent-lock-message" role={feedbackTalentId === talent.id ? 'status' : undefined}>{lockMessage(lockReason)}</span>}
              <em>
                <span>{talentEvidenceLabel(talent)}</span>
                <VerificationBadge status={OFFICIAL_OCTOBER_TALENT_NOTES[talent.name] || talent.currentBetaAvailability === 'reported_removed_under_review' ? 'needs_review' : 'client_verified'} />
                {talent.prerequisite?.length ? <span className="verification-inline">Prerequisite link <VerificationBadge status="client_verified" /> Required rank <VerificationBadge status="derived_assumption" /></span> : null}
                <span className="talent-sources">
                  Sources:{' '}
                  {talent.sources.map((source, index) => (
                    <span key={`${talent.id}-${source.type}-${index}`}>
                      {index > 0 && ', '}
                      {source.url ? (
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {source.label}
                        </a>
                      ) : (
                        source.label
                      )}
                    </span>
                  ))}
                </span>
              </em>
              <div className="talent-builds">
                <b>Builds using this talent</b>
                {matchingBuilds.length ? matchingBuilds.map((example) => (
                  <a key={example.id} href={`/${example.slug}`} aria-label={`Open build example ${example.allocation}`} onClick={() => track('talent_build_click', { talent_id: talent.id, build_id: example.id })}>
                    {example.name} <small>{example.allocation}{'reviewStatus' in example && example.reviewStatus === 'under_review' ? ' · Under review' : ''}</small>
                  </a>
                )) : <span>No published example yet</span>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function App() {
  const [initialPlanner] = useState(initialPlannerState)
  const [branch, setBranch] = useState<Branch>(() => dominantBranch(initialPlanner.build, talents, 'holy'))
  const [build, setBuild] = useState<Build>(initialPlanner.build)
  const [forgePilotLevel, setForgePilotLevel] = useState<number | null>(initialPlanner.forgePilotLevel)
  const [showSavedBuild, setShowSavedBuild] = useState(initialPlanner.restored)
  const [restoreNotice, setRestoreNotice] = useState(initialPlanner.notice ?? null)
  const [copied, setCopied] = useState(false)
  const [manualShareUrl, setManualShareUrl] = useState<string | null>(null)
  const copyRequest = useRef(0)
  const viewMarker = useRef<HTMLDivElement>(null)
  const calculatorRef = useRef<HTMLDivElement>(null)
  const completedBuildsRef = useRef<Set<string> | null>(null)
  if (completedBuildsRef.current === null) completedBuildsRef.current = loadClaimedBuildCompletions()
  const points = totalPoints(build)
  const selected = useMemo(() => talents.filter((talent) => (build[talent.id] ?? 0) > 0), [build])
  const currentBranch = dominantBranch(build, talents, branch)

  useEffect(() => {
    try {
      localStorage.setItem('wow-forever-paladin-build', encodeBuild(build))
    } catch {
      // The calculator remains editable when browser storage is unavailable.
    }
  }, [build])

  useEffect(() => {
    if (window.location.hash === '#calculator') {
      calculatorRef.current?.scrollIntoView({ block: 'start' })
    }
  }, [])

  usePlannerView(viewMarker, 'paladin', 60, 51)

  const replaceBuild = (next: Build) => {
    const url = new URL(window.location.href)
    if (url.searchParams.has('id')) {
      url.searchParams.set('id', encodeBuild(next))
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
    }
    copyRequest.current += 1
    setCopied(false)
    setManualShareUrl(null)
    setRestoreNotice(null)
    setBuild(next)
    if (totalPoints(next) > 11) setForgePilotLevel((previous) => previous === 20 ? null : previous)
  }

  const openTool = (nextBranch?: Branch, placement = 'hero') => {
    track('calculator_open', { class: 'paladin', page_path: window.location.pathname, target_path: '/paladin', placement })
    if (nextBranch) {
      setBranch(nextBranch)
      track('spec_select', { branch: nextBranch })
    }
    calculatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const startNewBuild = () => {
    track('start_new_build', { previous_points: points })
    replaceBuild({})
    setForgePilotLevel(null)
    setShowSavedBuild(false)
    setCopied(false)
    window.history.replaceState({}, '', '/paladin#calculator')
  }

  const copyBuild = async () => {
    const pagePath = window.location.pathname
    const code = encodeBuild(build)
    const isLevel20Path = forgePilotLevel === 20 && points <= 11
    const path = `/build?id=${code}${isLevel20Path ? '&level=20' : ''}#calculator`
    const shareUrl = `${window.location.origin}${path}`
    const request = ++copyRequest.current
    const didCopy = await copyTextToClipboard(shareUrl)
    if (request !== copyRequest.current) return
    setCopied(didCopy)
    setManualShareUrl(didCopy ? null : shareUrl)
    if (!didCopy) return
    window.history.replaceState({}, '', path)
    track('build_copy', {
      class: 'paladin', page_path: pagePath,
      level: isLevel20Path ? 20 : 60,
      point_cap: isLevel20Path ? 11 : 51,
      planner_scope: isLevel20Path ? 'level_20_snapshot' : 'long_term_reference',
      beta_level_cap: 30,
      points, branch: currentBranch,
    })
    track('build_shared', { points })
    void reportSharedBuild(code)
    window.setTimeout(() => { if (request === copyRequest.current) setCopied(false) }, 1800)
  }

  const addTalent = (talent: Talent) => {
    const nextBuild = incrementTalent(build, talent, talents)
    if (nextBuild === build) return
    track('talent_click', { class: 'paladin', talent_id: talent.id, branch: talent.branch, rank: nextBuild[talent.id] ?? 0 })
    if (claimBuildCompletion(build, nextBuild, completedBuildsRef.current!)) {
      saveClaimedBuildCompletions(completedBuildsRef.current!)
      const completedBranch = dominantBranch(nextBuild, talents, talent.branch)
      track('build_complete', {
        class: 'paladin', page_path: window.location.pathname,
        level: 60, point_cap: 51, completion_source: 'manual',
        points: 51,
        branch: completedBranch,
        selected_talents: Object.values(nextBuild).filter(rank => rank > 0).length,
      })
    }
    replaceBuild(nextBuild)
  }

  const loadBetaPath = (nextBranch: Branch) => {
    const path = BETA_SPEC_PATHS[nextBranch]
    if (path.status !== 'current') return
    replaceBuild({ ...path.current.build })
    setForgePilotLevel(20)
    setBranch(nextBranch)
    setShowSavedBuild(false)
    setCopied(false)
    window.history.replaceState({}, '', '/paladin#calculator')
    track('beta_path_load', {
      branch: nextBranch,
      level: path.current.level,
      allocation: path.current.allocation,
    })
    calculatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="/paladin#top"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label="Primary navigation"><a href="/paladin#calculator">Talent Calculator</a><a href="/wow-forever-paladin-build">Paladin Build</a><a href="/wow-forever-paladin-talents">Paladin Talents</a><a href="/wow-forever-paladin-abilities">Abilities</a></nav>
        <button className="nav-cta" onClick={() => openTool(undefined, 'navigation')}>Open Planner</button>
      </header>

      <section className="hero" id="top">
        <div className="hero-image" />
        <div className="hero-shade" />
        <div className="particles" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={14} /> Paladin Talent Tool</div>
            <h1>WoW Forever<br /><span>Paladin Talent</span><br />Calculator</h1>
            <p className="lead">Build Paladin talent trees for Holy, Protection, and Retribution.</p>
            <p className="hero-disclaimer">Live Beta cap: Level 30. This planner can also inspect long-term 51-point references using the older {PALADIN_BETA_SNAPSHOT.clientBuild} client tree; later official changes are marked separately.</p>
            <p className="hero-actions-copy">Preview talents. <span /> Create builds. <span /> Share your setup.</p>
            <div className="button-row"><button className="button primary" onClick={() => openTool()}>Open Talent Calculator</button><button className="button secondary" onClick={() => openTool('holy')}>View Talents <ChevronDown size={16} /></button></div>
          </div>
          <aside className="hud-card">
            <div className="hud-top"><span>Beta Talent Tree</span><i>69913 snapshot</i></div>
            <div className="hud-tabs">{BRANCHES.map((item) => <button key={item} onClick={() => openTool(item)} className={item === branch ? 'active' : ''}>{branchNames[item]}</button>)}</div>
            <div className="hud-emblem"><div className="emblem-rings" /><img src="/images/icons/paladin-shield.png" alt="Paladin shield emblem" /></div>
            <div className="hud-points"><span>Long-term reference points</span><strong>{points} <small>/ 51</small></strong></div>
            <div className="hud-branches">{BRANCHES.map((item) => (
              <div className="hud-branch" key={item}>
                <span>{branchNames[item]}</span>
                <b>{branchPoints(build, item, talents)}<small>/{branchMax(item)}</small></b>
              </div>
            ))}</div>
            <div className="hud-status"><i /> {points ? 'Build in progress' : 'Ready to build'}</div>
            <div className="hud-perks"><span>3 Talent Trees</span><span>Live cap: Level 30</span><span>Shareable Builds</span></div>
          </aside>
        </div>
      </section>

      <BetaDataStatus />

      <section className="spec-section" aria-label="Choose your specialization">
        <div className="shell">
          <h2>WoW Forever Paladin Talents</h2>
          <div className="data-card" role="note">
            <div className="data-card-title">Talent Data</div>
            <p className="data-card-line"><span>✓</span> {talents.length} records imported from the 69913 client snapshot; Improved Holy Strike was later removed and Crusade awaits 70009 review — {DATA_SOURCES.join(', ')}</p>
            <p className="data-card-progress">All three Paladin trees include client coordinates, prerequisite links, rank caps, and every rank tooltip. Required prerequisite ranks are not present in the client tables, so the planner labels its Classic max-rank fallback as an assumption.</p>
            <p className="data-card-progress">{betaDataset.label} · <a href="/wow-forever-paladin-beta-talent-changes">Review Beta changes</a> · <a href="/wow-forever-paladin-abilities">Browse 45 Paladin abilities</a></p>
          </div>
          <p className="spec-cta">Choose your specialization:</p>
          <div className="spec-choices">
            {BRANCHES.map((item) => (
              <button key={item} className="spec-choice" onClick={() => openTool(item, 'content')}>
                <img src={branchIcons[item]} alt="" />
                <span>{branchNames[item]}</span>
                <small>{branchTaglines[item]}</small>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="planner-section" id="planner">
        <div className="shell">
          <div className="section-heading centered"><div className="eyebrow">Interactive Build Planner</div><h2>WoW Forever Paladin Talent Tree</h2><p>Choose Holy, Protection, or Retribution. The live Beta cap is Level 30; the 51-point canvas is a long-term reference based on the older imported tree.</p></div>
          <section className="current-cap-builds" aria-label="Level 20 Beta starting builds">
            <div className="popular-builds-heading"><div><span>Starting routes and historical references</span><h2>Level 20 Beta Starting Builds</h2></div><p>Load an 11-point starting snapshot for the Level 30 Beta, or review why an older allocation was retired. No Level 30 route has been verified yet.</p></div>
            <div className="current-cap-build-grid">
              {BRANCHES.map((item) => {
                const path = BETA_SPEC_PATHS[item]
                return (
                  <article key={item}>
                    <img src={branchIcons[item]} alt="" />
                    <div><span>{branchNames[item]}</span><strong>{path.current.allocation}</strong><small>{path.status === 'archived' ? 'Archived · Improved Holy Strike removed' : path.bestFor[0]}</small></div>
                    {path.status === 'current'
                      ? <button type="button" onClick={() => loadBetaPath(item)} aria-label={`Load ${branchNames[item]} Level ${path.current.level} build`}>Load Level {path.current.level}</button>
                      : <a href="/wow-forever-protection-paladin-leveling-build">Review retired route</a>}
                  </article>
                )
              })}
            </div>
            <p className="current-cap-build-note">Community recommendations, not official or measured best builds. The Protection allocation is archived after the September 24 removal of Improved Holy Strike. Talent data uses client build {PALADIN_BETA_SNAPSHOT.clientBuild}.</p>
          </section>
          <div id="calculator" ref={calculatorRef} className="calculator-entry">
            {restoreNotice && <p className="pvp-edit-notice" role="status">{restoreNotice}</p>}
            {showSavedBuild && <div className="saved-build-notice" role="status"><div><strong>Saved build loaded</strong><span>Your previous talent setup is ready to continue.</span></div><button type="button" onClick={startNewBuild}><RotateCcw size={14} /> Start New Build</button></div>}
            <div className="planner-tabs" ref={viewMarker} role="tablist">{BRANCHES.map((item) => <button key={item} role="tab" aria-selected={branch === item} className={branch === item ? 'active' : ''} onClick={() => { setBranch(item); track('spec_select', { branch: item }) }}><img src={branchIcons[item]} alt="" /><span>{branchNames[item]}<small>{branchPoints(build, item, talents)} points</small></span></button>)}</div>
            <div className="planner-grid">
              <div className="tree-card">
                <div className="panel-heading"><div><span>{branchNames[branch]} Specialization</span><h3>{branchTaglines[branch]}</h3></div><div className="legend"><i className="dot available" /> Available <i className="dot chosen" /> Selected</div></div>
                {points === 51 && <p className="pvp-edit-notice" role="status">This historical 51-point reference is full. Remove a rank with the minus button before adding a different talent.</p>}
                <TalentTree branch={branch} build={build} onAdd={addTalent} onRemove={(talent) => replaceBuild(decrementTalent(build, talent, talents))} />
                <p className="tree-hint">Click a talent to add a rank. Use the small minus button to remove one.</p>
                <a className="pvp-review-link" href="#paladin-build-summary">Review &amp; share this build →</a>
              </div>
              <aside className="summary-card" id="paladin-build-summary">
                <div className="summary-title"><span>Build Summary</span><button onClick={startNewBuild}><RotateCcw size={14} /> Reset</button></div>
                <div className="points-orb"><strong>{points}</strong><span>/ 51</span><small>Long-term reference budget</small></div>
                <p className="share-note">The 21-point Level 30 budget is not enforced by this older 69913 tree. For a Beta draft, stop manually at 21 points and check the marked official changes.</p>
                <div className="current-build"><span>Planner allocation</span><strong>{branchNames[currentBranch]} Paladin</strong><small>{points === 51 ? '51-point reference complete' : `${51 - points} reference points remaining`}</small></div>
                <div className="selected-list"><span>Selected Talents</span>{selected.length ? selected.map((talent) => <button key={talent.id} onClick={() => replaceBuild(decrementTalent(build, talent, talents))}><img src={talent.icon} alt="" /><span>{talent.name}<small>{branchNames[talent.branch]}</small></span><b>{build[talent.id]}/{talent.maxRank}</b></button>) : <div className="empty-selection"><Sparkles size={18} /> Your chosen talents will appear here.</div>}</div>
                <button className="copy-button" disabled={!points} onClick={copyBuild}>{copied ? <Check size={17} /> : <Clipboard size={17} />}{copied ? 'Link copied' : 'Copy Build Link'}</button>
                <ForgePilotPanel classId="paladin" className="Paladin" dataVersion={betaDataset.sourceVersion} level={forgePilotLevel} pointCaps={{ 20: 11, 60: 51 }} points={points} buildCode={encodeBuild(build)} defaultName={`${branchNames[currentBranch]} Paladin build`} talents={talents} config={{ branches: BRANCHES, pointCap: 51 }} />
                <p className="share-note">Creates a link that opens this exact setup.</p>
                {manualShareUrl && <div className="pvp-manual-share"><p role="status">Clipboard access was unavailable. Select and copy this link manually.</p><label htmlFor="paladin-manual-share">Build link for manual copy</label><input id="paladin-manual-share" readOnly value={manualShareUrl} onFocus={(event) => event.currentTarget.select()} /></div>}
              </aside>
            </div>
          </div>
          <section className="popular-builds" aria-label="Community Paladin build examples">
            <div className="popular-builds-heading"><div><span>Published planning examples</span><h2>Community Build Examples</h2></div><p>Review historical 51-point references, then start a blank planner route for the live Level 30 cap.</p></div>
            <div className="popular-build-grid">{EXAMPLE_BUILDS.map((example, index) => (
              <article className="example-build-card" key={example.id}>
                <div className="example-build-icon"><img src={index === 0 ? branchIcons.holy : index === 1 ? branchIcons.protection : branchIcons.retribution} alt="" /></div>
                <div><span>Historical 51-point reference</span><h3><a href={`/${example.slug}`}>{example.name}</a></h3><p>{example.description}</p></div>
                <strong>{example.allocation}<small>Holy / Protection / Retribution</small></strong>
                <a className="example-build-review" href={`/${example.slug}`}>Review historical build</a>
              </article>
            ))}</div>
          </section>
          <section className="build-topic-section" aria-label="Explore Paladin builds">
            <div className="popular-builds-heading"><div><span>More ways to play</span><h2>Explore Paladin Builds</h2></div><p>Plan around leveling, PvP, raids, or Protection dungeon tanking.</p></div>
            <div className="build-topic-grid">{BUILD_LANDING_PAGES.map((page) => <BuildCard compact key={page.id} eyebrow={page.eyebrow} title={page.title.replace('WoW Forever ', '')} description={page.subtitle} href={`/${page.slug}`} icon={page.icon} />)}</div>
            <a className="topic-hub-link" href="/wow-forever-paladin-builds">Browse all Paladin builds <ChevronDown size={15} /></a>
          </section>
        </div>
      </section>

      <section className="data-section" id="data"><div className="shell"><div className="data-intro"><div className="eyebrow">Open about every source</div><h2>Transparent Talent Data</h2><p className="quote">“We don’t guess.<br />We show what we know.”</p></div><div className="status-grid"><article><i className="status green"><Check size={16} /></i><div><h3>Verified</h3><p>Confirmed talent information</p></div></article><article><i className="status amber"><UsersRound size={16} /></i><div><h3>Community Reported</h3><p>Collected from player research</p></div></article><article><i className="status gray"><LockKeyhole size={16} /></i><div><h3>Need Verification</h3><p>Help us improve the database</p></div></article></div></div></section>

      <section className="benefits shell" id="about"><div className="section-heading centered"><div className="eyebrow">Built by BuildForge</div><h2>One Place to Plan, Refine, and Share</h2></div><div className="benefit-grid"><article><img src="/images/icons/shield.png" alt="" /><span>01</span><h3>Plan Your Build</h3><p>Try different talent paths before committing.</p></article><article><img src="/images/icons/hammer.png" alt="" /><span>02</span><h3>Share Builds</h3><p>Create and share your Paladin setup.</p></article><article><img src="/images/icons/paladin-shield.png" alt="" /><span>03</span><h3>Community Driven</h3><p>Improve talent data together.</p></article></div></section>

      <section className="seo-section"><div className="shell seo-grid"><div><div className="eyebrow">The tool, explained</div><h2>WoW Forever Talents Calculator</h2></div><div className="seo-copy"><p>The <strong>wow forever paladin talent calculator</strong> is a focused planning space for players who want to explore a Paladin setup before they commit points in game. Start by choosing Holy, Protection, or Retribution, then select any available talent node. Each click adds one rank, updates the total immediately, and unlocks deeper rows when the branch has enough points. Selected talents are kept in the summary beside the tree, so the shape of the build stays easy to read while you experiment.</p><p>This first release is designed around the simple actions players repeat most: opening the tree, testing a path, changing a few ranks, and sending the result to someone else. The point counter shows progress toward the planner’s 51-point long-term reference limit; the live Beta cap is Level 30, and current-cap allocations need separate review. If a later talent depends on an earlier one, the interface keeps that dependency visible and prevents an invalid allocation. Removing a required rank also clears talents that can no longer stay active, keeping every shared setup consistent.</p><p>When your <strong>wow forever paladin build</strong> is ready, the Copy Build Link button turns the selected ranks into a compact URL. Anyone opening that link sees the same choices without creating an account. The current build is also stored in the browser as you work, making it easier to return and continue after closing the page. Reset clears the planner when you want to start a completely different idea.</p><p>The planner starts from an imported client snapshot of WoW Forever Beta build 1.60.1.69913 for all 52 Paladin talents, including positions, rank limits, prerequisite links, icons, and every rank tooltip. The September 24 official update removed Improved Holy Strike, which remains visible as historical data but cannot receive points in a new build. The client tables do not state how many ranks a prerequisite requires, so the planner applies the Classic max-rank rule and labels that rule as an assumption. BuildForgeTools keeps later official notices separate from a fully imported and reviewed client dataset.</p><p>The goal of this tool is to make <strong>wow forever talents</strong> quick to inspect and easy to discuss. The talent data reflects the imported 69913 snapshot and separately reviewed later changes; examples under review stay visible as history but are not loaded as current recommendations. Use the planner to compare paths, preserve an idea, or give another player a precise starting point for testing.</p></div></div></section>

      <section className="seo-continuation" aria-label="More about the BuildForge talent calculator"><div className="shell"><p>BuildForge keeps every action visible and reversible. A locked node shows that the current branch needs more points or a completed prerequisite. An illuminated node shows a rank already chosen. The summary lists those choices by specialization and lets you remove a rank without hunting for its position in the tree. Because the URL contains only talent identifiers and ranks, it stays compact enough to paste into a chat, forum, or build discussion.</p><p>The planning loop remains open without registration and saves the latest local setup automatically. An optional ForgePilot account adds cloud saves for players who want their named builds on another device. Players can test a Holy core with Protection support, compare a Retribution route, or clear everything and begin again. The structure is ready for new class trees later, while the Paladin calculator remains a clear standalone page for search visitors who want to build immediately.</p></div></section>

      <SiteFooter />
    </main>
  )
}
