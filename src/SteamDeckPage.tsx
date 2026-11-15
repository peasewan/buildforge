import { useState } from 'react'
import DiscoveryHeader from './DiscoveryHeader'
import SiteFooter from './SiteFooter'

const layouts = {
  Hunter: { href:'/wow-forever-hunter-builds', skills:['Arcane Shot','Concussive Shot','Pet Attack','Mend Pet'], note:'Keep Pet Attack separate from your own shot so you can pull the pet back before it starts a second fight.' },
  Mage: { href:'/wow-forever-mage-builds', skills:['Frostbolt','Fire Blast','Frost Nova','Blink'], note:'Put Blink somewhere you can press while steering. Keep Frost Nova close for the moment a pack reaches you.' },
  Paladin: { href:'/wow-forever-paladin-builds', skills:['Judgement','Seal of Righteousness','Hammer of Justice','Holy Light'], note:'Leave room for a friendly-target control beside your healing spell. Practice switching back to the enemy after a heal.' },
}
type ClassName = keyof typeof layouts
const buttons=['X','Y','LT + X','LT + Y']
export default function SteamDeckPage() {
  const [cls,setCls]=useState<ClassName>('Hunter')
  const build=layouts[cls]
  return <div className="site-discovery field-guide deck-page"><DiscoveryHeader/><main className="sd-main">
    <header className="field-intro"><div><p className="sd-kicker">WOW FOREVER / HANDHELD</p><h1>WoW Forever on Steam Deck</h1><p>Launch Forever through Battle.net, enable the built-in gamepad interface and choose four class actions you can reach during a fight.</p></div><figure><img src="/images/game-guides/wow-gamepad.webp" width="950" height="534" alt="The in-game action bars show controller buttons below a WoW character." fetchPriority="high" /><figcaption>Forever’s controller action bars · Blizzard Entertainment</figcaption></figure></header>
    <div className="field-columns"><section className="field-tool"><h2>From Desktop Mode to Azeroth</h2><ol className="deck-steps">
      <li><strong>Install the launcher.</strong> Switch to Desktop Mode, open Discover and install Lutris. In Lutris, use the Battle.net installer and sign in. If you already run Battle.net through Lutris, open that existing entry.</li>
      <li><strong>Select Forever.</strong> Open World of Warcraft in Battle.net, select the Forever version, finish its install and launch once from the desktop. In Lutris, use Create Steam shortcut on the installed launcher. Return to Gaming Mode and open it from your non-Steam library.</li>
      <li><strong>Enable gamepad controls.</strong> In the game menu, open Options → Gameplay → Gamepad. Select gamepad input, then configure action bars, targeting and the HUD modifier. Use Steam + X when chat or sign-in needs text.</li>
    </ol><a href="https://lutris.net/downloads/">Lutris Steam Deck instructions</a> · <a href="https://lutris.net/games/battlenet/">Battle.net installer</a></section>
    <section className="field-tool"><h2>Plan your action bar</h2><label htmlFor="deck-class">Class</label><select id="deck-class" value={cls} onChange={e=>setCls(e.target.value as ClassName)}>{Object.keys(layouts).map(c=><option key={c}>{c}</option>)}</select>
    <p>Suggested bindings for learned abilities. Keep A and B available for your preferred jump and interact controls; assign LT as your modifier if you use this layout.</p>
    <dl className="deck-bindings">{build.skills.map((s,i)=><div key={s}><dt><kbd>{buttons[i]}</kbd></dt><dd>{s}</dd></div>)}</dl><p aria-live="polite">{build.note}</p><a href={build.href}>Open {cls} builds →</a></section></div>
    <section className="field-reading"><h2>When a control stops working</h2><details open><summary>The launcher works, but my buttons move the mouse</summary><p>Open the game shortcut’s Steam controller layout and choose a gamepad template. Back in WoW, select gamepad input. Test the action bar and camera in a quiet area before changing individual spell bindings.</p></details><details><summary>I can target enemies but can’t heal a party member</summary><p>Open the Gamepad targeting and raid targeting options. Bind a friendly-target control, select a party portrait and test a heal. Then switch to a hostile target and check the action bar again.</p></details><details><summary>Gaming Mode reopens the installer</summary><p>Return to Lutris in Desktop Mode. Launch the installed Battle.net entry first, then create the Steam shortcut from that entry. Keep the working game installation when replacing the shortcut.</p></details>
    <p>Blizzard describes Forever’s XInput gamepad support as beta. The installation steps combine the published Lutris and Valve workflows; the class layouts are editorial suggestions. BuildForgeTools has not tested these bindings on Deck hardware. Reviewed November 15, 2026.</p>
    <p><a href="https://worldofwarcraft.blizzard.com/en-us/news/24316974/">Blizzard gamepad settings</a> · <a href="https://help.steampowered.com/en/faqs/view/671a-4453-e8d2-323c">Valve Desktop FAQ</a> · <a href="https://us.forums.blizzard.com/en/wow/t/works-great-on-steam-deck/2364052">Player’s Deck experience</a></p></section>
  </main><SiteFooter discovery links={[]}/></div>
}
