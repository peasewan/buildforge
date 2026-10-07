import { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, Check, Copy, Dice5, Eye, ShieldCheck, Users } from 'lucide-react'
import { INVOKYR_EVIDENCE, INVOKYR_PAGES, type InvokyrPageId } from './data/invokyr'
import { checkParty, DEFAULT_COOP, parseCoop, releaseNotice, shareCoop, type CoopState } from './lib/invokyr'
import { track } from './lib/analytics'

function Evidence({ ids }: { ids: string[] }) {
  return <div className="iv-sources">{ids.map(id => {
    const source = INVOKYR_EVIDENCE[id]
    return <article key={id}><span>{source.evidence} · {source.appliesTo}</span><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a><small>Source date: {source.sourceDate ?? 'Store page; publication date not supplied'} · Checked {source.checked}</small></article>
  })}</div>
}
function Share({ path, fragment }: { path: string; fragment: string }) {
  const [message, setMessage] = useState('')
  const [fallback, setFallback] = useState('')
  async function copy() {
    const url = `https://buildforgetools.com${path}${fragment}`
    try {
      await navigator.clipboard.writeText(url)
      setFallback(''); setMessage('Link copied.')
      track('invokyr_share', { tool: path })
    } catch { setFallback(url); setMessage('Could not copy automatically. Select the link below to copy it manually.') }
  }
  return <div className="iv-share"><button type="button" className="iv-button iv-secondary" onClick={copy}><Copy size={16} />Copy result link</button><span role="status">{message}</span>{fallback && <label>Share link<input aria-label="Share link" readOnly value={fallback} onFocus={event => event.target.select()} /></label>}</div>
}
function Helpful({ tool }: { tool: string }) {
  const [answer, setAnswer] = useState('')
  return <div className="iv-feedback"><span>Did this answer your question?</span>{['Yes', 'Not yet'].map(label => <button type="button" key={label} disabled={!!answer} onClick={() => { setAnswer(label); track('invokyr_answer_feedback', { tool, answer: label === 'Yes' ? 'yes' : 'no' }) }}>{label}</button>)}<span role="status">{answer && 'Thanks for the feedback.'}</span></div>
}
function CoopChecker() {
  const [state, setState] = useState<CoopState>(() => typeof window === 'undefined' ? DEFAULT_COOP : parseCoop(window.location.hash))
  useEffect(() => {
    const restore = () => setState(parseCoop(window.location.hash))
    window.addEventListener('hashchange', restore)
    window.addEventListener('popstate', restore)
    return () => { window.removeEventListener('hashchange', restore); window.removeEventListener('popstate', restore) }
  }, [])
  const result = checkParty(state)
  function update(next: Partial<CoopState>) {
    const value = { ...state, ...next }
    setState(value)
    window.history.replaceState(null, '', `${window.location.pathname}${shareCoop(value)}`)
    track('invokyr_coop_check', { version: value.version, players: value.players, issue: value.issue, result: checkParty(value).overLimit ? 'over_limit' : 'within_limit' })
  }
  return <section className="iv-workbench" data-surface="invokyr-multiplayer">
    <div className="iv-controls"><p className="iv-kicker">01 / SET UP YOUR GROUP</p><fieldset><legend>Which version are you playing?</legend><div className="iv-options">{(['demo', 'early-access'] as const).map(version => <button type="button" aria-pressed={state.version === version} key={version} onClick={() => update({ version })}>{version === 'demo' ? 'Free Demo' : 'Early Access'}</button>)}</div></fieldset><fieldset><legend>How many players, including you?</legend><div className="iv-options iv-numbers">{[1, 2, 3, 4, 5, 6].map(players => <button type="button" aria-pressed={state.players === players} key={players} onClick={() => update({ players })}>{players}</button>)}</div></fieldset><fieldset><legend>What is happening?</legend><div className="iv-options iv-stacked"><button type="button" aria-pressed={state.issue === 'planning'} onClick={() => update({ issue: 'planning' })}>Planning a group</button><button type="button" aria-pressed={state.issue === 'join'} onClick={() => update({ issue: 'join' })}>Another player cannot join</button></div></fieldset></div>
    <div className={`iv-result ${result.overLimit ? 'iv-warning' : ''}`} aria-live="polite"><p className="iv-kicker">02 / YOUR VERSION CHECK</p><div className="iv-party-count"><Users size={25}/><strong>{state.players}<span> / {result.limit}</span></strong></div><h2>{result.title}</h2><p>{result.detail}</p>{state.version === 'early-access' && <p className="iv-note">Six-player support is an official announcement. It has not been independently tested by BuildForgeTools.</p>}{state.issue === 'join' && !result.overLimit && <div className="iv-checklist"><h3>Information to collect next</h3><p>Record each player’s game edition and displayed version, the exact error, and whether a smaller group can join. Include those details when contacting the game’s support or Steam discussions. These are diagnostic notes, not a guaranteed fix.</p></div>}<Share key={`share-${shareCoop(state)}`} path="/invokyr-multiplayer" fragment={shareCoop(state)}/><Helpful key={shareCoop(state)} tool="multiplayer"/></div>
  </section>
}
const steps = { final: 'Reached the final area', folded: 'Board folded up', trigger: 'Ending did not trigger' } as const
type EndingStep = keyof typeof steps
function endingStep(): EndingStep {
  const value = typeof window === 'undefined' ? null : new URLSearchParams(window.location.hash.slice(1)).get('step')
  return value === 'folded' || value === 'trigger' ? value : 'final'
}
function EndingChecker() {
  const [spoilers, setSpoilers] = useState(false)
  const [step, setStep] = useState<EndingStep>(endingStep)
  useEffect(() => {
    const restore = () => { setStep(endingStep()); setSpoilers(false) }
    window.addEventListener('hashchange', restore)
    window.addEventListener('popstate', restore)
    return () => { window.removeEventListener('hashchange', restore); window.removeEventListener('popstate', restore) }
  }, [])
  return <section data-surface="invokyr-ending" className="iv-ending"><div className="iv-panel"><p className="iv-kicker">DEMO ONLY · JUNE DEVELOPER GUIDANCE</p><h2>Keep the surprise. Choose when to reveal it.</h2><p>This tool covers one developer-confirmed Demo hint. It is not a full walkthrough, and the clue has not been revalidated for Early Access or every later Demo patch.</p><fieldset><legend>Which step are you stuck on?</legend><div className="iv-options">{Object.entries(steps).map(([value, label]) => <button type="button" key={value} aria-pressed={step === value} onClick={() => { setStep(value as EndingStep); window.history.replaceState(null, '', `${window.location.pathname}#step=${value}`); track('invokyr_ending_step', { step: value }) }}>{label}</button>)}</div></fieldset><label className="iv-spoiler-toggle"><input type="checkbox" checked={spoilers} onChange={event => { setSpoilers(event.target.checked); if (event.target.checked) track('invokyr_spoiler_reveal', { step }) }}/><Eye size={20}/> Show ending spoilers</label>
      {spoilers ? <div className="iv-hint"><span className="iv-badge">Developer reply · Demo · June 14, 2026</span><h3>Carry the board game into the end room.</h3><p>{step === 'folded' ? 'A folded board alone does not establish that this developer instruction has been completed.' : step === 'trigger' ? 'First check the board’s location against the developer’s instruction. The reply does not document every ending trigger.' : 'Reaching the final area is not the only detail in the developer’s reply: the board must come with you.'}</p><Evidence ids={['ending']}/><details><summary>Separate community suggestion: voice input</summary><p>A player in the same thread suggested checking voice input when the spoken-name step fails. This is not independently verified and is not a guaranteed fix. The developer’s reply does not confirm a voice-input requirement.</p><Evidence ids={['voice']}/></details><Helpful key={step} tool="ending"/></div> : <div className="iv-locked"><ShieldCheck size={24}/><p>The ending hint is hidden. Enable the switch above when you are ready.</p></div>}
      <Share key={step} path="/invokyr-how-to-win" fragment={`#step=${step}`}/><p className="iv-note">Shared links remember the selected step. Spoilers stay hidden for the person opening the link.</p></div></section>
}
export default function InvokyrPage({ pageId }: { pageId: InvokyrPageId }) {
  const page = INVOKYR_PAGES.find(item => item.id === pageId)!
  return <div className="iv-site"><a className="iv-skip" href="#iv-main" onClick={event => { event.preventDefault(); document.getElementById('iv-main')?.focus() }}>Skip to content</a><header className="iv-header"><a className="iv-brand" href="/">BuildForge<span>Tools</span></a><nav aria-label="Invokyr tools">{INVOKYR_PAGES.map(item => <a key={item.id} href={item.path} aria-current={item.id === pageId ? 'page' : undefined}>{item.id === 'home' ? 'Companion' : item.id === 'multiplayer' ? 'Co-op Checker' : 'Demo Ending'}</a>)}</nav></header>
    <main id="iv-main" tabIndex={-1}><section className="iv-hero"><div><p className="iv-kicker"><Dice5 size={18}/> INVOKYR / PLAYER COMPANION</p><h1>{page.h1}</h1><p className="iv-lead">{pageId === 'home' ? 'Before the next roll, get your group on the same page.' : pageId === 'multiplayer' ? 'Four in the Demo. Six announced for Early Access. Check which rule applies to your group.' : 'At the last room and still stuck? Start with a verified Demo clue, without revealing the ending until you choose.'}</p><div className="iv-tags"><span><ShieldCheck size={14}/>Source-linked answers</span><span>Reviewed Oct 7, 2026</span><span>Independent fan tools</span></div></div><div className="iv-board" aria-hidden="true"><div className="iv-orbit"/><Dice5 size={112} strokeWidth={1}/><span>KNOW YOUR VERSION</span></div></section>
    <aside className="iv-release"><strong>Early Access announcement</strong><p>{releaseNotice}</p><a href={INVOKYR_EVIDENCE.release.url} target="_blank" rel="noreferrer">Publisher’s announcement ↗</a></aside>
    {pageId === 'home' ? <><section className="iv-tools" data-surface="invokyr-home"><a className="iv-tool-card" href="/invokyr-multiplayer"><Users size={30}/><p className="iv-kicker">01 / GATHER YOUR PARTY</p><h2>Can everyone join?</h2><p>Choose your version and group size. Separate a capacity limit from a join problem.</p><span>Open Co-op Checker <ArrowRight size={18}/></span></a><a className="iv-tool-card" href="/invokyr-how-to-win"><BookOpen size={30}/><p className="iv-kicker">02 / THE LAST ROOM</p><h2>Stuck at the Demo ending?</h2><p>Reveal the developer’s hint when you are ready. Player suggestions stay clearly labelled.</p><span>Open Demo Troubleshooter <ArrowRight size={18}/></span></a></section><section className="iv-panel"><p className="iv-kicker">THE EVIDENCE BEHIND THE ANSWER</p><h2>A companion with version boundaries.</h2><p>Invokyr combines cooperative horror with a board game. These tools focus on two practical player questions: who can join your game, and what the developer said about the Demo ending. Neither tool simulates a run or promises to solve every bug.</p><div className="iv-principles"><article><Check/><h3>Official rules</h3><p>Player limits come from the Demo store and the publisher’s Early Access announcement.</p></article><article><Eye/><h3>Spoilers by choice</h3><p>Ending guidance is opt-in, including when a friend sends you a link.</p></article><article><ShieldCheck/><h3>Dates stay visible</h3><p>New versions need a new review. A release date alone does not turn a clue into a tested fact.</p></article></div></section></> : pageId === 'multiplayer' ? <><CoopChecker/><section className="iv-panel"><h2>Why can’t five players join the Invokyr Demo?</h2><p>The Demo’s published cap is four people, including the host. A five-person group exceeds that cap. Early Access is a separate release with six-player support announced by the publisher; do not apply its limit to the free Demo.</p><h3>What if three players cannot connect?</h3><p>Three is within the Demo’s capacity. Player count alone cannot identify that failure. Check the result above for the information worth recording before reporting it.</p><Evidence ids={['demo', 'release']}/></section></> : <EndingChecker/>}
    {pageId === 'home' && <section className="iv-panel"><h2>Sources and review scope</h2><Evidence ids={['demo', 'release', 'ending']}/><p className="iv-note">Detailed dice and monster lookups will be published only after individual records are reviewed. No unverified effects or drop rates are supplied here.</p></section>}
    <section className="iv-related"><h2>Keep the next step close.</h2>{INVOKYR_PAGES.filter(item => item.id !== pageId).map(item => <a key={item.id} href={item.path}>{item.h1}<ArrowRight size={17}/></a>)}</section></main>
    <footer className="iv-footer"><div><a className="iv-brand" href="/">BuildForge<span>Tools</span></a><p>Independent fan tools. Not affiliated with Ludogram or Shochiku Games.</p></div><nav aria-label="Site information"><a href="/about">About</a><a href="/contact">Contact / report an error</a><a href="/privacy">Privacy</a></nav></footer></div>
}
