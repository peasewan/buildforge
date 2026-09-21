import { useMemo, useState } from 'react'
import { Check, Copy, Flame, Lock, Minus, RotateCcw, Shield, Swords } from 'lucide-react'
import SiteFooter from './SiteFooter'
import { WARRIOR_LEVEL_20_BUILDS } from './data/warriorBuilds'
import { WARRIOR_BRANCHES, WARRIOR_PLANNER_CONFIG, warriorBranchNames, warriorBranchTaglines, warriorTalents, type WarriorTalent } from './data/warriorTalents'
import { canIncrementPlannerTalent, decodePlannerBuild, decrementPlannerTalent, dominantPlannerBranch, encodePlannerBuild, incrementPlannerTalent, plannerBranchPoints, plannerLockReason, totalPlannerPoints, type PlannerBuild } from './lib/talentPlanner'
import { track } from './lib/analytics'

type PlannerLevel = 20 | 30 | 60
const STORAGE_KEY = 'wow-forever-warrior-build'
const pointCapFor = (level: PlannerLevel) => level - 9

function initialState(): { build: PlannerBuild; level: PlannerLevel } {
  const params = new URLSearchParams(window.location.search)
  const requestedLevel = Number(params.get('level'))
  const level: PlannerLevel = requestedLevel === 30 || requestedLevel === 60 ? requestedLevel : 20
  const code = params.get('build')
  if (code) return { build: decodePlannerBuild(code, warriorTalents), level }
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as { build?: PlannerBuild; level?: PlannerLevel }
    return { build: stored.build ?? {}, level: stored.level === 30 || stored.level === 60 ? stored.level : 20 }
  } catch { return { build: {}, level: 20 } }
}

function allocation(build: PlannerBuild) {
  return WARRIOR_BRANCHES.map((branch) => plannerBranchPoints(build, branch, warriorTalents)).join('/')
}

function TalentNode({ talent, build, config, onAdd, onRemove, onInspect }: { talent: WarriorTalent; build: PlannerBuild; config: typeof WARRIOR_PLANNER_CONFIG; onAdd: () => void; onRemove: () => void; onInspect: () => void }) {
  const rank = build[talent.id] ?? 0
  const reason = plannerLockReason(build, talent, warriorTalents, config)
  const available = canIncrementPlannerTalent(build, talent, warriorTalents, config)
  return <article className={`warrior-talent ${rank ? 'selected' : ''} ${!available && !rank ? 'locked' : ''}`} data-testid="warrior-talent" style={{ left: `${talent.x}%`, top: `${talent.y}%` }} id={talent.id}>
    <button className="warrior-talent-main" type="button" aria-label={`Add rank to ${talent.name}`} disabled={!available} onClick={() => { onAdd(); onInspect() }}>
      <img src={talent.icon} alt="" />{!available && !rank && <Lock className="node-lock" size={17} />}
      <span>{rank}/{talent.maxRank}</span>
    </button>
    {rank > 0 && <button className="warrior-rank-minus" type="button" aria-label={`Remove rank from ${talent.name}`} onClick={() => { onRemove(); onInspect() }}><Minus size={14} /></button>}
    <button className="warrior-talent-name" type="button" onClick={onInspect}>{talent.name}</button>
    {reason?.type === 'branch-points' && <small>{reason.required} points required</small>}
  </article>
}

