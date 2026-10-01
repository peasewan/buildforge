import { useState } from 'react'
import { ArrowRight, BookOpen, Check, ClipboardCheck, Leaf, MapPinned, Music2 } from 'lucide-react'

const STORAGE_KEY = 'glimmerwick-first-days-v1'
const supplies = [
  { id: 'flute', name: 'Flute', place: 'Bristlecone’s workshop', detail: 'Meet the flute maker first. After collecting the town supplies, return for the finished flute.' },
  { id: 'robe', name: 'Robe', place: 'Swish & Stitch Clothier', detail: 'Visit the clothier in Wisk and complete the school-supply conversation.' },
  { id: 'cauldron', name: 'Cauldron', place: 'Newt’s Eye Potion Supply', detail: 'Collect your cauldron from the potion shop. Check the starter set before leaving.' },
  { id: 'potion-kit', name: 'Potion Starter Set', place: 'Newt’s Eye Potion Supply', detail: 'This is a separate item from the cauldron, supplied at the same shop.' },
  { id: 'trinket', name: 'Skill Trinket', place: 'Practical Practice', detail: 'Visit Practical Practice for the enrollment trinket.' },
] as const
const nextSteps = [
  { id: 'clary', name: 'Meet Dean Clary', detail: 'After arriving at the Etchery, visit Clary to take the university garden assignment.' },
  { id: 'garden', name: 'Prepare the first garden beds', detail: 'Use the first tilling song, plant the starter seeds and water the prepared soil.' },
  { id: 'common-room', name: 'Visit the Common Room gathering', detail: 'Heather invites new students to the evening gathering. Check your calendar and the in-game clock.' },
  { id: 'music-class', name: 'Attend the first music lesson', detail: 'Read the class letter after sleeping. Professor Linnea introduces another tool song.' },
] as const
const validIds = new Set<string>([...supplies, ...nextSteps].map(item => item.id))

function readProgress(): string[] {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  const record: unknown = JSON.parse(raw)
  if (!record || typeof record !== 'object' || !('version' in record) || !('checked' in record)) return []
  const value = record as { version: unknown; checked: unknown }
  if (value.version !== 1 || !Array.isArray(value.checked)) return []
  return [...new Set(value.checked.filter((id): id is string => typeof id === 'string' && validIds.has(id)))]
}

function initialProgress() {
  if (typeof window === 'undefined') return { checked: [] as string[], storageAvailable: true }
  try { return { checked: readProgress(), storageAvailable: true } }
  catch { return { checked: [] as string[], storageAvailable: false } }
}

