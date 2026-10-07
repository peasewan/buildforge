import { useState } from 'react'
import type { InvokyrLookupRecord } from './data/invokyr'

// Internal component only: do not mount publicly until a useful reviewed catalog exists.
export default function InvokyrLookup({ entries }: { entries: InvokyrLookupRecord[] }) {
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('all')
  const [version, setVersion] = useState('all')
  const [onlySaved, setOnlySaved] = useState(false)
  const [notice, setNotice] = useState('')
  const [saved, setSaved] = useState<string[]>(() => {
    try { const value: unknown = JSON.parse(localStorage.getItem('invokyr-saved-records') ?? '[]'); return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string' && entries.some(entry => entry.id === id)) : [] } catch { return [] }
  })
  const visible = entries.filter(entry => (!onlySaved || saved.includes(entry.id)) && (kind === 'all' || entry.kind === kind) && (version === 'all' || entry.evidence.appliesTo === version) && `${entry.name} ${entry.description}`.toLowerCase().includes(query.toLowerCase()))
  function toggle(id: string) {
    const next = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id]
    setSaved(next)
    try { localStorage.setItem('invokyr-saved-records', JSON.stringify(next)) } catch { setNotice('Storage unavailable. Favorites last until you leave this page.') }
  }
  return <section><label>Search records<input value={query} onChange={event => setQuery(event.target.value)}/></label><label>Record type<select value={kind} onChange={event => setKind(event.target.value)}><option value="all">All</option><option value="dice">Dice</option><option value="monster">Monsters</option></select></label><label>Version<select value={version} onChange={event => setVersion(event.target.value)}><option value="all">All</option><option>Demo</option><option>Early Access</option></select></label><label><input type="checkbox" checked={onlySaved} onChange={event => setOnlySaved(event.target.checked)}/>Saved only</label>{visible.length ? visible.map(entry => <article key={entry.id}><h3>{entry.name}</h3><p>{entry.description}</p><p>{entry.evidence.appliesTo} · {entry.evidence.evidence} · Source date {entry.evidence.sourceDate ?? 'unknown'} · Checked {entry.evidence.checked}</p><a href={entry.evidence.url}>Source</a><button type="button" onClick={() => toggle(entry.id)}>{saved.includes(entry.id) ? 'Unsave' : 'Save'} {entry.name}</button></article>) : <p>No matching reviewed records.</p>}<p role="status">{notice}</p></section>
}
