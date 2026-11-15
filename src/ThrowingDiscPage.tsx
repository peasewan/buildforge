import { ArrowDown, ArrowUpRight, CornerUpRight, Layers, Undo2 } from 'lucide-react'
import DiscoveryHeader from './DiscoveryHeader'
import SiteFooter from './SiteFooter'
import { throwingDisc } from './data/throwingDisc'

const materials = ['Copper', 'Iron', 'Gold', 'Diamond', 'Netherite']

export default function ThrowingDiscPage() {
  return <div className="site-discovery disc-page">
    <DiscoveryHeader />
    <main className="sd-main">
      <header className="disc-hero">
        <div className="disc-intro">
          <p className="sd-kicker">MINECRAFT / WEAPON GUIDE</p>
          <h1>Minecraft<br />Throwing Disc</h1>
          <p>You can’t craft the throwing disc in a released version yet. Mojang plans to add this returning weapon in the first game drop of 2027.</p>
          <a href="#availability" className="disc-jump">Check your edition <ArrowDown size={16} aria-hidden="true" /></a>
        </div>
        <figure>
          <img src="/images/minecraft/throwing-disc.webp" width="1170" height="500" fetchPriority="high" alt="A diamond throwing disc in the player’s left hand and a sword in the right, facing a trial spawner." />
          <figcaption>Diamond disc in the off-hand <span>Image: Mojang Studios</span></figcaption>
        </figure>
      </header>
      <section id="availability" className="disc-status">
        <div className="disc-section-title"><h2>Can I play it yet?</h2><p>Checked <time dateTime="2026-11-15">November 15, 2026</time></p></div>
        <table>
          <thead><tr><th scope="col">Edition</th><th scope="col">Regular release</th><th scope="col">Test builds</th></tr></thead>
          <tbody>
            <tr><th scope="row">Java</th><td>Planned for 2027</td><td>No snapshot announced for the disc</td></tr>
            <tr><th scope="row">Bedrock</th><td>Planned for 2027</td><td>No Preview or Beta announced for the disc</td></tr>
          </tbody>
        </table>
        <p>The November test notes mention <em>Flurry</em>, a music disc you play in a jukebox. The throwable weapon belongs to the following game drop. <a href={throwingDisc.testing}>Read the test notes <ArrowUpRight aria-hidden="true" size={14} /></a></p>
      </section>
      <div className="disc-columns">
        <section className="disc-card">
          <h2>How do you craft it?</h2>
          <p>Mojang showed five material variants at TwitchCon. The reveal names the materials but leaves the crafting grid, ingredient counts and netherite upgrade method open.</p>
          <ul className="disc-materials" aria-label="Announced materials">{materials.map(material => <li key={material}><i aria-hidden="true" className={material.toLowerCase()} />{material}</li>)}</ul>
          <p className="disc-note">Choosing a material for combat? Damage and durability values for each tier are still unconfirmed.</p>
        </section>
        <section className="disc-card">
          <h2>How the throw works</h2>
          <dl className="disc-moves">
            <div><dt><CornerUpRight aria-hidden="true" />Bounce off a wall</dt><dd>A hard surface can redirect the disc and extend its short flight.</dd></div>
            <div><dt><Layers aria-hidden="true" />Line up your targets</dt><dd>One throw can hit several enemies standing along the same path.</dd></div>
            <div><dt><Undo2 aria-hidden="true" />Catch the return</dt><dd>The disc comes back after you throw it. Mojang also showed it in the off-hand alongside a sword.</dd></div>
          </dl>
        </section>
      </div>
      <footer className="disc-source"><strong>Official reveal</strong><a href={throwingDisc.reveal}>Mojang’s TwitchCon weapon preview <ArrowUpRight aria-hidden="true" size={16} /></a><time dateTime="2026-11-14">November 14, 2026</time></footer>
    </main>
    <SiteFooter discovery links={[]} />
  </div>
}
