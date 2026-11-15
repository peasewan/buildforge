import { useState } from 'react'
import { Cable, Gamepad2, Globe, Users } from 'lucide-react'
import DiscoveryHeader from './DiscoveryHeader'
import SiteFooter from './SiteFooter'

const platforms = ['Windows (Microsoft Store)', 'Steam (Windows)', 'Xbox Series X|S', 'PlayStation 5', 'Nintendo Switch', 'Nintendo Switch 2', 'Xbox One', 'PlayStation 4'] as const
type Platform = typeof platforms[number]
type Mode = 'Online' | 'Couch co-op' | 'Couch + online'
const modes: Mode[] = ['Online', 'Couch co-op', 'Couch + online']
const guide = 'https://help.minecraft.net/hc/en-us/articles/48752623638285-Minecraft-Dungeons-II-Cross-Play-and-Multiplayer-Guide'
const overview = 'https://www.minecraft.net/en-us/about-dungeons-ii'
const coop = 'https://www.minecraft.net/en-us/article/dungeons-ii-co-op'
const patches = 'https://feedback.minecraft.net/hc/en-us/sections/49286492925453'
const issueAdvice = {
  'Join a Party is greyed out': 'Open Heroes from the main menu and filter to Online Heroes. Select one, or create a hero with Play Online. Return to the menu and open Party again.',
  'My friend’s code fails': 'Ask the host to open their current Party session and read back all eight characters. An old party’s code expires when that session ends. Count everyone already playing, including couch guests.',
  'Multiplayer is restricted': 'Check which profile is signed in on the device showing the restriction. In its online safety settings, allow multiplayer and cross-network play. For a child profile, the family organizer manages these permissions.',
  'Our versions differ': 'Compare the full in-game version on each device. Check for updates in each store or console library, install them, and relaunch both games. If one platform is still waiting for a compatible update, retry after it arrives.',
  'My second controller cannot join': 'Pair the extra controller with the same console or PC. Return to hero selection, use the second controller to join, then select the local player’s profile and hero.',
}
type Issue = keyof typeof issueAdvice
const onlineIssues = Object.keys(issueAdvice).slice(0, 4) as Issue[]
const steamListing = 'https://store.steampowered.com/app/1912410/Minecraft_Dungeons_II/'
const controllerIssue: Issue = 'My second controller cannot join'
const storeLinks: Partial<Record<Platform, string>> = {
  'Xbox Series X|S': 'https://www.xbox.com/en-US/games/store/minecraft-dungeons-ii/9p5786pjb9rp',
  'PlayStation 5': 'https://www.playstation.com/en-us/games/minecraft-dungeons-ii/',
  'Nintendo Switch': 'https://www.nintendo.com/us/store/products/minecraft-dungeons-ii-switch/',
  'Nintendo Switch 2': 'https://www.nintendo.com/us/store/products/minecraft-dungeons-ii-switch-2/',
  'Steam (Windows)': steamListing,
}
const consoleAccess: Partial<Record<Platform, string>> = {
  'Xbox Series X|S': 'Check Xbox console multiplayer access. Game Pass Essential, Premium and Ultimate include this feature.',
  'PlayStation 5': 'Check PlayStation Plus online multiplayer access for the PS5 profile.',
  'Nintendo Switch': 'Check Nintendo Switch Online access for the Nintendo profile.',
  'Nintendo Switch 2': 'Check Nintendo Switch Online access for the Nintendo profile.',
}

