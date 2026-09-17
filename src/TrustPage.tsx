import { ArrowRight, MessageSquarePlus } from 'lucide-react'
import SiteFooter from './SiteFooter'
import { trustPageById, type TrustPageId } from './data/trustPages'

export default function TrustPage({ pageId }: { pageId: TrustPageId }) {
  const page = trustPageById(pageId)
  const openFeedback = () => document.querySelector<HTMLButtonElement>('.feedback-trigger')?.click()

  return (
    <main className="trust-page">
      <header className="guide-nav shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label="Site information"><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></nav>
        <a className="button primary" href="/paladin#calculator">Open Planner</a>
      </header>

      <section className="trust-hero">
        <div className="shell">
          <div className="eyebrow">{page.eyebrow}</div>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
          <span>Last updated: {page.updated}</span>
        </div>
      </section>

      <article className="trust-content shell">
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 50)}>{paragraph}</p>)}
            {section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
            {section.links && <div className="trust-links">{section.links.map((item) => <a href={item.href} key={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noreferrer' : undefined}>{item.label} <ArrowRight size={14} /></a>)}</div>}
          </section>
        ))}
        {pageId === 'contact' && <aside className="trust-contact-cta"><MessageSquarePlus size={28} /><div><strong>Send feedback from this page</strong><span>The same private form is available throughout BuildForgeTools.</span></div><button className="button primary" type="button" onClick={openFeedback}>Open Feedback Form</button></aside>}
      </article>

      <SiteFooter />
    </main>
  )
}
