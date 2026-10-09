export type EmbervillePageId = 'planner' | 'classes' | 'inheritance'

export const EMBERVILLE_STATUS = {
  phase: 'Pre-Early Access',
  scope: 'Core mechanics only',
  updated: 'Sep 27, 2026',
  releaseDate: 'Oct 27, 2026',
} as const

export const EMBERVILLE_SOURCES = [
  { label: 'Official Steam page', href: 'https://store.steampowered.com/app/2295170/Emberville/' },
  { label: 'Official developer overview', href: 'https://www.cygnuscross.com/welcome-to-emberville' },
] as const

export const EMBERVILLE_MECHANICS = [
  'Equipment and skill systems',
  'Melee, magic, and ranged combat',
  'Combat class system',
  'Classes can be changed',
  'Active and passive skill inheritance',
] as const

export interface EmbervillePageRecord {
  id: EmbervillePageId
  slug: string
  title: string
  metaTitle: string
  description: string
  eyebrow: string
  heroImage: string
}

export interface EmbervilleEditorialSection {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export const EMBERVILLE_PAGES: EmbervillePageRecord[] = [
  { id: 'planner', slug: 'emberville', title: 'Emberville Preview Notebook', metaTitle: 'Emberville Preview Notebook & Confirmed Mechanics | BuildForgeTools', description: 'Review confirmed Emberville mechanics, choose a combat direction, and save private notes in this browser. This preview notebook cannot validate game builds or inheritance compatibility.', eyebrow: 'A world rebuilds in ash', heroImage: '/images/emberville/planner-hero.jpg' },
  { id: 'classes', slug: 'emberville-classes', title: 'Emberville Classes', metaTitle: 'Emberville Classes | Confirmed Systems & Planning', description: 'Learn what is officially confirmed about Emberville classes, switching classes, weapons, and progression before Early Access.', eyebrow: 'Choose a foundation', heroImage: '/images/emberville/classes-hero.jpg' },
  { id: 'inheritance', slug: 'emberville-skill-inheritance', title: 'Emberville Skill Inheritance Guide', metaTitle: 'Emberville Skill Inheritance Guide | BuildForgeTools', description: 'Understand how confirmed active and passive skill inheritance can shape an Emberville build.', eyebrow: 'Different classes, brighter builds', heroImage: '/images/emberville/inheritance-hero.jpg' },
]

export const EMBERVILLE_EDITORIAL: Record<EmbervillePageId, EmbervilleEditorialSection[]> = {
  planner: [
    {
      heading: 'What the preview notebook can do today',
      paragraphs: [
        'The Emberville Preview Notebook starts with combat direction because melee, magic, and ranged combat are confirmed for Early Access. You can choose one of those directions, or keep a hybrid direction in view when thinking about class and skill inheritance. The notebook summary changes with your choice, while local notes let you record ideas without presenting them as verified game data.',
        'Choose a confirmed system to investigate alongside your combat direction: class switching, weapon-bound combos, or active and passive skill inheritance. The notebook turns these into a question to investigate and leaves space for your own notes. Reviewed class and weapon names can now be selected with source links. Observed skills retain separate name, effect, type, and inheritance evidence, so a known name does not turn an unconfirmed combination into a game fact.',
      ],
    },
    {
      heading: 'How notebook evidence is reviewed',
      paragraphs: [
        'The notebook distinguishes confirmed systems, reviewed names and observations, and unknown rules. A confirmed system tells us that a mechanic exists. A reviewed name can serve as a research reference while its unlock requirements, skill type, or compatibility remain unknown. Selecting a reference records your intention; it does not establish a playable combination.',
      ],
      bullets: [
        'Class entries retain their name sources while unknown roles and unlock requirements stay separate.',
        'Weapon entries are sourced category examples; selecting one does not establish class compatibility.',
        'Observed skill names and effects remain references while active or passive types are unknown.',
        'Inheritance destinations, slots, costs, and compatibility remain unknown until supported by evidence.',
      ],
    },
    {
      heading: 'Choose a build direction before choosing details',
      paragraphs: [
        'Emberville describes action-focused combat built around positioning, timing, knowledge, weapon-bound combos, classes, and learned skills. That makes a build more than a list of equipment. A useful starting point is the way you want to approach a fight: close-range pressure, spell-focused control, ranged spacing, or a hybrid idea that depends on inherited skills.',
        'These four directions are planning lenses rather than published meta builds. They help organize future class, weapon, and skill data while Early Access details are still developing.',
      ],
    },
    {
      heading: 'Turn a direction into questions to test',
      paragraphs: [
        'Start with a combat direction, then use reviewed class and weapon names as tentative references. Weapon-bound combos make weapon choice part of the build structure, while the class system supplies a changing pool of abilities. Connect a particular class, weapon, or inherited skill only when compatibility is verified.',
        'The final step is testing. Emberville is entering Early Access, so balance, availability, and interactions can evolve with player feedback. A build should be treated as a versioned setup that can be revised when the game changes.',
      ],
      bullets: [
        'Melee planning emphasizes positioning, timing, and close-range weapon interactions.',
        'Magic and ranged planning remain separate directions until their exact classes and skills are verified.',
        'Hybrid planning depends on confirmed inheritance rules, not assumed combinations.',
        'No direction is labeled best until players can test stable Early Access data.',
      ],
    },
  ],
  classes: [
    {
      heading: 'How the Emberville class system affects a build',
      paragraphs: [
        'The official Steam description confirms a combat class system with a selection of classes that can be changed. A class therefore represents a current fighting style rather than an irreversible character choice. This matters for planning because players can experiment as they gain experience and complete quests instead of committing to a single permanent path at the start.',
        'The same description connects classes to distinctive gameplay and abilities. It also says learned classes can contribute active and passive skills through inheritance. Together, those facts make class progression a central part of the future planner.',
      ],
    },
    {
      heading: 'Class, weapon, and progression data status',
      paragraphs: [
        'The system is confirmed, but BuildForgeTools is not treating every preview name or creator-video label as a stable record. The reviewed catalog currently includes Knight from an official reveal and Wanderer from a September press hands-on. Sword, Bow, and Staff are category examples from the developer overview. Their presence does not establish a complete roster or class-specific weapon restrictions.',
        'Progression is also broader than combat. Official material connects character improvement to leveling, items, rescued villagers, exploration, rebuilding, and quests. We will keep those systems separate from class mechanics unless a source shows a direct relationship.',
      ],
      bullets: [
        'Confirmed now: a combat class system and the ability to change classes.',
        'Confirmed now: classes have distinctive gameplay and abilities.',
        'Confirmed now: learned classes can provide active and passive inheritance options.',
        'In review: the complete class list, unlock order, requirements, and exact ability records.',
      ],
    },
  ],
  inheritance: [
    {
      heading: 'Active and passive inheritance are separate planning layers',
      paragraphs: [
        'Emberville officially describes combat classes that can inherit both passive and active skills from other learned classes. Active and passive are therefore useful categories in the planner, but the current sources do not establish slot counts, costs, transfer limits, or every compatibility rule.',
        'An active inherited skill represents an action the player may be able to add to a setup. A passive inherited skill represents a lasting modifier or condition. Those descriptions explain the planning distinction only; individual effects will stay unavailable until their game records can be verified.',
      ],
    },
    {
      heading: 'From a learned class to a final build',
      paragraphs: [
        'The planning flow begins with a base class, expands when another class is learned, and then considers which confirmed active or passive options can be inherited. Weapon-bound combos and the player’s preferred combat direction remain part of the final setup, so inheritance should be evaluated in context instead of as an isolated list of powerful skills.',
        'BuildForgeTools will preserve that relationship when data arrives: a skill will retain its source class, type, verification state, and known compatibility evidence. This makes it possible to update a rule without silently rewriting every build that uses it.',
      ],
    },
    {
      heading: 'Future compatibility matrix',
      paragraphs: [
        'The compatibility matrix is available as an evidence reference. Its purpose will be to show a base class on one axis and learned-class skills on the other, with each intersection marked confirmed, unavailable, or still unverified. The first matrix now connects reviewed class names to observed skill names. Cells remain unknown until destination-class compatibility can be verified.',
      ],
      bullets: [
        'Source class and skill type must be known before a row appears.',
        'A compatible state requires direct game data or consistent testing evidence.',
        'Restrictions and costs will be stored separately from skill descriptions.',
        'Every matrix update will carry a source and data-version label.',
      ],
    },
  ],
}

export function embervillePageById(id: EmbervillePageId): EmbervillePageRecord {
  return EMBERVILLE_PAGES.find((page) => page.id === id) ?? EMBERVILLE_PAGES[0]
}
