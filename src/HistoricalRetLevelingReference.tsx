import historicalContent from './content/retribution-leveling-build.json'
import { RETRIBUTION_LEVELING_BUILD } from './data/builds'
import { branchNames, historicalTalents } from './data/talents'

/** Preserve the original allocation and section anchors after retiring its duplicate entry page. */
export default function HistoricalRetLevelingReference() {
  const selected = historicalTalents.filter(talent => (RETRIBUTION_LEVELING_BUILD.build[talent.id] ?? 0) > 0)

  return <section className="landing-content-section" id="ret-history" aria-label="Historical Retribution leveling reference">
    <header>
      <div className="eyebrow">Archived Beta allocation · 1.60.1.69913</div>
      <h2>Historical Retribution leveling reference: 20/0/31</h2>
      <p>This earlier allocation spends 20 Holy and 31 Retribution points. Crusade is absent from the reviewed 70245 tree, so the original ranks remain read-only history rather than a preset for the planner above. No official Crusade removal announcement is claimed.</p>
    </header>
    <section id="talent-allocation" aria-label="Historical selected talents">
      <h3>Original selected talents</h3>
      <div className="decision-table-scroll"><table className="decision-table">
        <caption>Historical 20/0/31 selected talents</caption>
        <thead><tr><th scope="col">Tree</th><th scope="col">Talent</th><th scope="col">Selected rank</th></tr></thead>
        <tbody>{selected.map(talent => <tr key={talent.id}><td>{branchNames[talent.branch]}</td><th scope="row">{talent.name}</th><td>{RETRIBUTION_LEVELING_BUILD.build[talent.id]}/{talent.maxRank}</td></tr>)}</tbody>
      </table></div>
    </section>
    {historicalContent.sections.map(section => <section id={section.id} key={section.id}>
      <h3>{section.heading}</h3>
      {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
    </section>)}
    <p><a href="/build?id=#calculator">Start a blank reviewed 70245 planner</a> · <a href="/wow-forever-paladin-builds">Review launch builds and their separate source status</a></p>
  </section>
}
