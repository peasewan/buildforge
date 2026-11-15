import { useEffect, useState } from 'react'
import DiscoveryHeader from './DiscoveryHeader'
import SiteFooter from './SiteFooter'

const cities = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Shanghai', 'Asia/Tokyo', 'Australia/Sydney']
const sessions = [
  { start: '2026-11-14T19:00:00Z', end: '2026-11-14T21:00:00Z', confirmed: true },
  { start: '2026-11-15T02:00:00Z', end: '2026-11-15T04:00:00Z', confirmed: true },
  { start: '2026-11-21T19:00:00Z', end: '2026-11-21T21:00:00Z', confirmed: false },
  { start: '2026-11-22T02:00:00Z', end: '2026-11-22T04:00:00Z', confirmed: false },
  { start: '2026-11-28T19:00:00Z', end: '2026-11-28T21:00:00Z', confirmed: false },
  { start: '2026-11-29T02:00:00Z', end: '2026-11-29T04:00:00Z', confirmed: false },
]
const snapshot = Date.parse('2026-11-15T09:00:00Z')

export default function TreasureHoursPage() {
  const [local] = useState(() => typeof window === 'undefined' ? 'UTC' : Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
  const [zone,setZone] = useState(local)
  const [now,setNow] = useState<number | null>(() => typeof window === 'undefined' ? null : Date.now())
  useEffect(()=>{
    const timer = window.setInterval(()=>setNow(Date.now()),30000)
    return ()=>window.clearInterval(timer)
  },[])
  const stamp = new Intl.DateTimeFormat('en-US',{timeZone:zone,weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'})
  const format=(iso:string)=>stamp.format(new Date(iso))
  const moment = now ?? snapshot
  const next=sessions.find(s=>Date.parse(s.end)>moment)
  const started = next && Date.parse(next.start)<=moment
  const past=(end:string)=>Date.parse(end)<=moment
  return <div className="site-discovery field-guide hours-page"><DiscoveryHeader/><main className="sd-main">
    <header className="field-intro"><div><p className="sd-kicker">FORTNITE / TREASURE HUNTERS</p><h1>Treasure Hours</h1><p>Find when the next Battle Royale treasure window falls on your clock. An evening round in America can land on the following morning in Europe or Asia.</p></div><figure><img src="/images/game-guides/treasure-hours.webp" width="832" height="468" alt="Fortnite Treasure Hours artwork with the Cursed Sprites and starting items." fetchPriority="high" /><figcaption>November 14 Cursed event · Epic Games</figcaption></figure></header>
    <section className="field-tool"><div className="field-toolhead"><h2>Event clock</h2><label>Time zone<select value={zone} onChange={e=>setZone(e.target.value)}>{[...new Set([local,...cities])].map(z=><option key={z} value={z}>{z.replaceAll('_',' ')}{z===local?' (local)':''}</option>)}</select></label></div>
      <div className="field-highlight" aria-live="polite"><strong>{!now ? 'November 15 schedule update' : next ? (next.confirmed ? (started ? 'Reported window in progress' : 'Confirmed start') : 'Expected window') : 'Published schedule complete'}</strong><p>{next ? format(next.start) : 'Check Epic’s Battle Royale announcements for the next event.'}</p><small>{next && (next.confirmed ? 'Epic announced this start. The listed end is reported.' : 'Projected from the Saturday schedule. Check the in-game event tile before you queue.')}</small></div>
      <table><caption>November 2026 · start and end in {zone.replaceAll('_',' ')}</caption><thead><tr><th>Starts</th><th>Ends</th><th>Source status</th></tr></thead><tbody>{sessions.map(s=><tr key={s.start}><td><time dateTime={s.start}>{format(s.start)}</time></td><td><time dateTime={s.end}>{format(s.end)}</time></td><td>{s.confirmed?'Official start · reported end':'Projected'}{past(s.end)?' · past':''}</td></tr>)}</tbody></table></section>
    <section className="field-reading"><h2>Which times has Epic confirmed?</h2><p>Epic scheduled Treasure Hours for Saturdays during Treasure Hunters. The November 14 Cursed event announced two starts, at 2 PM and 9 PM Eastern. The table uses the reported two-hour windows. November 21 and 28 use the same reported pattern until Epic publishes exact times.</p><p>Captain’s Days bring new weapons and points of interest. Their dates follow a separate schedule, so a Sunday Captain’s Day does not add another Treasure Hour.</p><p>Sources checked November 15, 2026. <a href="https://communities.epicgames.com/thread/treasure-hours-cursed-november-14/hPrI">Epic’s Cursed event</a> · <a href="https://www.fortnite.com/news/fortnite-treasure-hunters-the-greatest-adventure-of-all-time">Epic’s season calendar</a> · <a href="https://www.vice.com/en/article/fortnite-treasure-hours-schedule/">Reported weekly windows</a>.</p></section>
  </main><SiteFooter discovery links={[]}/></div>
}