export default function DungeonsCrossplayPage() {
  const [host, setHost] = useState<Platform>('Steam (Windows)')
  const [guest, setGuest] = useState<Platform>('Nintendo Switch 2')
  const [mode, setMode] = useState<Mode>('Online')
  const [local, setLocal] = useState(2)
  const [remote, setRemote] = useState(1)
  const [issue, setIssue] = useState<Issue | ''>('')
  const online = mode !== 'Couch co-op'
  const couch = mode !== 'Online'
  const devices = online ? [host, guest] : [host]
  const unsupported = devices.find(device => device === 'Xbox One' || device === 'PlayStation 4')
  const size = (couch ? local : 1) + (online ? remote : 0)
  const eligible = !unsupported && size <= 4
  const steps: string[] = []
  let title: string
  if (unsupported) {
    title = unsupported + ' has no native Dungeons II release'
    steps.push('Choose Windows, Steam on Windows, Xbox Series X|S, PS5, Switch or Switch 2 for this player. Both devices need the sequel to play together.')
  } else if (size > 4) {
    title = size + ' heroes exceed the four-player limit'
    steps.push('Reduce the party by ' + (size - 4) + ' or split into two sessions. Each player on the couch uses one party slot.')
  } else {
    title = online ? (mode === 'Couch + online' ? 'Mixed co-op is supported' : host === guest ? 'Online co-op is supported' : 'Crossplay is supported') : 'Couch co-op is supported'
    if (issue) steps.push(issueAdvice[issue])
    if (couch && issue !== controllerIssue) steps.push('Connect a controller for each additional couch player on ' + host + '. At hero selection, have the other players join on that device.')
    if (online) {
      if (issue !== 'Join a Party is greyed out') steps.push('Select an Online Hero for each participant. If only offline heroes appear, create a hero with Play Online.')
      steps.push('The host opens Party from the main menu and shares the current eight-character party code. Remote players open Join with Code and enter it.')
      if (devices.includes('Steam (Windows)')) steps.push('On Steam, sign in with the Microsoft account linked to the game.')
      for (const note of new Set(devices.map(platform => consoleAccess[platform]))) if (note) steps.push(note)
    } else steps.push('For an offline session, choose Play Offline when creating a hero. Keep everyone on this device. To add a remote friend later, choose Couch + online and use online heroes.')
  }
  const issues = [...(online ? onlineIssues : []), ...(couch ? [controllerIssue] : [])]
  return <div className="site-discovery dungeons-crossplay">
    <DiscoveryHeader />
    <main className="sd-main">
      <header className="dc-hero"><div className="sd-intro"><p className="sd-kicker">MINECRAFT DUNGEONS II / MULTIPLAYER</p>
        <h1>Minecraft Dungeons II crossplay checker</h1>
        <p>Choose where your party plays. Check which devices can join, how many heroes fit, and what to try when an invite fails.</p>
      </div><figure><img src="/images/minecraft/dungeons-ii-party.webp" width="460" height="215" alt="A party of heroes fights through the blue-lit ruins in Minecraft Dungeons II."/><figcaption>Game artwork · <a href={steamListing}>Xbox Game Studios on Steam</a></figcaption></figure></header>
      <div className="dc-tool">
        <section className="dc-input"><h2>Your party</h2>
          <fieldset><legend>How are you playing?</legend><div className="dc-modes">{modes.map((item, i) => {
            const Icon = [Globe, Gamepad2, Cable][i]
            return <button key={item} type="button" aria-pressed={item === mode} onClick={() => { setMode(item); setIssue('') }}><Icon size={18} aria-hidden="true"/>{item}</button>
          })}</div></fieldset>
          <div className="dc-fields">
            <label>Host device<select value={host} onChange={e => setHost(e.target.value as Platform)}>{platforms.map(p => <option key={p}>{p}</option>)}</select></label>
            {online && <label>Friend’s device<select value={guest} onChange={e => setGuest(e.target.value as Platform)}>{platforms.map(p => <option key={p}>{p}</option>)}</select></label>}
            {couch && <label>Players on host device<select value={local} onChange={e => setLocal(Number(e.target.value))}>{[2, 3, 4].map(n => <option key={n}>{n}</option>)}</select></label>}
            {online && <label>Remote players<select value={remote} onChange={e => setRemote(Number(e.target.value))}>{[1, 2, 3, 4].map(n => <option key={n}>{n}</option>)}</select></label>}
          </div>
          <label>Troubleshoot a symptom<select value={issue} onChange={e => setIssue(e.target.value as Issue | '')}><option value="">Show setup instructions</option>{issues.map(item => <option key={item}>{item}</option>)}</select></label>
        </section>
        <section className={'dc-result ' + (eligible ? '' : 'dc-warning')} aria-live="polite" aria-atomic="true">
          <div className="dc-meta"><Users size={16} aria-hidden="true"/>{size} of 4 party slots</div>
          <h2>{title}</h2><p className="dc-pair">{devices.join(' + ')}</p>
          <ol>{steps.map(step => <li key={step}>{step}</li>)}</ol>
          {eligible && online && <div className="dc-store-links">{[...new Set(devices)].filter(p => storeLinks[p]).map(p => <a key={p} href={storeLinks[p]}>{p} requirements</a>)}</div>}
        </section>
      </div>
      <section className="dc-notes"><h2>Can three people on one console play with a friend on PC?</h2><p>Yes. Three local heroes and one remote hero fill the four-player party. Set the checker to Couch + online, choose three players on the host device and one remote player. Everyone joining the online party needs an Online Hero.</p>
        <p>Two players on separate consoles can instead choose Online and join with the host’s code. If everyone is in the same room on a single console, choose Couch co-op and connect a controller for each extra player.</p>
        <h2>When only one friend can’t join</h2>
        <p>Have the affected player try a fresh code before everyone changes settings. If another friend can join the same party, compare the affected player’s game version, hero type and multiplayer permissions with the working setup. <a href={guide}>Minecraft’s multiplayer help</a></p>
        <p>Updates can arrive on different platforms at different times. Look for your device in the release notes when an update is missing from its store. <a href={patches}>Dungeons II changelogs</a></p>
      </section>
      <aside className="dc-sources"><span>Checked November 15, 2026</span><a href={overview}>Official platform list</a><a href={coop}>Mojang’s co-op walkthrough</a></aside>
    </main>
    <SiteFooter discovery links={[]} />
  </div>
}
