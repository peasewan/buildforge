import { ArrowRight } from 'lucide-react'
import { expansionProfiles } from '../data/expansion/profiles'
import { classPlannerHref, publishedClassPages, type ClassBuild, type ClassDefinition, type ClassPageDefinition } from '../lib/classPage'
import { encodePlannerBuild } from '../lib/talentPlanner'
import './class-signature.css'

export interface ClassSignatureProps {
  classDef: ClassDefinition
  page: ClassPageDefinition
}

type SignatureClass = 'warrior' | 'mage' | 'rogue' | 'priest' | 'druid' | 'warlock' | 'hunter' | 'shaman'
const patterns: Record<SignatureClass, { feature: ClassPageDefinition['kind']; core: string; pattern: string; action: string }> = {
  warrior: { feature: 'pvp', core: 'arms', pattern: 'rage-cycle', action: 'Test the Rage route' },
  mage: { feature: 'aoe', core: 'frost', pattern: 'cast-window', action: 'Open the cast route' },
  rogue: { feature: 'pvp', core: 'combat', pattern: 'opener-cycle', action: 'Rehearse the opener' },
  priest: { feature: 'healing', core: 'shadow', pattern: 'recovery-ledger', action: 'Compare the mana route' },
  druid: { feature: 'tank', core: 'feral', pattern: 'form-switch', action: 'Plan the chosen form' },
  warlock: { feature: 'pet', core: 'affliction', pattern: 'pet-compact', action: 'Plan with the same demon' },
  hunter: { feature: 'pet', core: 'beast-mastery', pattern: 'distance-track', action: 'Keep range in the test' },
  shaman: { feature: 'totem', core: 'enhancement', pattern: 'totem-field', action: 'Plan around placement' },
}
const supported = (id: string): id is SignatureClass => Object.prototype.hasOwnProperty.call(patterns, id)
const profileFor = (id: string) => expansionProfiles.find((profile) => profile.id === id)

function pageFocus(def: ClassDefinition, page: ClassPageDefinition): string {
  const profile = profileFor(def.id)
  if (!profile) return page.sections[0]?.paragraphs[0] ?? page.description
  if (page.kind === 'buildsHub') return profile.intro
  if (page.kind === 'leveling') return profile.leveling
  if (page.kind === 'specBuild') return profile.specs.find((spec) => spec.id === page.spec)?.test ?? page.description
  return profile.extras.find((extra) => extra.kind === page.kind)?.lead ?? page.description
}

function routeBuild(def: ClassDefinition, page: ClassPageDefinition): ClassBuild | undefined {
  const paths = new Set(publishedClassPages([def]).map(({ page: entry }) => `/${entry.slug}`))
  return [page.primaryBuildId, ...def.recommendedBuildIds]
    .map((id) => def.builds.find((build) => build.id === id && paths.has(build.href)))
    .find((build) => build !== undefined)
}

function firstTalentNames(def: ClassDefinition, build: ClassBuild): string[] {
  const byId = new Map(def.talents.map((talent) => [talent.id, talent.name]))
  return build.order.slice(0, 3).map((id) => byId.get(id)).filter((name): name is string => Boolean(name))
}

