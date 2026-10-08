import { PALADIN_RANK_TEXT_SOURCE } from './data/talents'

export default function PaladinRankAttribution() {
  const source = PALADIN_RANK_TEXT_SOURCE
  return <p className="beta-footnote">70245 client tables verify talent identities, positions and rank caps. Rank descriptions are adapted from <a href={source.url} target="_blank" rel="noreferrer">Talents Forever</a> (source build {source.sourceBuild}) under <a href={source.licenseUrl} target="_blank" rel="noreferrer">CC BY 4.0</a> and carry community verification. {source.adaptationNotice} No in-game verification of every rendered value is claimed.</p>
}
