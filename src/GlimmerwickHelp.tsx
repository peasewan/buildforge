import { useState } from 'react'
import { ArrowRight, CircleHelp } from 'lucide-react'
import { GARDEN_WELL_HELP, SPELLCASTING_HELP } from './data/glimmerwickHelp'
import { track } from './lib/analytics'

export default function GlimmerwickHelp({ kind }: { kind: 'spellcasting' | 'garden-well' }) {
  const choices = kind === 'spellcasting' ? SPELLCASTING_HELP : GARDEN_WELL_HELP
  const [selectedId, setSelectedId] = useState(choices[0].id)
  const selected = choices.find(choice => choice.id === selectedId) ?? choices[0]
  const title = kind === 'spellcasting' ? 'What is stopping your spell?' : 'Before you use the garden well'
  const resultName = kind === 'spellcasting' ? 'Spellcasting help result' : 'Garden well help result'
  return <section className="gw-help" id={`${kind}-help`} aria-labelledby={`${kind}-help-title`}>
    <div className="gw-help-heading"><span><CircleHelp size={18} aria-hidden="true" /> QUICK HELP</span><h2 id={`${kind}-help-title`}>{title}</h2><p>Choose the problem you are seeing. Each answer keeps its game-version evidence attached.</p></div>
    <div className="gw-help-layout">
      <div className="gw-help-options" role="group" aria-label={title}>{choices.map(choice => <button key={choice.id} type="button" aria-pressed={selected.id === choice.id} aria-controls={`${kind}-help-result`} onClick={() => {
        setSelectedId(choice.id)
        track('glimmerwick_help_select', { topic: kind, issue: choice.id })
      }}>{choice.label}<ArrowRight size={16} aria-hidden="true" /></button>)}</div>
      <section id={`${kind}-help-result`} className="gw-help-result" aria-label={resultName} aria-live="polite">
        <span className="gw-help-version">{selected.version}</span><h3>{selected.title}</h3><p>{selected.evidence}</p><p><strong>What to do: </strong>{selected.action}</p>
        <div className="gw-help-links"><a href={selected.source} target="_blank" rel="noreferrer">{selected.sourceLabel} ↗</a>{selected.nextHref && <a href={selected.nextHref}>{selected.nextLabel} →</a>}</div>
      </section>
    </div>
  </section>
}