export default function WarriorPage() {
  const [initial] = useState(() => initialState())
  const [build, setBuild] = useState<PlannerBuild>(initial.build)
  const [level, setLevel] = useState<PlannerLevel>(initial.level)
  const [selected, setSelected] = useState<WarriorTalent>(warriorTalents[0])
  const [copied, setCopied] = useState(false)
  const cap = pointCapFor(level)
  const config = useMemo(() => ({ ...WARRIOR_PLANNER_CONFIG, pointCap: cap }), [cap])
  const points = totalPlannerPoints(build)
  const activeBranch = dominantPlannerBranch(build, warriorTalents, WARRIOR_BRANCHES, 'arms')

  const commit = (next: PlannerBuild, nextLevel = level) => {
    setBuild(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ build: next, level: nextLevel }))
  }

  const changeLevel = (nextLevel: PlannerLevel) => {
    setLevel(nextLevel)
    if (totalPlannerPoints(build) > pointCapFor(nextLevel)) commit({}, nextLevel)
    else localStorage.setItem(STORAGE_KEY, JSON.stringify({ build, level: nextLevel }))
    track('warrior_level_mode', { level: nextLevel })
  }

  const copyBuild = async () => {
    const url = new URL('/warrior', window.location.origin)
    url.searchParams.set('build', encodePlannerBuild(build))
    url.searchParams.set('level', String(level))
    await navigator.clipboard.writeText(url.toString())
    setCopied(true)
    track('warrior_build_copy', { level, points, specialization: activeBranch })
    window.setTimeout(() => setCopied(false), 1600)
  }

  return <main className="warrior-page">
    <header className="warrior-nav shell"><a className="warrior-brand" href="/"><Swords /><span>BUILD<b>FORGE</b></span></a><nav><a href="/wow-forever-warrior-builds">Warrior Builds</a><a href="/paladin">Paladin</a><a href="/emberville">Emberville</a></nav></header>
    <section className="warrior-hero"><div className="shell warrior-hero-grid"><div><p className="warrior-kicker">Beta Build 69913 · 53 verified nodes</p><h1>WoW Forever Warrior<br /><span>Talent Calculator</span></h1><p>Plan Arms, Fury, and Protection talent trees with Level 20, Level 30, or full 51-point budgets.</p><div className="warrior-hero-actions"><a className="button warrior-primary" href="#warrior-calculator">Start building</a><a className="button ghost" href="/wow-forever-warrior-builds">View Warrior builds</a></div></div><aside><strong>Current planner</strong><span>{warriorBranchNames[activeBranch]} Warrior</span><b>{points} / {cap}</b><small>Talent points spent</small><p>Client data reviewed through 1.60.1.69913</p></aside></div></section>

    <section className="shell warrior-calculator" id="warrior-calculator">
      <div className="warrior-toolbar"><div><p className="warrior-kicker">Interactive talent trees</p><h2>Build Your Warrior</h2></div><div className="warrior-levels" aria-label="Planner level">{([20, 30, 60] as PlannerLevel[]).map((item) => <button className={level === item ? 'active' : ''} type="button" key={item} onClick={() => changeLevel(item)}>Level {item}<small>{pointCapFor(item)} points</small></button>)}</div></div>
      <div className="warrior-presets"><span>Level 20 starters</span>{WARRIOR_LEVEL_20_BUILDS.map((preset) => <button type="button" key={preset.id} aria-label={`Load ${preset.shortTitle}`} onClick={() => { setLevel(20); commit(preset.build, 20); track('warrior_preset_load', { preset: preset.id }) }}>{preset.shortTitle}<small>{preset.allocation}</small></button>)}</div>
      <div className="warrior-tree-grid">
        {WARRIOR_BRANCHES.map((branch) => <section className={`warrior-tree ${branch}`} key={branch}><header><div><Flame size={18} /><h3>{warriorBranchNames[branch]}</h3></div><b>{plannerBranchPoints(build, branch, warriorTalents)}</b><p>{warriorBranchTaglines[branch]}</p></header><div className="warrior-tree-canvas">{warriorTalents.filter((talent) => talent.branch === branch).map((talent) => <TalentNode key={talent.id} talent={talent} build={build} config={config} onInspect={() => setSelected(talent)} onAdd={() => { const next = incrementPlannerTalent(build, talent, warriorTalents, config); if (next !== build) { commit(next); track('talent_click', { class: 'warrior', talent: talent.id, rank: (next[talent.id] ?? 0) }) } }} onRemove={() => commit(decrementPlannerTalent(build, talent, warriorTalents))} />)}</div></section>)}
      </div>
      <div className="warrior-summary"><article><p className="warrior-kicker">Selected talent</p><div className="warrior-detail-title"><img src={selected.icon} alt="" /><div><h3>{selected.name}</h3><span>{warriorBranchNames[selected.branch]} · Tier {selected.row} · {selected.maxRank} rank{selected.maxRank === 1 ? '' : 's'}</span></div></div><p>{selected.rankDescriptions[(build[selected.id] ?? 1) - 1] ?? selected.description}</p><small>Client record {selected.sourceClientBuild}; verified unchanged through {selected.verifiedThroughBuild}. Prerequisite rank rules are derived from the classic tree model where the client only exposes a link.</small></article><aside><span>Current build</span><strong>{allocation(build)}</strong><p>{warriorBranchNames[activeBranch]} Warrior · Level {level}</p><div className="warrior-summary-actions"><button type="button" onClick={() => commit({})}><RotateCcw size={15} /> Reset</button><button type="button" aria-label="Copy build link" onClick={copyBuild}><Copy size={15} /> {copied ? 'Copied' : 'Copy build link'}</button></div><div className="warrior-progress"><i style={{ width: `${Math.min(100, points / cap * 100)}%` }} /></div><small>{points} / {cap}</small></aside></div>
    </section>

    <section className="shell warrior-trust"><div><Check /><h2>Versioned Beta data</h2><p>All 53 readable Warrior nodes include per-rank text, coordinates, icons, and source records.</p></div><div><Shield /><h2>Clear evidence labels</h2><p>Client fields, cross-build verification, and derived prerequisite rules remain visibly separate.</p></div><div><Swords /><h2>Build links that persist</h2><p>Share the exact talent ranks and point-budget mode without creating indexable duplicate pages.</p></div></section>
    <section className="shell warrior-copy"><h2>WoW Forever Warrior Talent Calculator</h2><p>This Warrior talent calculator covers Arms, Fury, and Protection using a 53-node dataset reviewed through Beta client build 1.60.1.69913. Select a level mode, spend points in the interactive trees, inspect rank-specific tooltips, and copy a build URL for later testing.</p><p>Level 20 uses the current 11-point budget. Level 30 and Level 60 are planning modes with 21 and 51 points. Bonus points are excluded until their rules can be verified from reliable game data.</p></section>
    <SiteFooter links={[{ href: '/wow-forever-warrior-builds', label: 'Warrior Builds' }, { href: '/wow-forever-warrior-leveling-build', label: 'Warrior Leveling' }, { href: '/paladin', label: 'Paladin Calculator' }, { href: '/emberville', label: 'Emberville Planner' }]} />
  </main>
}
