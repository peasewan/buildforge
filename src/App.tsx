import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Clipboard, LockKeyhole, Minus, RotateCcw, Sparkles, UsersRound } from 'lucide-react'
import { EXAMPLE_BUILDS, type ExampleBuild } from './data/builds'
import { BUILD_LANDING_PAGES } from './data/buildLandingPages'
import BuildCard from './BuildCard'
import { PALADIN_BETA_SNAPSHOT } from './data/betaSnapshot'
import { branchNames, branchTaglines, DATA_SOURCES, talentEvidenceLabel, talents, type Talent } from './data/talents'
import { betaDataset } from './data/datasets'
import { BRANCHES, branchPoints, canIncrement, decodeBuild, decrementTalent, dominantBranch, encodeBuild, getTalentLockReason, incrementTalent, totalPoints, type Branch, type Build, type TalentLockReason } from './lib/build'
import { claimBuildCompletion, loadClaimedBuildCompletions, saveClaimedBuildCompletions } from './lib/buildCompletion'
import { track } from './lib/analytics'
import SiteFooter from './SiteFooter'
import BetaDataStatus from './BetaDataStatus'
import VerificationBadge from './VerificationBadge'

const branchIcons: Record<Branch, string> = {
  holy: '/images/icons/holy-strike.png',
  protection: '/images/icons/shield.png',
  retribution: '/images/icons/hammer.png',
}

const branchMax = (branch: Branch) => talents.filter((talent) => talent.branch === branch).reduce((sum, talent) => sum + talent.maxRank, 0)

function initialPlannerState(): { build: Build; restored: boolean } {
  const params = new URLSearchParams(window.location.search)
  const shared = params.get('id')
  if (shared) return { build: decodeBuild(shared, talents), restored: false }
  try {
    const build = decodeBuild(localStorage.getItem('wow-forever-paladin-build') ?? '', talents)
    return { build, restored: totalPoints(build) > 0 }
  } catch {
    return { build: {}, restored: false }
  }
}

