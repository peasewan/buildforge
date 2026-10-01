import { useState } from 'react'
import VerificationBadge from '../VerificationBadge'

const SOURCE = 'https://news.blizzard.com/en-us/article/24301515/world-of-warcraft-forever-class-deep-dives-hunter-and-druid'

const updateBySlug = {
  'wow-forever-hunter-builds': 'hub',
  'wow-forever-beast-mastery-vs-marksmanship-hunter-leveling': 'comparison',
  'wow-forever-hunter-pvp-build': 'pvp',
  'wow-forever-hunter-pet-build': 'pet',
} as const

type UpdateKind = typeof updateBySlug[keyof typeof updateBySlug]

// Names and effects are from Blizzard's Sep 30 Hunter class design note, not the 69913 talent import.
const petFamilies = [
  { family: 'Bat', ability: 'Sonic Blast', effect: 'Damages the target and slows spellcasting.' },
  { family: 'Bear', ability: 'Swipe', effect: 'Damages up to three targets.' },
  { family: 'Bird of Prey', ability: 'Mine!', effect: 'Damages and disarms the target.' },
  { family: 'Boar', ability: 'Charge', effect: 'Immobilizes the target and increases the pet’s next attack power.' },
  { family: 'Carrion Bird', ability: 'Demoralizing Screech', effect: 'Damages nearby enemies and lowers their melee attack power.' },
  { family: 'Cat', ability: 'Prowl', effect: 'Enters stealth and increases the next attack from stealth.' },
  { family: 'Crab', ability: 'Pinch', effect: 'Damages and slows the target.' },
  { family: 'Crocolisk', ability: 'Dismember', effect: 'Damages the target and reduces healing received by 50%.' },
  { family: 'Fox', ability: "Trickster's Dance", effect: 'Increases pet dodge chance and attack speed for 12 seconds.' },
  { family: 'Gorilla', ability: 'Thunderstomp', effect: 'Damages enemies in an area.' },
  { family: 'Hyena', ability: 'Tendon Rip', effect: 'Slows the target and applies a bleed over time.' },
  { family: 'Raptor', ability: 'Savage Rend', effect: 'Applies a bleed over time.' },
  { family: 'Scorpid', ability: 'Poison', effect: 'Applies stacking damage over time.' },
  { family: 'Spider', ability: 'Web', effect: 'Immobilizes the target and deals damage over time.' },
  { family: 'Tallstrider', ability: 'Dust Cloud', effect: 'Reduces the target’s armor.' },
  { family: 'Turtle', ability: 'Shell Shield', effect: 'Reduces damage taken and attack speed for 12 seconds.' },
  { family: 'Windserpent', ability: 'Lightning Breath', effect: 'Damages a target from 20 yards away.' },
  { family: 'Wolf', ability: 'Furious Howl', effect: 'Increases party members’ melee attack power.' },
] as const

// eslint-disable-next-line react-refresh/only-export-components
export function isHunterOfficialUpdatePage(slug: string): slug is keyof typeof updateBySlug {
  return Object.hasOwn(updateBySlug, slug)
}

function PetFamilyLookup() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<(typeof petFamilies)[number] | null>(null)
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const matches = petFamilies.filter(({ family, ability, effect }) =>
    `${family} ${ability} ${effect}`.toLocaleLowerCase().includes(normalizedQuery),
  )
  return <div className="hunter-official-pets">
    <p>Blizzard describes one unique ability per pet family, including the new Fox family. This is a family-ability lookup, not a pet damage comparison or a pet talent tree.</p>
    <label className="hunter-official-search">
      Search pet family or ability
      <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setSelected(null) }} placeholder="Try Fox, Web or slow" />
    </label>
    <p className="hunter-official-count">{matches.length} of {petFamilies.length} families shown</p>
    <div className="hunter-official-family-list">
      {matches.map((entry) => <button key={entry.family} type="button" aria-label={`View ${entry.family} family ability`} aria-pressed={selected?.family === entry.family} onClick={() => setSelected(entry)}>
        <strong>{entry.family}</strong><span>{entry.ability}</span>
      </button>)}
    </div>
    {matches.length === 0 && <p>No matching family or ability. Try a different term.</p>}
    <p className="hunter-official-selected" role="status" aria-live="polite">{selected
      ? `${selected.family} — ${selected.ability}: ${selected.effect}`
      : 'Select a family to see its announced ability.'}</p>
    <p>Blizzard says pet stats increase with Hunter gear, but provides no scaling formula. Family availability, damage comparisons and a separate pet talent tree are not verified by this note.</p>
  </div>
}

function UpdateBody({ kind }: { kind: UpdateKind }) {
  if (kind === 'hub') return <div className="hunter-official-facts">
    <p><strong>Aimed Shot:</strong> Aimed Shot is now a baseline Hunter ability at level 20.</p>
    <p><strong>Traps:</strong> Hunter traps can be used in combat with a cooldown of 30 seconds.</p>
    <p><strong>Pets:</strong> Blizzard says pet stats increase based on the Hunter's gear, but gives no scaling formula.</p>
  </div>
  if (kind === 'comparison') return <div className="hunter-official-facts">
    <p><strong>Beast Mastery:</strong> Summon Hawk is an announced 16-point milestone.</p>
    <p><strong>Marksmanship:</strong> Lone Wolf is an announced 11-point milestone for playing without an active pet.</p>
    <p><strong>Marksmanship:</strong> Trueshot Aura moves to the 21-point milestone.</p>
    <p>The editable calculator is still a Level 20 plan with 11 points. This official design note is not a verified Level 30 route.</p>
  </div>
  if (kind === 'pvp') return <div className="hunter-official-facts">
    <p>Hunter traps can now be used in combat with a 30-second cooldown.</p>
    <p>Fire-based and Frost-based traps have separate cooldowns.</p>
    <p>Use these announced ability rules as questions to check in beta play; the PvP allocation below remains an editorial testing route.</p>
  </div>
  return <PetFamilyLookup />
}

const headings: Record<UpdateKind, string> = {
  hub: 'Hunter ability changes to watch',
  comparison: 'New Beast Mastery and Marksmanship milestones',
  pvp: 'Trap rules for Hunter PvP planning',
  pet: 'Find an announced pet family ability',
}

export default function HunterOfficialUpdate({ slug }: { slug: keyof typeof updateBySlug }) {
  const kind = updateBySlug[slug]
  return <section className="hunter-official" aria-label="Hunter official class deep dive">
    <div className="hunter-official-heading"><span>BLIZZARD DESIGN NOTE</span><VerificationBadge status="official" /></div>
    <h2>{headings[kind]}</h2>
    <p className="hunter-official-source">Published Sep 30, 2026 · <a href={SOURCE} target="_blank" rel="noreferrer">Blizzard class deep dive</a></p>
    <UpdateBody kind={kind} />
    <p className="hunter-official-boundary">The editable talent data still comes from client build 1.60.1.69913. This later official design note does not verify those talent nodes or establish that a higher level cap is open.</p>
  </section>
}
