import { useState } from 'react'
import { BookmarkPlus, RotateCcw, Trash2 } from 'lucide-react'
import { BETA_PATCH_REVIEW } from './data/betaPatchReview'
import { createForgePilotSavedBuild, inspectForgePilotSavedBuild, type ForgePilotSavedBuild } from './lib/forgePilot'
import { readForgePilotSavedBuilds, removeForgePilotSavedBuild, upsertForgePilotSavedBuild, type ForgePilotStorage } from './lib/forgePilotStorage'
import type { PlannerConfig, PlannerTalent } from './lib/talentPlanner'
import { track } from './lib/analytics'

interface ForgePilotPanelProps<B extends string> {
  classId: string
  className: string
  dataVersion: string
  level: number | null
  pointCaps: Record<number, number>
  points: number
  buildCode: string
  defaultName: string
  talents: PlannerTalent<B>[]
  config: PlannerConfig<B>
}

function reopenHref(build: ForgePilotSavedBuild): string {
  const params = new URLSearchParams()
  if (build.classId === 'paladin') {
    params.set('id', build.originalCode)
    if (build.level !== null) params.set('level', String(build.level))
    return `/build?${params}#calculator`
  }
  params.set('build', build.originalCode)
  if (build.level !== null) params.set('level', String(build.level))
  return `/${build.classId}?${params}#class-calculator`
}

const storageMessage: Record<string, string> = {
  storage_unavailable: 'This browser could not save the build. Check private browsing or storage settings.',
  corrupt_storage: 'Saved builds could not be read safely. Existing data was left untouched.',
  invalid_record: 'This build could not be saved.',
  limit_reached: 'The 20-build local limit has been reached. Remove a build before saving another.',
}

const unavailableStorage: ForgePilotStorage = {
  getItem() { throw new Error('storage unavailable') },
  setItem() { throw new Error('storage unavailable') },
}

function browserStorage(): ForgePilotStorage {
  try { return window.localStorage } catch { return unavailableStorage }
}

