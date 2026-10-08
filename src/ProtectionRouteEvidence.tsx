import { PROTECTION_ROUTE_EVIDENCE } from './data/protectionCurrentRoute'

export default function ProtectionRouteEvidence() {
  const source = PROTECTION_ROUTE_EVIDENCE
  return <div className="protection-route-evidence">
    <h3>How this route was checked</h3>
    <p>The selected Protection node IDs, positions, and rank caps match Paladin TraitTree {source.treeId} in Beta client {source.reviewedClientBuild}. <a href={source.equivalentDiff} target="_blank" rel="noreferrer">ForeverDiff reports that client {source.equivalentClientBuild} has identical table records.</a> The site's complete calculator now uses the separately reviewed 70245 structure. Resolved rank text is community evidence from the 70170 export, not in-game verification of every value.</p>
    <p>The point order is BuildForgeTools editorial planning for standard progression without Legacy: Talented. It is neither an official build nor a performance-tested ranking. Blizzard's <a href={source.officialPatch} target="_blank" rel="noreferrer">October 1 Beta notes</a> changed Redoubt to 4/8/12/16/20%; the current resolved text reflects those values, while the raw client proc record still has a discrepancy. Historical 69913 tooltips remain archived.</p>
    <details><summary>Selected client records</summary><ul>{source.nodes.map(node => <li key={node.nodeId}>{node.id.replaceAll('_', ' ')} — node {node.nodeId}, spell {node.spellId}, position ({node.posX}, {node.posY}), {node.maxRank} ranks</li>)}</ul></details>
    <p><a href={source.traitNodes} target="_blank" rel="noreferrer">TraitNode CSV</a> · <a href={source.nodeEntryLinks} target="_blank" rel="noreferrer">Node-entry join CSV</a> · <a href={source.traitEntries} target="_blank" rel="noreferrer">Rank caps CSV</a> · <a href={source.definitions} target="_blank" rel="noreferrer">Spell IDs CSV</a> · <a href={source.skillLineTrees} target="_blank" rel="noreferrer">Paladin tree mapping</a> · <a href={source.spellNames} target="_blank" rel="noreferrer">Spell names CSV</a> · <a href={source.traitEdges} target="_blank" rel="noreferrer">Prerequisite edges CSV</a></p>
  </div>
}
