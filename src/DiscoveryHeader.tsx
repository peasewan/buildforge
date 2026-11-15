import type { DiscoveryId } from './data/siteDiscovery'

export default function DiscoveryHeader({ pageId }: { pageId?: DiscoveryId }) {
  return <header className="sd-header"><a className="sd-brand" href="/"><img src="/images/icons/paladin-shield.png" alt="" />BUILD<b>FORGE</b><small>TOOLS</small></a><nav aria-label="Site discovery"><a href="/wow-forever-classes" aria-current={pageId === 'classes' ? 'page' : undefined}>WoW classes</a><a href="/wow-forever-builds" aria-current={pageId === 'builds' ? 'page' : undefined}>WoW builds</a><a href="/emberville">Emberville</a></nav></header>
}
