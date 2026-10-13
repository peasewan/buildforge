import { useState } from 'react'
import { RET_TWIST_REFERENCE } from './data/paladinRetReference'
import { branchNames, talents } from './data/talents'
import { BRANCHES, branchPoints, totalPoints, type Build } from './lib/build'
import { track } from './lib/analytics'
import { comparePaladinAllocations, createPaladinSnapshot, parsePaladinSnapshot, paladinSnapshotHref, type PaladinSnapshot } from './lib/paladinComparison'
import PaladinRankAttribution from './PaladinRankAttribution'

const STORAGE_KEY = 'buildforge-paladin-comparison-a-v1'
type LoadSource = 'community_reference' | 'saved_comparison'
function initialComparison(): { saved: PaladinSnapshot | null; notice: string | null } {
  if (typeof window === 'undefined') return { saved: null, notice: null }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { saved: null, notice: null }
    const saved = parsePaladinSnapshot(JSON.parse(raw))
    return { saved, notice: saved ? null : 'Your saved comparison needs review against the current dataset. It has not been loaded or overwritten.' }
  } catch {
    return { saved: null, notice: 'Saved comparisons are unavailable. You can still compare builds for this visit.' }
  }
}
const allocation = (snapshot: PaladinSnapshot) => BRANCHES.map(branch => branchPoints(snapshot.build, branch, talents)).join('/')
const scope = (snapshot: PaladinSnapshot) => snapshot.level === 60 ? 'Level 60 · 51-point planning reference' : `Level ${snapshot.level} · ${snapshot.level - 9}-point Beta budget`

export default function PaladinAllocationComparison({ build, level, onLoad }: {
  build: Build; level: number; onLoad: (snapshot: PaladinSnapshot, source: LoadSource) => void
}) {
  const [initial] = useState(initialComparison)
  const [saved, setSaved] = useState<PaladinSnapshot | null>(initial.saved)
  const [notice, setNotice] = useState<string | null>(initial.notice)
  const [protectStoredA, setProtectStoredA] = useState(Boolean(initial.notice))
  const current = createPaladinSnapshot(build, level)
  const rows = saved && current ? comparePaladinAllocations(saved, current) : []
  const saveA = () => {
    if (!current || !totalPoints(current.build)) return
    setSaved(current)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(current)); setNotice('Build A saved. Edit the tree to compare your next choices as B.') }
    catch { setNotice('Build A is saved for this visit only; browser storage is unavailable.') }
    track('build_comparison_save', { class: 'paladin', level, points: totalPoints(build) })
  }
  return <section id="paladin-build-comparison" className="paladin-allocation-comparison" aria-label="Compare two Paladin builds">
    <div className="popular-builds-heading"><div><span>Save a baseline · compare your edits</span><h2>Compare Two Paladin Builds</h2></div><p>Save your current choices as A, then edit the talent tree to create B. Your saved A stays separate from the editable draft.</p></div>
    <article className="paladin-ret-reference">
      <div><span>Community reference · reviewed {RET_TWIST_REFERENCE.reviewedAt}</span><h3>{RET_TWIST_REFERENCE.name} · {RET_TWIST_REFERENCE.allocation}</h3>
        <p>Level 60 planning with 51 points, replayed against reviewed 70245 rules. This is a sourced allocation, not an official or measured best build. It exceeds the live Level 30 / 21-point budget.</p>
        <a href={RET_TWIST_REFERENCE.source.url} target="_blank" rel="noreferrer">{RET_TWIST_REFERENCE.source.label}</a>
      </div><button type="button" className="button secondary" onClick={() => {
        const reference = createPaladinSnapshot(RET_TWIST_REFERENCE.build, RET_TWIST_REFERENCE.level)
        if (!reference || reference.dataset !== String(RET_TWIST_REFERENCE.dataset)) { setNotice('The reference needs a rule review before it can be loaded.'); return }
        if (!saved && !protectStoredA && current && totalPoints(current.build)) saveA()
        onLoad(reference, 'community_reference')
      }}>Load 13/0/38 reference</button>
    </article>
    <div className="paladin-comparison-actions">
      <button type="button" className="button secondary" disabled={!current || !totalPoints(build)} onClick={saveA}>Save current build as A</button>
      {saved && <><button type="button" className="button secondary" onClick={() => onLoad(saved, 'saved_comparison')}>Restore A to Calculator</button>
        <button type="button" className="button secondary" onClick={() => { setSaved(null); try { localStorage.removeItem(STORAGE_KEY); setNotice(null); setProtectStoredA(false) } catch { setProtectStoredA(true); setNotice('Comparison cleared for this visit; browser storage could not be updated.') } }}>Clear A</button></>}
    </div>
    {notice && <p role="status">{notice}</p>}
    {!saved && <p>Save A to see added, removed and changed ranks. Loading the reference first preserves a non-empty current build as A.</p>}
    {saved && current && <>
      <div className="paladin-comparison-summary">{[{ label: 'A · Saved build', snapshot: saved }, { label: 'B · Current build', snapshot: current }].map(({ label, snapshot }) => <article key={label}><h3>{label}</h3><strong>{allocation(snapshot)}</strong><p>{scope(snapshot)} · {totalPoints(snapshot.build)} points spent</p><a href={paladinSnapshotHref(snapshot)}>Open {label.startsWith('A') ? 'A' : 'B'} in Calculator</a></article>)}</div>
      {saved.level !== current.level && <p role="note">Different level budgets: compare the choices, not performance. A uses {scope(saved)}; B uses {scope(current)}.</p>}
      <p aria-live="polite">{rows.length ? `${rows.length} ${rows.length === 1 ? "talent differs" : "talents differ"} between A and B.` : 'Both builds select the same talent ranks.'}</p>
      {rows.length > 0 && <div className="paladin-comparison-table-scroll"><table><caption>Talent differences: A to B</caption><thead><tr><th scope="col">Talent</th><th scope="col">A rank / effect</th><th scope="col">B rank / effect</th><th scope="col">Point change</th></tr></thead><tbody>{rows.map(row => <tr key={row.talent.id}>
        <th scope="row"><img src={row.talent.icon} alt="" /><span>{row.talent.name}<small>{branchNames[row.talent.branch]}</small></span></th>
        <td><strong>{row.aRank}/{row.talent.maxRank}</strong><p>{row.aEffect}</p></td><td><strong>{row.bRank}/{row.talent.maxRank}</strong><p>{row.bEffect}</p></td>
        <td>{row.delta > 0 ? '+' : ''}{row.delta}<small>{row.aRank === 0 ? 'Added' : row.bRank === 0 ? 'Removed' : 'Rank changed'}</small></td>
      </tr>)}</tbody></table></div>}
    </>}
    <p>Budgets follow standard progression; Legacy bonus points are not modeled. A/B saves are local browser snapshots, not in-game dual specialization. Exact rank effects carry community evidence; tier timing and required prerequisite ranks remain assumptions. No DPS, mana-per-fight or healing efficiency score is calculated.</p>
    <PaladinRankAttribution />
  </section>
}
