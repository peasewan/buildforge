import { CircleHelp, ExternalLink, ShieldCheck } from 'lucide-react'
import { EMBERVILLE_CATALOG } from './data/embervilleCatalog'
import type { EmbervilleDataset, SourcedFact } from './lib/embervilleData'

const labels = { official: 'Official source', client_datamined: 'Client datamined', client_verified: 'Client verified', community_verified: 'Community / press preview', derived_assumption: 'Assumption' }
export function EmbervilleFactEvidence({ fact, data = EMBERVILLE_CATALOG }: { fact: SourcedFact<unknown>; data?: EmbervilleDataset }) {
  return <div className={`ember-fact-evidence ${fact.value === null ? 'unknown' : ''}`}>
    <span>{fact.value === null ? <CircleHelp size={14} /> : <ShieldCheck size={14} />}{fact.verificationStatus ? labels[fact.verificationStatus] : 'Not yet verified'}</span>
    {fact.sourceIds.map(id => { const source = data.sources.find(item => item.id === id); return source && <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.label}<ExternalLink size={12} /></a> })}
    {fact.note && <small>{fact.note}</small>}
  </div>
}

export function EmbervilleCatalogReference({ section }: { section: 'classes' | 'inheritance' }) {
  const data = EMBERVILLE_CATALOG
  return <section className="ember-section ember-catalog" aria-labelledby={`catalog-${section}`}>
    <p className="ember-kicker">REVIEWED PREVIEW RECORDS · {data.reviewedAt}</p>
    <h2 id={`catalog-${section}`}>{section === 'classes' ? 'Classes with traceable sources' : 'Inheritance evidence and open questions'}</h2>
    <p>Reviewed names are a starting point for planning. A known name does not confirm its unlock requirements, skill type, or compatible combinations.</p>
    {section === 'classes' ? <div className="ember-record-grid">{data.classes.map(record => <article className="ember-panel" key={record.id}><h3>{record.name.value}</h3><p>{record.description.value}</p><EmbervilleFactEvidence fact={record.name} /><a className="ember-button secondary" href="/emberville#planner">Plan a class direction</a></article>)}</div> : <>
      <div className="ember-rule-grid">{([['Active inheritance slots', data.rules.activeSlots], ['Passive inheritance slots', data.rules.passiveSlots], ['Inheritance unlock level', data.rules.unlockLevel]] as const).map(([label, fact]) => <article className="ember-panel" key={label}><h3>{label}</h3><strong>{fact.value ?? 'Unknown'}</strong><EmbervilleFactEvidence fact={fact} /></article>)}</div>
      <h3>Observed skills awaiting inheritance review</h3>
      <div className="ember-record-grid">{data.skills.map(skill => <article className="ember-panel" key={skill.id}><h3>{skill.name.value}</h3><p>{skill.effect.value}</p><EmbervilleFactEvidence fact={skill.effect} /><p>Active / passive type: {skill.type.value ?? 'Not verified'}. Inheritance eligibility: {skill.inheritance.value === null ? 'Not verified' : skill.inheritance.value ? 'Confirmed' : 'Not inheritable'}.</p></article>)}</div>
      <h3>Compatibility matrix</h3><p>Each cell needs destination-class evidence. No combination below has been marked compatible yet.</p>
      <div className="ember-table-scroll"><table className="ember-compatibility"><caption>Preview inheritance compatibility — {data.reviewedAt}</caption><thead><tr><th scope="col">Base class</th>{data.skills.map(skill => <th scope="col" key={skill.id}>{skill.name.value}</th>)}</tr></thead><tbody>{data.classes.map(record => <tr key={record.id}><th scope="row">{record.name.value}</th>{data.skills.map(skill => { const rule = data.rules.compatibility.find(item => item.baseClassId === record.id && item.skillId === skill.id); return <td key={skill.id}>{rule?.allowed.verificationStatus === 'derived_assumption' ? 'Assumption' : rule?.allowed.value === true ? 'Confirmed' : rule?.allowed.value === false ? 'Unavailable' : 'Needs verification'}</td> })}</tr>)}</tbody></table></div>
    </>}
    <p className="ember-catalog-version">Data version: {data.dataVersion}. {data.classes.length} reviewed class names · {data.weapons.length} weapon categories · {data.skills.length} observed skill names. This is a partial preview catalog.</p>
  </section>
}