export default function ForgePilotPanel<B extends string>({ classId, className, dataVersion, level, pointCaps, points, buildCode, defaultName, talents, config }: ForgePilotPanelProps<B>) {
  const [initialStorage] = useState(() => typeof window === 'undefined' ? { ok: true as const, builds: [] as ForgePilotSavedBuild[] } : readForgePilotSavedBuilds(browserStorage()))
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState(defaultName)
  const [importInput, setImportInput] = useState('')
  const [builds, setBuilds] = useState<ForgePilotSavedBuild[]>(initialStorage.ok ? initialStorage.builds : [])
  const [message, setMessage] = useState(initialStorage.ok ? '' : storageMessage[initialStorage.error])
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [explanation, setExplanation] = useState<{ id: string; text: string } | null>(null)
  const [explaining, setExplaining] = useState(false)

  function save() {
    const created = createForgePilotSavedBuild({
      id: globalThis.crypto?.randomUUID?.() ?? `build-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(), classId, dataVersion, level, shareInput: buildCode,
      savedAt: new Date().toISOString(),
    })
    if (!created.ok) {
      setMessage('Choose a name and add at least one talent point before saving.')
      return
    }
    const result = upsertForgePilotSavedBuild(browserStorage(), created.build)
    if (!result.ok) {
      setMessage(storageMessage[result.error])
      return
    }
    setBuilds(result.builds)
    setMessage('Saved in this browser. Your editable calculator draft is unchanged.')
    track('build_save', { class: classId, level: level ?? 0, points, storage: 'local' })
  }

  function importLink() {
    const created = createForgePilotSavedBuild({
      id: globalThis.crypto?.randomUUID?.() ?? `build-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(), classId, dataVersion: 'unknown', shareInput: importInput,
      savedAt: new Date().toISOString(),
    })
    if (!created.ok || !created.build.sourceUrl) {
      setMessage('Enter a BuildForge share link for this class. Its original version will be kept as unknown.')
      return
    }
    const result = upsertForgePilotSavedBuild(browserStorage(), created.build)
    if (!result.ok) { setMessage(storageMessage[result.error]); return }
    setBuilds(result.builds)
    setImportInput('')
    setMessage('Imported for review. The original link has no data-version tag, so no migration was attempted.')
    track('build_import', { class: classId, source_version: 'unknown' })
  }

  function rename(build: ForgePilotSavedBuild) {
    const trimmed = editName.trim()
    if (!trimmed) { setMessage('Enter a build name.'); return }
    const result = upsertForgePilotSavedBuild(browserStorage(), { ...build, name: trimmed })
    if (!result.ok) { setMessage(storageMessage[result.error]); return }
    setBuilds(result.builds)
    setEditingId(null)
    setMessage('Build renamed.')
  }

  function remove(id: string) {
    const result = removeForgePilotSavedBuild(browserStorage(), id)
    if (!result.ok) { setMessage(storageMessage[result.error]); return }
    setBuilds(result.builds)
    setRemovingId(null)
    setMessage('Saved build removed from this browser.')
    track('build_remove', { class: classId, storage: 'local' })
  }

  async function explain(saved: ForgePilotSavedBuild) {
    setExplaining(true)
    setExplanation(null)
    try {
      const response = await fetch('/api/forge-pilot-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, sourceDataVersion: saved.dataVersion, currentDataVersion: dataVersion }),
      })
      if (!response.ok) throw new Error('unavailable')
      const result = await response.json() as { explanation?: string }
      if (!result.explanation) throw new Error('empty')
      setExplanation({ id: saved.id, text: result.explanation })
      track('build_patch_explain', { class: classId, source_version: saved.dataVersion })
    } catch {
      setExplanation({ id: saved.id, text: `The site's published talent data is ${dataVersion}. The ${BETA_PATCH_REVIEW.clientBuild} announcement is still pending dataset reconciliation, so this build cannot yet be checked against that client build.` })
    } finally {
      setExplaining(false)
    }
  }

  const classBuilds = builds.filter((build) => build.classId === classId)
  return <section className="forge-pilot" aria-label={`${className} ForgePilot saved builds`}>
    <button type="button" className="forge-pilot-toggle" onClick={() => { setExpanded((value) => !value); setName(defaultName) }}>
      <BookmarkPlus size={16} /> Save to ForgePilot
    </button>
    {expanded && <div className="forge-pilot-content">
      <div className="forge-pilot-heading"><strong>ForgePilot · Saved Builds</strong><small>Stored only in this browser</small></div>
      <label htmlFor={`forge-pilot-name-${classId}`}>Build name</label>
      <div className="forge-pilot-save-row">
        <input id={`forge-pilot-name-${classId}`} value={name} maxLength={120} onChange={(event) => setName(event.target.value)} />
        <button type="button" disabled={points === 0} onClick={save}>Save this build</button>
      </div>
      <label htmlFor={`forge-pilot-import-${classId}`}>Import a BuildForge link</label>
      <div className="forge-pilot-save-row">
        <input id={`forge-pilot-import-${classId}`} value={importInput} placeholder={`https://buildforgetools.com/${classId}`} onChange={(event) => setImportInput(event.target.value)} />
        <button type="button" onClick={importLink}>Import link for review</button>
      </div>
      <p className="forge-pilot-freshness">Saved builds are checked against published {dataVersion} data. Client {BETA_PATCH_REVIEW.clientBuild} changes are awaiting reconciliation; this is not a live-game validity check.</p>
      {message && <p role="status" className="forge-pilot-message">{message}</p>}
      <h3>Your {className} Builds</h3>
      {classBuilds.length === 0 ? <p>No named builds saved yet.</p> : <ul className="forge-pilot-list">{classBuilds.map((saved) => {
        const cap = saved.level === null ? config.pointCap : pointCaps[saved.level]
        const inspection = cap === undefined ? { status: 'needs_review' as const, reason: 'dataset_changed' as const } : inspectForgePilotSavedBuild(saved, {
          classId, dataVersion, talents, config: { ...config, pointCap: cap },
        })
        return <li key={saved.id}>
          <div className="forge-pilot-record-top"><strong>{saved.name}</strong><small>{saved.level === null ? 'Level unknown' : `Level ${saved.level}`} · {saved.dataVersion}</small></div>
          <p className="forge-pilot-status">{inspection.status === 'ready' ? `Matches published ${dataVersion} talent data`
            : inspection.status === 'invalid' ? 'Saved allocation needs correction'
            : inspection.reason === 'removed_official' ? 'Historical allocation: a talent was officially removed. This snapshot cannot reopen under current rules.'
            : inspection.reason === 'reported_removed_under_review' ? 'Historical allocation: a client diff reports a removed talent, pending identity review. This snapshot cannot reopen under current rules.'
            : 'Version needs review before reopening'}</p>
          {inspection.status === 'needs_review' && inspection.reason === 'removed_official' && <a className="forge-pilot-evidence" href={BETA_PATCH_REVIEW.officialSource} target="_blank" rel="noreferrer">Official patch notes</a>}
          {inspection.status === 'needs_review' && inspection.reason === 'reported_removed_under_review' && <a className="forge-pilot-evidence" href={BETA_PATCH_REVIEW.clientDiffSource} target="_blank" rel="noreferrer">Client diff under review</a>}
          {saved.sourceUrl && <details className="forge-pilot-original"><summary>Original share link</summary><code>{saved.sourceUrl}</code></details>}
          {saved.sourceUrl && inspection.status === 'needs_review' && <p className="forge-pilot-review-link">The original version is unknown. Opening this link uses the current calculator; compare its talents before saving a new snapshot. <a href={saved.sourceUrl} target="_blank" rel="noopener noreferrer">Open original link for review</a></p>}
          {editingId === saved.id && <div className="forge-pilot-edit"><label htmlFor={`forge-pilot-edit-${saved.id}`}>New build name</label><input id={`forge-pilot-edit-${saved.id}`} value={editName} maxLength={120} onChange={(event) => setEditName(event.target.value)} /><button type="button" onClick={() => rename(saved)}>Save name</button></div>}
          <div className="forge-pilot-record-actions">
            {inspection.status === 'ready' && <a href={reopenHref(saved)} onClick={() => track('build_reopen', { class: classId, level: saved.level ?? 0 })}><RotateCcw size={14} /> Reopen in Calculator</a>}
            <button type="button" onClick={() => { setEditingId(saved.id); setEditName(saved.name) }}>Rename</button>
            <button type="button" onClick={() => { if (removingId === saved.id) remove(saved.id); else setRemovingId(saved.id) }}><Trash2 size={13} /> {removingId === saved.id ? 'Confirm remove' : 'Remove'}</button>
            <button type="button" disabled={explaining} onClick={() => void explain(saved)}>{explaining ? 'Checking…' : 'Explain patch status'}</button>
          </div>
          {explanation?.id === saved.id && <p role="status" className="forge-pilot-explanation">{explanation.text} <a href={BETA_PATCH_REVIEW.officialSource} target="_blank" rel="noreferrer">Source: Blizzard Beta notes</a></p>}
        </li>
      })}</ul>}
    </div>}
  </section>
}