export function TalentTree({ branch, build, onAdd, onRemove }: { branch: Branch; build: Build; onAdd?: (talent: Talent) => void; onRemove?: (talent: Talent) => void }) {
  const branchTalents = talents.filter((talent) => talent.branch === branch)
  const spentInBranch = branchPoints(build, branch, talents)
  const [feedbackTalentId, setFeedbackTalentId] = useState<string | null>(null)

  const lockMessage = (reason: TalentLockReason) => {
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
        return (
          <div className="talent-position" style={{ left: `${talent.x}%`, top: `${talent.y}%` }} key={talent.id}>
            <button
              className={`talent-node ${rank ? 'selected' : ''} ${unlocked ? 'available' : 'locked'} ${startingChoice ? 'starting-choice' : ''}`}
              onClick={() => {
                if (lockReason) setFeedbackTalentId(talent.id)
                else onAdd?.(talent)
              }}
              aria-label={`${talent.name}, rank ${rank} of ${talent.maxRank}${unlocked ? '' : ', locked'}`}
              aria-describedby={`tip-${talent.id}`}
            >
              <img src={talent.icon} alt="" />
              {!unlocked && <LockKeyhole size={17} className="lock-icon" />}
              {lockReason?.type === 'branch-points' && <span className="lock-requirement">{lockReason.required} pts</span>}
              {lockReason?.type === 'prerequisite' && <span className="lock-requirement">Prereq</span>}
              {startingChoice && <span className="start-here">Start here</span>}
              <span className="rank">{rank}/{talent.maxRank}</span>
            </button>
            {rank > 0 && onRemove && <button className="rank-minus" onClick={() => onRemove(talent)} aria-label={`Remove one rank from ${talent.name}`}><Minus size={12} /></button>}
            <div className="talent-tip" id={`tip-${talent.id}`}>
              <strong>{talent.name}</strong>
              <span>{rankDescription}</span>
              {lockReason && <span className="talent-lock-message" role={feedbackTalentId === talent.id ? 'status' : undefined}>{lockMessage(lockReason)}</span>}
              <em>
                <span>{talentEvidenceLabel(talent)}</span>
                <VerificationBadge status="client_verified" />
                {talent.prerequisite?.length ? <span className="verification-inline">Prerequisite link <VerificationBadge status="client_verified" /> Required rank <VerificationBadge status="derived_assumption" /></span> : null}
                <span className="talent-sources">
                  Sources:{' '}
                  {talent.sources.map((source, index) => (
                    <span key={`${talent.id}-${source.type}`}>
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
                    {example.name} <small>{example.allocation}</small>
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
  const [branch, setBranch] = useState<Branch>('holy')
  const [build, setBuild] = useState<Build>(initialPlanner.build)
  const [showSavedBuild, setShowSavedBuild] = useState(initialPlanner.restored)
  const [copied, setCopied] = useState(false)
  const toolRef = useRef<HTMLElement>(null)
  const calculatorRef = useRef<HTMLDivElement>(null)
  const completedBuildsRef = useRef<Set<string> | null>(null)
  if (completedBuildsRef.current === null) completedBuildsRef.current = loadClaimedBuildCompletions()
  const points = totalPoints(build)
  const selected = useMemo(() => talents.filter((talent) => (build[talent.id] ?? 0) > 0), [build])
  const currentBranch = dominantBranch(build, talents, branch)

  useEffect(() => {
    localStorage.setItem('wow-forever-paladin-build', encodeBuild(build))
  }, [build])

  useEffect(() => {
    if (window.location.hash === '#calculator') {
      calculatorRef.current?.scrollIntoView({ block: 'start' })
    }
  }, [])

  useEffect(() => {
    const node = toolRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    let sent = false
    const observer = new IntersectionObserver((entries) => {
      if (!sent && entries.some((entry) => entry.isIntersecting)) {
        sent = true
        track('view_planner')
        observer.disconnect()
      }
    }, { threshold: 0.15 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const openTool = (nextBranch?: Branch) => {
    if (nextBranch) {
      setBranch(nextBranch)
      track('spec_select', { branch: nextBranch })
    }
    calculatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const startNewBuild = () => {
    track('start_new_build', { previous_points: points })
    setBuild({})
    setShowSavedBuild(false)
    setCopied(false)
    window.history.replaceState({}, '', '/paladin#calculator')
  }

  const copyBuild = async () => {
    track('build_copy', { points })
    const code = encodeBuild(build)
    const path = `/build?id=${code}`
    window.history.replaceState({}, '', path)
    const shareUrl = `${window.location.origin}${path}`
    let didCopy: boolean
    try {
      await navigator.clipboard.writeText(shareUrl)
      didCopy = true
    } catch {
      const field = document.createElement('textarea')
      field.value = shareUrl
      field.setAttribute('readonly', '')
      field.style.position = 'fixed'
      field.style.opacity = '0'
      document.body.appendChild(field)
      field.select()
      didCopy = document.execCommand('copy')
      field.remove()
    }
    if (didCopy) track('build_shared', { points })
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const addTalent = (talent: Talent) => {
    track('talent_click', { talent_id: talent.id, branch: talent.branch })
    const nextBuild = incrementTalent(build, talent, talents)
    if (claimBuildCompletion(build, nextBuild, completedBuildsRef.current!)) {
      saveClaimedBuildCompletions(completedBuildsRef.current!)
      const completedBranch = dominantBranch(nextBuild, talents, talent.branch)
      track('build_complete', {
        points: 51,
        branch: completedBranch,
        selected_talents: Object.keys(nextBuild).length,
      })
    }
    setBuild(nextBuild)
  }

  const loadExampleBuild = (example: ExampleBuild) => {
    setBuild({ ...example.build })
    setBranch(dominantBranch(example.build, talents, 'holy'))
    setShowSavedBuild(false)
    setCopied(false)
    window.history.replaceState({}, '', '/paladin#calculator')
    track('example_build_load', {
      build_id: example.id,
      allocation: example.allocation,
    })
    calculatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="/paladin#top"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label="Primary navigation"><a href="/paladin#calculator">Talent Calculator</a><a href="/wow-forever-paladin-build">Paladin Build</a><a href="/wow-forever-paladin-talents">Paladin Talents</a></nav>
        <button className="nav-cta" onClick={() => openTool()}>Open Planner</button>
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
            <p className="hero-disclaimer">Beta talent planner for client build {PALADIN_BETA_SNAPSHOT.clientBuild}. Values may change during testing.</p>
            <p className="hero-actions-copy">Preview talents. <span /> Create builds. <span /> Share your setup.</p>
            <div className="button-row"><button className="button primary" onClick={() => openTool()}>Open Talent Calculator</button><button className="button secondary" onClick={() => openTool('holy')}>View Talents <ChevronDown size={16} /></button></div>
          </div>
          <aside className="hud-card">
            <div className="hud-top"><span>Beta Talent Tree</span><i>Live</i></div>
            <div className="hud-tabs">{BRANCHES.map((item) => <button key={item} onClick={() => openTool(item)} className={item === branch ? 'active' : ''}>{branchNames[item]}</button>)}</div>
            <div className="hud-emblem"><div className="emblem-rings" /><img src="/images/icons/paladin-shield.png" alt="Paladin shield emblem" /></div>
            <div className="hud-points"><span>Talent Points</span><strong>{points} <small>/ 51</small></strong></div>
            <div className="hud-branches">{BRANCHES.map((item) => (
              <div className="hud-branch" key={item}>
                <span>{branchNames[item]}</span>
                <b>{branchPoints(build, item, talents)}<small>/{branchMax(item)}</small></b>
              </div>
            ))}</div>
            <div className="hud-status"><i /> {points ? 'Build in progress' : 'Ready to build'}</div>
            <div className="hud-perks"><span>3 Talent Trees</span><span>51 Points Available</span><span>Shareable Builds</span></div>
          </aside>
        </div>
      </section>

      <BetaDataStatus />

      <section className="spec-section" aria-label="Choose your specialization">
        <div className="shell">
          <h2>WoW Forever Paladin Talents</h2>
          <div className="data-card" role="note">
            <div className="data-card-title">Talent Data</div>
            <p className="data-card-line"><span>✓</span> {talents.length} Beta talent nodes verified — {DATA_SOURCES.join(', ')}</p>
            <p className="data-card-progress">All three Paladin trees include client coordinates, prerequisite links, rank caps, and every rank tooltip. Required prerequisite ranks are not present in the client tables, so the planner labels its Classic max-rank fallback as an assumption.</p>
            <p className="data-card-progress">{betaDataset.label} · <a href="/wow-forever-paladin-beta-talent-changes">Review Beta changes</a></p>
          </div>
          <p className="spec-cta">Choose your specialization:</p>
          <div className="spec-choices">
            {BRANCHES.map((item) => (
              <button key={item} className="spec-choice" onClick={() => openTool(item)}>
                <img src={branchIcons[item]} alt="" />
                <span>{branchNames[item]}</span>
                <small>{branchTaglines[item]}</small>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="planner-section" id="planner" ref={toolRef}>
        <div className="shell">
          <div className="section-heading centered"><div className="eyebrow">Interactive Build Planner</div><h2>WoW Forever Paladin Talent Tree</h2><p>Choose Holy, Protection, or Retribution, spend all 51 points, and shape a build worth sharing.</p></div>
          <div id="calculator" ref={calculatorRef} className="calculator-entry">
            {showSavedBuild && <div className="saved-build-notice" role="status"><div><strong>Saved build loaded</strong><span>Your previous talent setup is ready to continue.</span></div><button type="button" onClick={startNewBuild}><RotateCcw size={14} /> Start New Build</button></div>}
            <div className="planner-tabs" role="tablist">{BRANCHES.map((item) => <button key={item} role="tab" aria-selected={branch === item} className={branch === item ? 'active' : ''} onClick={() => { setBranch(item); track('spec_select', { branch: item }) }}><img src={branchIcons[item]} alt="" /><span>{branchNames[item]}<small>{branchPoints(build, item, talents)} points</small></span></button>)}</div>
            <div className="planner-grid">
              <div className="tree-card">
                <div className="panel-heading"><div><span>{branchNames[branch]} Specialization</span><h3>{branchTaglines[branch]}</h3></div><div className="legend"><i className="dot available" /> Available <i className="dot chosen" /> Selected</div></div>
                <TalentTree branch={branch} build={build} onAdd={addTalent} onRemove={(talent) => setBuild((current) => decrementTalent(current, talent, talents))} />
                <p className="tree-hint">Click a talent to add a rank. Use the small minus button to remove one.</p>
              </div>
              <aside className="summary-card">
                <div className="summary-title"><span>Build Summary</span><button onClick={startNewBuild}><RotateCcw size={14} /> Reset</button></div>
                <div className="points-orb"><strong>{points}</strong><span>/ 51</span><small>Talent Points</small></div>
                <div className="current-build"><span>Current Build</span><strong>{branchNames[currentBranch]} Paladin</strong><small>{points === 51 ? 'Build complete' : `${51 - points} points remaining`}</small></div>
                <div className="selected-list"><span>Selected Talents</span>{selected.length ? selected.map((talent) => <button key={talent.id} onClick={() => setBuild((current) => decrementTalent(current, talent, talents))}><img src={talent.icon} alt="" /><span>{talent.name}<small>{branchNames[talent.branch]}</small></span><b>{build[talent.id]}/{talent.maxRank}</b></button>) : <div className="empty-selection"><Sparkles size={18} /> Your chosen talents will appear here.</div>}</div>
                <button className="copy-button" disabled={!points} onClick={copyBuild}>{copied ? <Check size={17} /> : <Clipboard size={17} />}{copied ? 'Link copied' : 'Copy Build Link'}</button>
                <p className="share-note">Creates a link that opens this exact setup.</p>
              </aside>
            </div>
          </div>
          <section className="popular-builds" aria-label="Popular Paladin builds">
            <div className="popular-builds-heading"><div><span>Community build examples</span><h2>Popular Paladin Builds</h2></div><p>Open a complete build page or load all 51 points into the calculator.</p></div>
            <div className="popular-build-grid">{EXAMPLE_BUILDS.map((example, index) => (
              <article className="example-build-card" key={example.id}>
                <div className="example-build-icon"><img src={index === 0 ? branchIcons.holy : index === 1 ? branchIcons.protection : branchIcons.retribution} alt="" /></div>
                <div><span>Example build</span><h3><a href={`/${example.slug}`}>{example.name}</a></h3><p>{example.description}</p></div>
                <strong>{example.allocation}<small>Holy / Protection / Retribution</small></strong>
                <button type="button" onClick={() => loadExampleBuild(example)}>Load Build</button>
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

      <section className="seo-section"><div className="shell seo-grid"><div><div className="eyebrow">The tool, explained</div><h2>WoW Forever Talents Calculator</h2></div><div className="seo-copy"><p>The <strong>wow forever paladin talent calculator</strong> is a focused planning space for players who want to explore a Paladin setup before they commit points in game. Start by choosing Holy, Protection, or Retribution, then select any available talent node. Each click adds one rank, updates the total immediately, and unlocks deeper rows when the branch has enough points. Selected talents are kept in the summary beside the tree, so the shape of the build stays easy to read while you experiment.</p><p>This first release is designed around the simple actions players repeat most: opening the tree, testing a path, changing a few ranks, and sending the result to someone else. The point counter tracks progress toward the 51 point limit. If a later talent depends on an earlier one, the interface keeps that dependency visible and prevents an invalid allocation. Removing a required rank also clears talents that can no longer stay active, keeping every shared setup consistent.</p><p>When your <strong>wow forever paladin build</strong> is ready, the Copy Build Link button turns the selected ranks into a compact URL. Anyone opening that link sees the same choices without creating an account. The current build is also stored in the browser as you work, making it easier to return and continue after closing the page. Reset clears the planner when you want to start a completely different idea.</p><p>The current tree uses WoW Forever Beta client build 1.60.1.69893 for all 52 Paladin talents, including positions, rank limits, prerequisite links, icons, and every rank tooltip. The client tables do not state how many ranks a prerequisite requires, so the planner currently applies the Classic max-rank rule and labels that rule as an assumption. BuildForgeTools records the client build beside the data and keeps the earlier Beta dataset for exact build-to-build comparisons. Later Beta patches may change these fields, so the tracker shows what changed before a new dataset replaces the calculator.</p><p>The goal of this tool is to make <strong>wow forever talents</strong> quick to inspect and easy to discuss. The talent data reflects the current Beta client, while the featured builds remain editable community planning examples rather than performance rankings. Use the planner to compare paths, preserve an idea, or give another player a precise starting point for testing.</p></div></div></section>

      <section className="seo-continuation" aria-label="More about the BuildForge talent calculator"><div className="shell"><p>BuildForge keeps every action visible and reversible. A locked node shows that the current branch needs more points or a completed prerequisite. An illuminated node shows a rank already chosen. The summary lists those choices by specialization and lets you remove a rank without hunting for its position in the tree. Because the URL contains only talent identifiers and ranks, it stays compact enough to paste into a chat, forum, or build discussion.</p><p>The first version focuses on a dependable planning loop rather than extra account features. It opens quickly, works without registration, and saves the latest local setup automatically. Players can test a Holy core with Protection support, compare a Retribution route, or clear everything and begin again. The structure is ready for new class trees later, while the Paladin calculator remains a clear standalone page for search visitors who want to build immediately.</p></div></section>

      <SiteFooter />
    </main>
  )
}
