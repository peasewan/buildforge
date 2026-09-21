import { ArrowRight, Check, Shield, Swords } from 'lucide-react'
import SiteFooter from './SiteFooter'
import { warriorBuildPageById, warriorPlannerHref, type WarriorBuildPageId } from './data/warriorPages'
import { warriorTalentById } from './data/warriorTalents'

export default function WarriorBuildPage({ pageId }: { pageId: WarriorBuildPageId }) {
  const page = warriorBuildPageById(pageId)
  return <main className="warrior-page warrior-editorial">
    <header className="warrior-nav shell"><a className="warrior-brand" href="/warrior"><Swords /><span>BUILD<b>FORGE</b></span></a><nav><a href="/warrior">Talent Calculator</a><a href="/wow-forever-warrior-builds">Warrior Builds</a><a href="/paladin">Paladin</a></nav></header>
    <section className="warrior-build-hero"><div className="shell"><p className="warrior-kicker">{page.eyebrow}</p><h1>{page.title}</h1><p>{page.subtitle}</p><div className="warrior-build-actions"><a className="button warrior-primary" href={warriorPlannerHref(page.preset)}>Open {page.preset.shortTitle} Calculator <ArrowRight /></a><a className="button ghost" href="#talent-order">View talent order</a></div><small>Community recommendation · Talent data verified through Beta build 1.60.1.69913</small></div></section>
    <section className="shell warrior-build-layout"><article><div className="warrior-build-overview"><span>Level 20 allocation</span><strong>{page.preset.allocation}</strong><p>{page.preset.role}</p></div><h2>Selected talents</h2><ul className="warrior-selected-list">{Object.entries(page.preset.build).map(([id, rank]) => { const talent = warriorTalentById(id)!; return <li key={id}><img src={talent.icon} alt="" /><span>{talent.name}</span><b>{rank}/{talent.maxRank}</b></li> })}</ul></article><aside><h2>Best for</h2>{page.bestFor.map((item) => <p key={item}><Check /> {item}</p>)}<hr /><h3>Data status</h3><p><Shield /> 53 Warrior nodes</p><p><Check /> Build 69913 checked</p><small>The allocation is editorial. Talent names, ranks, positions, and tooltip text come from client-derived records.</small></aside></section>
    <article className="shell warrior-article">{page.sections.map((section, index) => <section id={index === 1 ? 'talent-order' : undefined} key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}<section><h2>Open this build in the calculator</h2><p>The link loads all 11 points and keeps the current Level 20 point cap. You can change any rank, switch to a future planning cap, and copy a separate build URL.</p><a className="button warrior-primary" href={warriorPlannerHref(page.preset)}>Customize this Warrior build <ArrowRight /></a></section></article>
    <SiteFooter links={[{ href: '/warrior', label: 'Warrior Calculator' }, { href: '/wow-forever-warrior-builds', label: 'Warrior Builds' }, { href: '/wow-forever-warrior-leveling-build', label: 'Warrior Leveling' }]} />
  </main>
}