export default function GlimmerwickFirstDaysPage() {
  const [{ checked, storageAvailable }, setProgress] = useState(initialProgress)

  function updateProgress(next: string[]) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, checked: next }))
      setProgress({ checked: next, storageAvailable: true })
    } catch { setProgress({ checked: next, storageAvailable: false }) }
  }
  function toggle(id: string) {
    updateProgress(checked.includes(id) ? checked.filter(current => current !== id) : [...checked, id])
  }
  const supplyCount = supplies.filter(item => checked.includes(item.id)).length

  return <div className="glimmerwick-site gw-first-days">
    <header className="gw-header"><a className="gw-brand" href="/">BuildForge<span>Tools</span></a><nav aria-label="Glimmerwick tools"><a href="/songs-of-glimmerwick">Garden Planner</a><a href="#enrollment">Supply checklist</a><a href="/">All game tools <ArrowRight size={14} /></a></nav></header>
    <main>
      <section className="gw-hero gw-fd-hero" aria-labelledby="gw-fd-title">
        <div className="gw-hero-copy"><p className="gw-eyebrow"><Music2 size={15} /> YOUR FIRST DAYS AT THE ETCHERY</p><h1 id="gw-fd-title">Songs of Glimmerwick <span>First Days Checklist</span></h1><p>Gather your school supplies without wandering back and forth across Wisk. Check off each item, then follow the first steps toward the university garden and music class.</p><div className="gw-hero-meta"><span>Released Sep 30, 2026</span><span>Walkthroughs reviewed Oct 1, 2026</span></div><a className="gw-button" href="#enrollment">Start the checklist <ArrowRight size={16} /></a></div>
        <div className="gw-fd-art" aria-hidden="true"><span className="gw-fd-art-stamp">THE ETCHERY</span><BookOpen size={74} strokeWidth={1.2} /><span className="gw-fd-art-line">Admission field notes</span><div className="gw-fd-art-list">{supplies.map(item => <div key={item.id}><span className={checked.includes(item.id) ? 'is-done' : ''}>{checked.includes(item.id) ? <Check size={14} /> : null}</span>{item.name}</div>)}</div><span className="gw-fd-art-bottom">WISK · GARDEN · CLASSROOM</span></div>
      </section>
      <section className="gw-fd-section" id="enrollment" aria-labelledby="gw-fd-supply-title" data-surface="glimmerwick-first-days">
        <div className="gw-section-heading"><div><p className="gw-eyebrow">01 / ENROLLMENT</p><h2 id="gw-fd-supply-title">Five things to collect</h2></div><span className="gw-fd-progress">{supplyCount} of 5 supplies ready</span></div>
        <p className="gw-tool-intro">Headmistress Abigailia’s enrollment letter starts the route. Speak to Bristlecone at his tree workshop, then visit the three Wisk shops while the flute is made. Return to collect it after the town items. The two launch walkthroughs below agree on these five items and shop locations.</p>
        <div className="gw-fd-supply-grid">{supplies.map((item, index) => <label className={'gw-fd-card ' + (checked.includes(item.id) ? 'gw-fd-card-done' : '')} key={item.id}><input type="checkbox" checked={checked.includes(item.id)} aria-label={'Collected ' + item.name} onChange={() => toggle(item.id)} /><span className="gw-fd-card-num">0{index + 1}</span><strong>{item.name}</strong><span className="gw-fd-place"><MapPinned size={14} /> {item.place}</span><span className="gw-fd-detail">{item.detail}</span></label>)}</div>
        <div className="gw-fd-checklist-foot"><span role="status">{storageAvailable ? 'Your checks are saved in this browser only.' : 'Browser storage is unavailable: changes stay on this screen but are not saved.'}</span><button type="button" onClick={() => updateProgress([])}>Clear checklist</button></div>
      </section>
      <section className="gw-fd-section gw-fd-path" aria-labelledby="gw-fd-path-title">
        <div className="gw-section-heading"><div><p className="gw-eyebrow">02 / AFTER ENROLLMENT</p><h2 id="gw-fd-path-title">Where the first week leads</h2></div><ClipboardCheck size={28} /></div>
        <p className="gw-tool-intro">These are early milestones, not a timed speedrun. Read new mail and check your in-game calendar when a class or gathering is mentioned. The checklist is personal; ticking an item does not mean BuildForgeTools has read your game save.</p>
        <div className="gw-fd-steps">{nextSteps.map((step, index) => <label key={step.id} className="gw-fd-step"><input type="checkbox" checked={checked.includes(step.id)} aria-label={'Done ' + step.name} onChange={() => toggle(step.id)} /><span className="gw-fd-step-num">{index + 1}</span><span><strong>{step.name}</strong><small>{step.detail}</small></span></label>)}</div>
        <div className="gw-fd-garden-link"><Leaf size={28} /><div><h3>Making room for your garden?</h3><p>The Garden Planner lets you record crops and observed harvest days. It leaves unverified prices, growth durations and seasons blank.</p></div><a href="/songs-of-glimmerwick">Open Garden Planner <ArrowRight size={16} /></a></div>
      </section>
      <section className="gw-fd-section gw-fd-source" aria-labelledby="gw-fd-source-title"><div className="gw-section-heading"><div><p className="gw-eyebrow">SOURCE NOTES</p><h2 id="gw-fd-source-title">What this checklist is based on</h2></div></div><p>These locations and opening milestones are reported in two published launch playthroughs, not an official item database. The game’s <a href="https://store.steampowered.com/app/1706510/Songs_of_Glimmerwick/" target="_blank" rel="noreferrer">Steam description</a> confirms the September 30 release, classes, quests, music-based spells and university garden, but does not list the five enrollment shops. Game updates can change steps, so follow the current quest journal if it differs.</p><div className="gw-fd-source-links"><a href="https://intoindiegames.com/walkthroughs/songs-of-glimmerwick-prologue-walkthrough/" target="_blank" rel="noreferrer">Into Indie Games walkthrough <ArrowRight size={15} /></a><a href="https://9puz.com/6174-songs-of-glimmerwick-first-days/" target="_blank" rel="noreferrer">9Puz first-days walkthrough <ArrowRight size={15} /></a></div></section>
      <section className="gw-faq gw-fd-faq" aria-labelledby="gw-fd-faq-title"><p className="gw-eyebrow">QUICK ANSWERS</p><h2 id="gw-fd-faq-title">First-days questions</h2><details><summary>Why can’t I collect my flute on the first visit?</summary><p>Bristlecone starts making it after your first conversation. The launch walkthroughs have you collect the other school supplies in Wisk, then return to the workshop for the flute. Check your Back to School quest objective if it has not changed yet.</p></details><details><summary>Do I need to perfect the music mini-game to cast spells?</summary><p>In the <a href="https://steamcommunity.com/app/1706510/allnews/" target="_blank" rel="noreferrer">developer’s Demo updates</a>, stars were not required to cast a song and the rhythm mini-game could be skipped. We have not independently retested every spell in the release version; follow the prompts you see in your game.</p></details><details><summary>Does this checklist sync with my game?</summary><p>No. Checks are stored only in this browser and do not access your game save or sync between devices. Clearing browser storage removes the saved list.</p></details></section>
    </main>
    <footer className="gw-footer"><div><a className="gw-brand" href="/">BuildForge<span>Tools</span></a><p>An independent, community-made planning tool. Not affiliated with Eastshade Studios.</p></div><nav aria-label="Site information"><a href="/songs-of-glimmerwick">Garden Planner</a><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></nav></footer>
  </div>
}