function SignatureBody({ id, def, build, focus, names }: { id: SignatureClass; def: ClassDefinition; build: ClassBuild; focus: string; names: string[] }) {
  const profile = profileFor(id)
  const first = names[0] ?? def.branchNames[build.spec] ?? build.spec
  const second = names[1] ?? build.role
  switch (id) {
    case 'warrior': return <div className="cs-rage-cycle">
      <div className="cs-rage-readout"><span>Pull</span><strong>Rage</strong><span>Next pull</span></div>
      <ol><li><b>Enter</b><span>{build.playstyle[0] ?? focus}</span></li><li><b>Spend</b><span>{first} → {second}</span></li><li><b>Review</b><span>{focus}</span></li></ol>
    </div>
    case 'mage': return <div className="cs-cast-window">
      <div className="cs-cast-head"><span>CONTROL WINDOW</span><strong>{def.branchNames[build.spec] ?? build.spec}</strong></div>
      <div className="cs-cast-track" aria-hidden="true"><span /><span /><span /></div>
      <dl><div><dt>Set up</dt><dd>{first}</dd></div><div><dt>Commit</dt><dd>{second}</dd></div><div><dt>Recover</dt><dd>Include mana and control in the next test.</dd></div></dl>
      <p>{focus}</p>
    </div>
    case 'rogue': return <div className="cs-opener-cycle"><ol>
      <li><span className="cs-number">01</span><div><b>Opening position</b><p>{profile?.pvp}</p></div></li>
      <li><span className="cs-number">02</span><div><b>Combo-point cycle</b><p>{first} → {second}</p></div></li>
      <li><span className="cs-number">03</span><div><b>Recovery</b><p>{focus}</p></div></li>
    </ol></div>
    case 'priest': return <div className="cs-recovery-ledger">
      <div className="cs-ledger-heading"><span>SOLO PRESSURE</span><span>GROUP SUPPORT</span></div>
      <div className="cs-ledger-lines"><p>{profile?.specs.find((spec) => spec.id === 'shadow')?.test}</p><p>{profile?.specs.find((spec) => spec.id === 'holy')?.test}</p></div>
      <div className="cs-ledger-total"><b>Mana and recovery window</b><span>{focus}</span></div>
    </div>
    case 'druid': return <div className="cs-form-switch">
      <div className="cs-form-axis">Pick the form and role before comparing points</div>
      <div className="cs-form-paths">{profile?.specs.map((spec) => <div key={spec.id}><b>{spec.name}</b><span>{spec.role}</span></div>)}</div>
      <p>{focus}</p>
    </div>
    case 'warlock': return <div className="cs-pet-compact">
      <div className="cs-caster-side"><span>CASTER CYCLE</span><strong>{def.branchNames[build.spec] ?? build.spec}</strong><p>{profile?.specs.find((spec) => spec.id === 'affliction')?.test}</p></div>
      <div className="cs-pet-join" aria-hidden="true">+</div>
      <div className="cs-pet-side"><span>PET CYCLE</span><strong>Demonology</strong><p>{profile?.specs.find((spec) => spec.id === 'demonology')?.test}</p></div>
      <p className="cs-pet-foot">{focus}</p>
    </div>
    case 'hunter': return <div className="cs-distance-track">
      <div className="cs-range-track"><span>Too close</span><i aria-hidden="true" /><span>Useful range</span></div>
      <div className="cs-distance-detail"><div><b>Pet control</b><p>{profile?.specs.find((spec) => spec.id === 'beast-mastery')?.test}</p></div><div><b>Ranged uptime</b><p>{profile?.specs.find((spec) => spec.id === 'marksmanship')?.test}</p></div></div>
      <p>{focus}</p>
    </div>
    case 'shaman': return <div className="cs-totem-field">
      <div className="cs-field-marker"><span>PARTY POSITION</span><b>Totem placement</b><small>Move the test with the group</small></div>
      <div className="cs-field-notes"><p>{profile?.specs.find((spec) => spec.id === 'restoration')?.test}</p><p>{focus}</p></div>
    </div>
  }
}

export function ClassSignature({ classDef, page }: ClassSignatureProps) {
  if (!supported(classDef.id)) return null
  const id = classDef.id
  const config = patterns[id]
  const eligible = page.kind === 'buildsHub' || page.kind === 'leveling' || page.kind === config.feature || (page.kind === 'specBuild' && page.spec === config.core)
  if (!eligible) return null
  const build = routeBuild(classDef, page)
  if (!build) return null
  return <section className="class-signature" data-class-signature={id} data-signature-pattern={config.pattern} aria-label={`${classDef.name} planning question`}>
    <div className="cs-intro"><span className="cs-kicker">{classDef.name.toUpperCase()} / PLANNING QUESTION</span><h2>{classDef.name}: what changes the next pull?</h2><p>{page.kind === 'buildsHub' ? 'Choose a route to test.' : page.kind === 'leveling' ? 'Compare full pull-and-recovery cycles.' : page.kind === config.feature ? 'Match the setup to this role.' : 'Keep the test conditions stable while you edit.'}</p></div>
    <SignatureBody id={id} def={classDef} build={build} focus={pageFocus(classDef, page)} names={firstTalentNames(classDef, build)} />
    <div className="cs-outro"><span>Editorial test prompt · Client talent records reviewed through {classDef.verifiedBuild}; build performance is unverified.</span><a href={classPlannerHref(classDef, encodePlannerBuild(build.build), build.level)}>{config.action} <ArrowRight size={15} aria-hidden="true" /></a></div>
  </section>
}

export default ClassSignature
