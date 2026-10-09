import { Flame } from 'lucide-react'
import { EMBERVILLE_PAGES } from './data/emberville'

export default function EmbervilleShell({ children }: { children: React.ReactNode }) {
  return <div className="ember-site"><header className="ember-nav"><a className="ember-brand" href="/emberville"><Flame /><span>BuildForge<b>Tools</b></span></a><nav aria-label="Emberville"><a href="/emberville">Preview notebook</a><a href="/emberville#build-directions">Build directions</a><a href="/emberville-classes">Classes</a><a href="/emberville-skill-inheritance">Skill Inheritance</a></nav></header>{children}<footer className="ember-footer"><div><strong>BuildForgeTools</strong><p>Preview notes and source guides for Emberville.</p></div><nav>{EMBERVILLE_PAGES.map((page) => <a href={`/${page.slug}`} key={page.id}>{page.title}</a>)}<a href="/paladin">WoW Forever</a><a href="/about">About</a><a href="/contact">Contact</a></nav><small>Community-made planning tool. Not affiliated with Emberville or Cygnus Cross.</small></footer></div>
}
