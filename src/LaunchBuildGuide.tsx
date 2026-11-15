import { useState } from 'react'
import { buildActivities, launchAllocation, launchChoices, launchEvidence, launchHotfixes, type LaunchClass } from './data/launchBuilds'

const archive = {hunter:'1.60.1.70291', mage:'1.60.1.69913', paladin:'1.60.1.70245'}
export default function LaunchBuildGuide({id}:{id:LaunchClass}) {
  const [activity, setActivity] = useState<keyof typeof buildActivities>('leveling')
  const route = launchChoices[id][activity]
  const build = launchAllocation(id, activity)
  return <section id="launch-builds" className="wow-review shell" aria-labelledby="launch-build-heading">
    <header><p className="wow-review-date">Launch builds · November 15, 2026</p><h2 id="launch-build-heading">Choose a build for your next session</h2>
      <p>These allocations use Forever XP’s launch tree for client 1.60.1.70938. The BuildForgeTools calculator below uses the older Beta snapshot {archive[id]}.</p></header>
    <div className="wow-review-options" aria-label="Build activity">{(Object.keys(buildActivities) as Array<keyof typeof buildActivities>).map(key =>
      <button type="button" key={key} aria-pressed={activity === key} onClick={() => setActivity(key)}>{buildActivities[key]}</button>)}</div>
    <article aria-live="polite"><p className="wow-review-date">Level {build.level} · {build.totals.join(' / ')} · {build.level - 9} points</p>
      <h3>{route.name}</h3><p>{route.choice} {route.action}</p>
      <details key={activity}><summary>Inspect allocated ranks</summary><div className="wow-rank-grid">{build.trees.filter(t => t.selected.length).map(tree =>
        <section key={tree.tree}><h4>{tree.tree}</h4><ul>{tree.selected.map(([name, rank, cap]) => <li key={name}><span>{name}</span><b>{rank}/{cap}</b></li>)}</ul></section>)}</div></details>
      <p><a href={build.href} className="button primary">Edit allocated build on Forever XP ↗</a></p>
      <small>Allocation and playstyle are editorial choices. <a href={route.source}>{route.credit}</a>.</small>
    </article>
    <details className="wow-build-options"><summary>Compare all four launch builds</summary>
      <table className="wow-route-table"><caption>Level, purpose and complete talent allocation</caption><thead><tr><th scope="col">Build</th><th scope="col">Level</th><th scope="col">When to use it</th></tr></thead>
      <tbody>{(Object.keys(buildActivities) as Array<keyof typeof buildActivities>).map(key => {
        const option = launchChoices[id][key]
        const allocation = launchAllocation(id, key)
        return <tr key={key}><th scope="row"><a href={allocation.href}>{buildActivities[key]} · {option.name}</a></th><td>{allocation.level}</td><td>{option.choice}</td></tr>
      })}</tbody></table>
      <p>Changing roles regularly? <a href="/wow-forever-respec-cost-calculator">Compare respec fees with dual spec</a>. For handheld play, <a href="/wow-forever-steam-deck">plan your controller bindings</a>.</p>
    </details>
    <aside><strong>Live combat changes</strong><p>{launchEvidence[id]} <a href={launchHotfixes}>Blizzard hotfixes through November 13</a>.</p></aside>
  </section>
}
