import { useEffect, useMemo, useRef, useState } from 'react'
import { BookmarkPlus, RotateCcw, Trash2 } from 'lucide-react'
import { ForgePilotAuthBoundary } from './ForgePilotAuth'
import { useForgePilotAuth } from './ForgePilotAuthContext'
import { BETA_PATCH_REVIEW } from './data/betaPatchReview'
import { createForgePilotSavedBuild, inspectForgePilotSavedBuild, type ForgePilotSavedBuild } from './lib/forgePilot'
import { readForgePilotSavedBuilds, removeForgePilotSavedBuild, upsertForgePilotSavedBuild, type ForgePilotStorage } from './lib/forgePilotStorage'
import { createForgePilotCloudClient } from './lib/forgePilotCloudClient'
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

function newBuildId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `build-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function ForgePilotPanelContent<B extends string>({ classId, className, dataVersion, level, pointCaps, points, buildCode, defaultName, talents, config }: ForgePilotPanelProps<B>) {
  const auth = useForgePilotAuth()
  const cloudClient = useMemo(() => createForgePilotCloudClient(auth.getToken, fetch, auth.userId ?? undefined), [auth.getToken, auth.userId])
  const [initialStorage] = useState(() => typeof window === 'undefined' ? { ok: true as const, builds: [] as ForgePilotSavedBuild[] } : readForgePilotSavedBuilds(browserStorage()))
  const [name, setName] = useState(defaultName)
  const [importInput, setImportInput] = useState('')
  const [localBuilds, setLocalBuilds] = useState<ForgePilotSavedBuild[]>(initialStorage.ok ? initialStorage.builds : [])
  const [cloudBuilds, setCloudBuilds] = useState<ForgePilotSavedBuild[]>([])
  const [cloudOwner, setCloudOwner] = useState<string | null>(null)
  const [cloudStatus, setCloudStatus] = useState<{ owner: string; loaded: boolean } | null>(null)
  const [cloudLoadFailed, setCloudLoadFailed] = useState(false)
  const [cloudLoadAttempt, setCloudLoadAttempt] = useState(0)
  const [cloudBusy, setCloudBusy] = useState(false)
  const [message, setMessage] = useState(initialStorage.ok ? '' : storageMessage[initialStorage.error])
  const [removingKey, setRemovingKey] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [explanation, setExplanation] = useState<{ key: string; text: string } | null>(null)
  const [explaining, setExplaining] = useState(false)
  const sessionGeneration = useRef(0)
  const sessionOwner = useRef(auth.userId)

  function isCurrentSession(owner: string, generation: number): boolean {
    return sessionOwner.current === owner && sessionGeneration.current === generation
  }

  useEffect(() => {
    if (sessionOwner.current === auth.userId) return
    sessionOwner.current = auth.userId
    sessionGeneration.current += 1
    setCloudBuilds([])
    setCloudOwner(null)
    setCloudStatus(null)
    setCloudLoadFailed(false)
    setCloudBusy(false)
    setEditingKey(null)
    setRemovingKey(null)
    setExplanation(null)
    setExplaining(false)
    setMessage('')
  }, [auth.userId])

  useEffect(() => {
    if (!auth.userId) return
    let current = true
    const owner = auth.userId
    const generation = sessionGeneration.current
    void cloudClient.list().then((records) => {
      if (!current || generation !== sessionGeneration.current) return
      setCloudBuilds(records)
      setCloudOwner(owner)
      setCloudStatus({ owner, loaded: true })
      setCloudLoadFailed(false)
    }).catch((error: unknown) => {
      if (!current || generation !== sessionGeneration.current) return
      setMessage(error instanceof Error ? error.message : 'Cloud saves are unavailable. Your local builds are still here.')
      setCloudStatus({ owner, loaded: true })
      setCloudLoadFailed(true)
    })
    return () => { current = false }
  }, [auth.userId, cloudClient, cloudLoadAttempt])

  function retryCloudLoad() {
    setCloudStatus(null)
    setCloudLoadFailed(false)
    setMessage('')
    setCloudLoadAttempt((attempt) => attempt + 1)
  }

  const cloudLoading = Boolean(auth.userId && (!cloudStatus || cloudStatus.owner !== auth.userId || !cloudStatus.loaded))
  const visibleCloudBuilds = cloudOwner === auth.userId && auth.userId ? cloudBuilds.filter((build) => build.classId === classId) : []

  function currentRecord() {
    return createForgePilotSavedBuild({
      id: newBuildId(),
      name: name.trim(), classId, dataVersion, level, shareInput: buildCode,
      savedAt: new Date().toISOString(),
    })
  }

  function save() {
    const created = currentRecord()
    if (!created.ok) {
      setMessage('Choose a name and add at least one talent point before saving.')
      return
    }
    const result = upsertForgePilotSavedBuild(browserStorage(), created.build)
    if (!result.ok) {
      setMessage(storageMessage[result.error])
      return
    }
    setLocalBuilds(result.builds)
    setMessage('Saved in this browser. Your editable calculator draft is unchanged.')
    track('build_save', { class: classId, level: level ?? 0, points, storage: 'local' })
  }

  async function saveCloud() {
    const owner = auth.userId
    if (!owner) return
    const generation = sessionGeneration.current
    const created = currentRecord()
    if (!created.ok) {
      setMessage('Choose a name and add at least one talent point before saving.')
      return
    }
    setCloudBusy(true)
    try {
      const saved = await cloudClient.save(created.build)
      if (!isCurrentSession(owner, generation)) return
      setCloudBuilds((previous) => [saved, ...previous.filter((candidate) => candidate.id !== saved.id)])
      setMessage('Saved to your account. Your editable calculator draft is unchanged.')
      track('build_save', { class: classId, level: level ?? 0, points, storage: 'cloud' })
    } catch (error) {
      if (!isCurrentSession(owner, generation)) return
      setMessage(error instanceof Error ? error.message : 'Cloud saves are unavailable. Your local builds are still here.')
    } finally { if (isCurrentSession(owner, generation)) setCloudBusy(false) }
  }

  async function importLocalBuilds() {
    const owner = auth.userId
    if (!owner || localBuilds.length === 0) return
    const generation = sessionGeneration.current
    setCloudBusy(true)
    let imported = 0
    let failed = false
    const savedRecords: ForgePilotSavedBuild[] = []
    for (const build of localBuilds) {
      if (!isCurrentSession(owner, generation)) return
      try {
        savedRecords.push(await cloudClient.save(build))
        if (!isCurrentSession(owner, generation)) return
        imported += 1
      } catch {
        failed = true
        break
      }
    }
    if (!isCurrentSession(owner, generation)) return
    setCloudBuilds((previous) => Array.from(new Map([...previous, ...savedRecords].map((record) => [record.id, record])).values()))
    setMessage(failed
      ? `Cloud import stopped after ${imported} of ${localBuilds.length} builds. All originals remain on this device; retry when cloud saves return.`
      : `${imported} local build${imported === 1 ? '' : 's'} imported to your account. Copies remain on this device.`)
    setCloudBusy(false)
  }

  function importLink() {
    const created = createForgePilotSavedBuild({
      id: newBuildId(),
      name: name.trim(), classId, dataVersion: 'unknown', shareInput: importInput,
      savedAt: new Date().toISOString(),
    })
    if (!created.ok || !created.build.sourceUrl) {
      setMessage('Enter a BuildForge share link for this class. Its original version will be kept as unknown.')
      return
    }
    const result = upsertForgePilotSavedBuild(browserStorage(), created.build)
    if (!result.ok) { setMessage(storageMessage[result.error]); return }
    setLocalBuilds(result.builds)
    setImportInput('')
    setMessage('Imported for review. The original link has no data-version tag, so no migration was attempted.')
    track('build_import', { class: classId, source_version: 'unknown' })
  }

  async function rename(build: ForgePilotSavedBuild, source: 'local' | 'cloud') {
    const trimmed = editName.trim()
    if (!trimmed) { setMessage('Enter a build name.'); return }
    if (source === 'local') {
      const result = upsertForgePilotSavedBuild(browserStorage(), { ...build, name: trimmed })
      if (!result.ok) { setMessage(storageMessage[result.error]); return }
      setLocalBuilds(result.builds)
      setEditingKey(null)
      setMessage('Build renamed on this device.')
      return
    }
    const owner = auth.userId
    if (!owner) return
    const generation = sessionGeneration.current
    setCloudBusy(true)
    try {
      const updated = await cloudClient.rename(build.id, trimmed)
      if (!isCurrentSession(owner, generation)) return
      setCloudBuilds((previous) => previous.map((candidate) => candidate.id === updated.id ? updated : candidate))
      setEditingKey(null)
      setMessage('Cloud build renamed.')
    } catch (error) {
      if (!isCurrentSession(owner, generation)) return
      setMessage(error instanceof Error ? error.message : 'Cloud saves are unavailable. Your local builds are still here.')
    } finally { if (isCurrentSession(owner, generation)) setCloudBusy(false) }
  }

  async function remove(id: string, source: 'local' | 'cloud') {
    if (source === 'local') {
      const result = removeForgePilotSavedBuild(browserStorage(), id)
      if (!result.ok) { setMessage(storageMessage[result.error]); return }
      setLocalBuilds(result.builds)
      setRemovingKey(null)
      setMessage('Saved build removed from this browser.')
      track('build_remove', { class: classId, storage: 'local' })
      return
    }
    const owner = auth.userId
    if (!owner) return
    const generation = sessionGeneration.current
    setCloudBusy(true)
    try {
      await cloudClient.remove(id)
      if (!isCurrentSession(owner, generation)) return
      setCloudBuilds((previous) => previous.filter((candidate) => candidate.id !== id))
      setRemovingKey(null)
      setMessage('Cloud build removed from your account. Any local copy remains on this device.')
      track('build_remove', { class: classId, storage: 'cloud' })
    } catch (error) {
      if (!isCurrentSession(owner, generation)) return
      setMessage(error instanceof Error ? error.message : 'Cloud saves are unavailable. Your local builds are still here.')
    } finally { if (isCurrentSession(owner, generation)) setCloudBusy(false) }
  }

  async function explain(saved: ForgePilotSavedBuild, source: 'local' | 'cloud') {
    const owner = auth.userId
    const generation = sessionGeneration.current
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
      if (source === 'cloud' && (!owner || !isCurrentSession(owner, generation))) return
      setExplanation({ key: `${source}:${saved.id}`, text: result.explanation })
      track('build_patch_explain', { class: classId, source_version: saved.dataVersion })
    } catch {
      if (source === 'cloud' && (!owner || !isCurrentSession(owner, generation))) return
      setExplanation({ key: `${source}:${saved.id}`, text: `The site's published talent data is ${dataVersion}. The ${BETA_PATCH_REVIEW.clientBuild} announcement is still pending dataset reconciliation, so this build cannot yet be checked against that client build.` })
    } finally {
      if (source === 'local' || (owner && isCurrentSession(owner, generation))) setExplaining(false)
    }
  }

  const localClassBuilds = localBuilds.filter((build) => build.classId === classId)
  const recordList = (records: ForgePilotSavedBuild[], source: 'local' | 'cloud') => records.length === 0
    ? <p>No named builds saved {source === 'local' ? 'on this device' : 'in your account'} yet.</p>
    : <ul className="forge-pilot-list">{records.map((saved) => {
      const cap = saved.level === null ? config.pointCap : pointCaps[saved.level]
      const inspection = cap === undefined ? { status: 'needs_review' as const, reason: 'dataset_changed' as const } : inspectForgePilotSavedBuild(saved, {
        classId, dataVersion, talents, config: { ...config, pointCap: cap },
      })
      const key = `${source}:${saved.id}`
      return <li key={key}>
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
        {editingKey === key && <div className="forge-pilot-edit">
          <label htmlFor={`forge-pilot-edit-${source}-${saved.id}`}>New build name</label>
          <input id={`forge-pilot-edit-${source}-${saved.id}`} value={editName} maxLength={120} onChange={(event) => setEditName(event.target.value)} />
          {/* The handler reads the session ref only after a click, never while rendering. */}
          {/* eslint-disable-next-line react-hooks/refs */}
          <button type="button" disabled={source === 'cloud' && cloudBusy} onClick={() => void rename(saved, source)}>Save name</button>
        </div>}
        <div className="forge-pilot-record-actions">
          {inspection.status === 'ready' && <a href={reopenHref(saved)} onClick={() => track('build_reopen', { class: classId, level: saved.level ?? 0 })}><RotateCcw size={14} /> Reopen in Calculator</a>}
          <button type="button" onClick={() => { setEditingKey(key); setEditName(saved.name) }}>Rename</button>
          <button type="button" disabled={source === 'cloud' && cloudBusy} onClick={() => { if (removingKey === key) void remove(saved.id, source); else setRemovingKey(key) }}><Trash2 size={13} /> {removingKey === key ? 'Confirm remove' : 'Remove'}</button>
          <button type="button" disabled={explaining} onClick={() => void explain(saved, source)}>{explaining ? 'Checking…' : 'Explain patch status'}</button>
        </div>
        {explanation?.key === key && <p role="status" className="forge-pilot-explanation">{explanation.text} <a href={BETA_PATCH_REVIEW.officialSource} target="_blank" rel="noreferrer">Source: Blizzard Beta notes</a></p>}
      </li>
    })}</ul>

  return <div className="forge-pilot-content">
      <div className="forge-pilot-heading"><strong>ForgePilot · Saved Builds</strong><small>{auth.userId ? 'This device + your account' : 'Stored in this browser'}</small></div>
      <div className="forge-pilot-account-bar">
        {auth.userId ? <><span>Signed in · cloud saves enabled</span><button type="button" onClick={() => { sessionGeneration.current += 1; sessionOwner.current = null; setCloudOwner(null); setCloudBuilds([]); setCloudBusy(false); setMessage(''); void auth.signOut() }}>Sign out</button></>
          : auth.configured ? <><span>Local saves work without an account.</span><button type="button" disabled={!auth.loaded} onClick={auth.openSignIn}>Sign in to sync builds</button></>
          : <span>Account sign-in is not configured yet. Local saves still work.</span>}
      </div>
      <label htmlFor={`forge-pilot-name-${classId}`}>Build name</label>
      <div className="forge-pilot-save-row">
        <input id={`forge-pilot-name-${classId}`} value={name} maxLength={120} onChange={(event) => setName(event.target.value)} />
        <button type="button" disabled={points === 0} onClick={save}>Save this build</button>
        {auth.userId && <button type="button" disabled={points === 0 || cloudBusy || cloudLoading || cloudOwner !== auth.userId} onClick={() => void saveCloud()}>Save to account</button>}
      </div>
      <label htmlFor={`forge-pilot-import-${classId}`}>Import a BuildForge link</label>
      <div className="forge-pilot-save-row">
        <input id={`forge-pilot-import-${classId}`} value={importInput} placeholder={`https://buildforgetools.com/${classId}`} onChange={(event) => setImportInput(event.target.value)} />
        <button type="button" onClick={importLink}>Import link for review</button>
      </div>
      <p className="forge-pilot-freshness">Saved builds are checked against published {dataVersion} data. Client {BETA_PATCH_REVIEW.clientBuild} changes are awaiting reconciliation; this is not a live-game validity check.</p>
      {message && <p role="status" className="forge-pilot-message">{message}</p>}
      <h3>Your {className} Builds</h3>
      <h4>On this device</h4>
      {recordList(localClassBuilds, 'local')}
      {auth.userId && <div className="forge-pilot-cloud-section">
        <div className="forge-pilot-cloud-heading"><h4>In your account</h4>{cloudLoadFailed && <button type="button" onClick={retryCloudLoad}>Retry cloud saves</button>}{localBuilds.length > 0 && !cloudLoading && cloudOwner === auth.userId && <button type="button" disabled={cloudBusy} onClick={() => void importLocalBuilds()}>Import {localBuilds.length} local build{localBuilds.length === 1 ? '' : 's'} to account</button>}</div>
        <p className="forge-pilot-freshness">Import copies all builds saved on this device, including other classes. Originals stay in this browser.</p>
        {cloudLoading ? <p>Loading cloud builds…</p> : cloudLoadFailed ? <p>Cloud builds could not be loaded.</p> : recordList(visibleCloudBuilds, 'cloud')}
      </div>}
    </div>
}

export default function ForgePilotPanel<B extends string>(props: ForgePilotPanelProps<B>) {
  const [expanded, setExpanded] = useState(false)
  return <section className="forge-pilot" aria-label={`${props.className} ForgePilot saved builds`}>
    <button type="button" className="forge-pilot-toggle" onClick={() => setExpanded((value) => !value)}>
      <BookmarkPlus size={16} /> Save to ForgePilot
    </button>
    {expanded && <ForgePilotAuthBoundary><ForgePilotPanelContent {...props} /></ForgePilotAuthBoundary>}
  </section>
}
