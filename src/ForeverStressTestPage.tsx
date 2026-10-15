import { ArrowRight, CalendarDays, Download, ExternalLink, ShieldCheck } from 'lucide-react'
import SiteFooter from './SiteFooter'

export default function ForeverStressTestPage() {
  return (
    <main className="beta-page forever-event-page">
      <header className="guide-nav shell">
        <a className="brand" href="/"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label="Stress-test guide"><a href="#status">Status</a><a href="#download">Download check</a><a href="#prepare">Class preparation</a></nav>
        <a className="button primary guide-nav-cta" href="#sources">Check the sources</a>
      </header>

      <section className="beta-hero shell">
        <div className="beta-hero-copy">
          <div className="eyebrow"><CalendarDays size={14} aria-hidden="true" /> Server testing guide</div>
          <h1>WoW Forever Stress Test</h1>
          <p className="forever-event-lead">October 19 reported in Battle.net; exact hours and access unconfirmed.</p>
          <p className="forever-event-review">Source review: <time dateTime="2026-10-15">October 15, 2026</time>. This is a dated snapshot; check Blizzard for later announcements.</p>
          <a className="text-link" href="#status">See what is known <ArrowRight size={15} aria-hidden="true" /></a>
        </div>
        <aside className="beta-status-card forever-event-official" aria-labelledby="server-slam-plan">
          <span><ShieldCheck size={14} aria-hidden="true" /> Official plan</span>
          <strong id="server-slam-plan">A short Server Slam</strong>
          <p>Blizzard’s beta announcement promises a later Server Slam: servers open for several hours so anyone can access the beta.</p>
          <p>The reviewed sources do not confirm that the October 19 listing is that event. Its specific access rules still need an announcement.</p>
          <a className="text-link" href="#sources">Read the announcement <ArrowRight size={14} aria-hidden="true" /></a>
        </aside>
      </section>

      <div className="shell forever-event-content">
        <section id="status" className="forever-event-section" aria-labelledby="stress-status-heading">
          <div className="eyebrow">Reported date, open questions</div>
          <h2 id="stress-status-heading">What can you plan around?</h2>
          <div className="forever-event-table-wrap">
            <table aria-label="Stress-test status">
              <thead><tr><th scope="col">Detail</th><th scope="col">October 15 snapshot</th></tr></thead>
              <tbody>
                <tr><th scope="row">Date</th><td><strong>October 19, 2026 — launcher report.</strong> Wowhead reports this availability date in Battle.net.</td></tr>
                <tr><th scope="row">Hours and time zone</th><td><strong>Unconfirmed.</strong> Exact opening and closing times are unknown.</td></tr>
                <tr><th scope="row">Who can log in</th><td><strong>Unconfirmed for this listing.</strong> Subscription, account and regional requirements are not established by the report.</td></tr>
                <tr><th scope="row">Level cap and content</th><td><strong>Unconfirmed.</strong> Do not assume the closed-beta rules apply.</td></tr>
              </tbody>
            </table>
          </div>
          <p className="forever-event-note">No start time or time zone is confirmed, so there is no reliable countdown or local-time conversion.</p>
        </section>

        <section id="download" className="forever-event-section" aria-labelledby="download-heading">
          <div className="eyebrow"><Download size={14} aria-hidden="true" /> Practical check</div>
          <h2 id="download-heading">Find the reported download</h2>
          <p>Wowhead reports a separate “WoW: Forever - Stress Test” entry in the Battle.net launcher, with a client download available ahead of the reported date.</p>
          <ol className="forever-event-steps">
            <li>Open the Battle.net desktop app and select World of Warcraft.</li>
            <li>Check the Game Version dropdown for “WoW: Forever - Stress Test.” If it appears, use its Install option to prepare the client.</li>
            <li>Check Blizzard’s announcement before arranging play time or assuming your account can join.</li>
          </ol>
          <p className="forever-event-note">A visible download does not confirm permission to log in. These steps describe the reported launcher option; availability may differ by account or region.</p>
        </section>

        <section className="forever-event-section" aria-labelledby="access-heading">
          <div className="eyebrow">Access questions</div>
          <h2 id="access-heading">Do I need closed-beta access?</h2>
          <p>Blizzard has not confirmed that this specific listing is the promised Server Slam. The earlier promise of access for anyone does not settle the October 19 account requirements.</p>
          <p>Closed-beta invitations and eligible bundle access do not establish access to this stress-test listing. The ordinary beta download is listed as “World of Warcraft: Forever Beta” under In Development; it is a separate option from the one reported above.</p>
          <h3>Does this extend the beta?</h3>
          <p>Blizzard names October 21 as the beta’s last full day of testing. The stress-test report does not announce an extension or an exact beta closing hour.</p>
        </section>

        <section id="prepare" className="forever-event-section forever-event-preparation" aria-labelledby="prepare-heading">
          <div className="eyebrow">Use the waiting time</div>
          <h2 id="prepare-heading">Prepare a class plan</h2>
          <p>Choose a role and sketch a talent path before a short test window. Level 30 is the current closed beta planning cap, not a confirmed stress-test cap.</p>
          <nav aria-label="Class preparation tools">
            <a href="/wow-forever-class-picker"><span>Choose a class<small>Compare role and combat preferences</small></span><ArrowRight size={18} aria-hidden="true" /></a>
            <a href="/paladin#calculator"><span>Paladin calculator<small>Explore Holy, Protection and Retribution</small></span><ArrowRight size={18} aria-hidden="true" /></a>
            <a href="/warrior#class-calculator"><span>Warrior calculator<small>Explore Arms, Fury and Protection</small></span><ArrowRight size={18} aria-hidden="true" /></a>
          </nav>
        </section>

        <section id="sources" className="forever-event-section forever-event-sources" aria-labelledby="sources-heading">
          <div className="eyebrow">Evidence behind this snapshot</div>
          <h2 id="sources-heading">Sources and their limits</h2>
          <ul>
            <li><span>Official</span><div><a href="https://news.blizzard.com/en-us/article/24304160/the-world-of-warcraft-forever-beta-now-live">Blizzard: The World of Warcraft: Forever Beta Now Live <ExternalLink size={13} aria-hidden="true" /></a><p>The Server Slam plan, ordinary beta access and the last full beta day. It does not give October 19 stress-test hours.</p></div></li>
            <li><span>Reported</span><div><a href="https://www.wowhead.com/forever/news/wow-forever-stress-test-available-on-october-19th-new-option-on-battle-net-383402">Wowhead: stress-test launcher report <ExternalLink size={13} aria-hidden="true" /></a><p>The separate download entry and October 19 availability label. A launcher observation is not a full event announcement.</p></div></li>
            <li><span>Official</span><div><a href="https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696/1">Blizzard: October 1 beta development notes <ExternalLink size={13} aria-hidden="true" /></a><p>Supports the Level 30 closed-beta planning context only.</p></div></li>
          </ul>
        </section>
      </div>

      <SiteFooter discovery links={[{ href: '/wow-forever-class-picker', label: 'Class Picker' }, { href: '/paladin#calculator', label: 'Paladin Calculator' }, { href: '/warrior#class-calculator', label: 'Warrior Calculator' }]} />
    </main>
  )
}
