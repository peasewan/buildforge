import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { warriorClass } from '../data/classes/warrior'
import { druidClass } from '../data/classes/druid'
import { priestClass } from '../data/classes/priest'
import { warlockClass } from '../data/classes/warlock'
import { hunterClass } from '../data/classes/hunter'
import { shamanClass } from '../data/classes/shaman'
import type { ClassDefinition } from '../lib/classPage'
import {
  DungeonPlanner,
  HealingPlanner,
  PetPlanner,
  PvpPlanner,
  TankPlanner,
  TotemPlanner,
} from './RoleIntentSurfaces'

afterEach(cleanup)

function page(def: ClassDefinition, slug: string) {
  const result = def.pages.find((candidate) => candidate.slug === slug)
  if (!result) throw new Error(`Missing fixture page: ${slug}`)
  return result
}

function expectBuildBeforeGuidance(container: HTMLElement) {
  const surface = container.querySelector('.rs-surface')
  const allocation = surface?.querySelector('.rs-allocation')
  const guidance = surface?.querySelector('.rs-first')
  const evidence = surface?.querySelector('.rs-evidence')
  expect(surface?.firstElementChild?.contains(allocation ?? null)).toBe(true)
  expect(allocation).toBeTruthy()
  expect(guidance).toBeTruthy()
  expect(evidence).toBeTruthy()
  expect(surface?.querySelector('h2, h3')?.tagName).toBe('H2')
  expect(allocation!.compareDocumentPosition(guidance!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(guidance!.compareDocumentPosition(evidence!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
}

it('offers a PvP encounter focus and preserves a legal editable route', () => {
  const { container } = render(
    <PvpPlanner
      classDef={warriorClass}
      page={page(warriorClass, 'wow-forever-arms-warrior-pvp-build')}
    />,
  )
  expect(container.querySelector('[data-surface="pvp-matchup"]')).toBeTruthy()
  expectBuildBeforeGuidance(container)
  expect(screen.getByRole('heading', { name: 'Set the encounter focus' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Recovery and exit' }))
  expect(screen.getByRole('button', { name: 'Recovery and exit' }).getAttribute('aria-pressed')).toBe('true')
  const link = screen.getByRole('link', { name: 'Edit in Calculator' })
  expect(new URL(link.getAttribute('href')!, 'https://buildforgetools.com').searchParams.get('build')).toContain('warrior-arms')
  expect(screen.getByText(/same talent allocation/)).toBeTruthy()
})

it('shows the Hunter PvP build and calculator link before optional encounter prompts', () => {
  const { container } = render(
    <PvpPlanner
      classDef={hunterClass}
      page={page(hunterClass, 'wow-forever-hunter-pvp-build')}
    />,
  )
  expectBuildBeforeGuidance(container)
  expect(screen.getByText('0/0/11')).toBeTruthy()
  const link = screen.getByRole('link', { name: 'Edit in Calculator' })
  const url = new URL(link.getAttribute('href')!, 'https://buildforgetools.com')
  expect(url.pathname).toBe('/hunter')
  expect(url.searchParams.get('level')).toBe('20')
  expect(url.searchParams.get('build')).toContain('hunter-')
  fireEvent.click(screen.getByRole('button', { name: 'Trap window preserves distance' }))
  expect(screen.getByRole('button', { name: 'Trap window preserves distance' }).getAttribute('aria-pressed')).toBe('true')
  expect(container.querySelector('.rs-evidence')?.textContent).toContain('Entrapment')
  expect(container.querySelector('.rs-evidence')?.textContent).not.toContain('Deterrence')
})

it('compares the three Hunter Level 20 directions without labeling ordinary routes as PvP-tested', () => {
  render(<PvpPlanner classDef={hunterClass} page={page(hunterClass, 'wow-forever-hunter-pvp-build')} />)
  const choices = within(screen.getByRole('region', { name: 'Hunter PvP starting points' }))
  for (const spec of ['Beast Mastery', 'Marksmanship', 'Survival']) {
    expect(choices.getByRole('heading', { name: spec })).toBeTruthy()
  }
  expect(choices.getByText(/only Survival has a published PvP testing route/i)).toBeTruthy()
  expect(choices.getByText(/pet uptime under opponent control/i)).toBeTruthy()
  expect(choices.getByText(/ranged attacks under pressure/i)).toBeTruthy()
  expect(choices.getByText(/escape after an opponent reaches melee range/i)).toBeTruthy()
  const bm = choices.getByRole('link', { name: 'Open blank Hunter Calculator for archived Beast Mastery route' })
  const bmUrl = new URL(bm.getAttribute('href')!, 'https://buildforgetools.com')
  expect(bmUrl.pathname).toBe('/hunter')
  expect(bmUrl.searchParams.has('build')).toBe(true)
  expect(bmUrl.searchParams.get('build')).toBe('')
  expect(bmUrl.hash).toBe('#class-calculator')
  expect(bm.textContent).toMatch(/archived route/i)
  expect(choices.getByRole('link', { name: 'Hunter Pet Build' }).getAttribute('href')).toBe('/wow-forever-hunter-pet-build')
})

it.each([
  [PetPlanner, 'wow-forever-hunter-pet-build', 'Thick Hide'],
  [DungeonPlanner, 'wow-forever-hunter-dungeon-build', 'Aimed Shot'],
] as const)('keeps %s as a historical route with a blank calculator CTA', (Planner, slug, removedTalent) => {
  const { container } = render(<Planner classDef={hunterClass} page={page(hunterClass, slug)} />)
  const action = container.querySelector('.rs-allocation .ix-action') as HTMLAnchorElement
  expect(action.getAttribute('href')).toBe('/hunter?build=#class-calculator')
  expect(action.textContent).toMatch(/archived route/i)
  if (slug === 'wow-forever-hunter-dungeon-build') fireEvent.click(screen.getByRole('button', { name: 'Close-range or uncontrolled pulls' }))
  const row = [...container.querySelectorAll('.rs-evidence li')].find((candidate) => candidate.textContent?.includes(removedTalent))
  expect(row?.textContent).toContain('Removed in official update')
  expect(row?.querySelector('a[href*="news.blizzard.com"]')).toBeTruthy()
})

it('connects Hunter leveling, comparison and pet decisions back to the PvP page', () => {
  const pvp = '/wow-forever-hunter-pvp-build'
  for (const slug of ['wow-forever-hunter-leveling-build', 'wow-forever-beast-mastery-vs-marksmanship-hunter-leveling', 'wow-forever-hunter-pet-build']) {
    expect(page(hunterClass, slug).relatedPages.some((link) => link.href === pvp)).toBe(true)
  }
  expect(page(hunterClass, 'wow-forever-hunter-pvp-build').relatedPages.some((link) => link.href === '/wow-forever-beast-mastery-hunter-build')).toBe(true)
})

it('keeps a PvP page with no legal allocation explicit and unlinked', () => {
  const { container } = render(
    <PvpPlanner
      classDef={warriorClass}
      page={page(warriorClass, 'wow-forever-protection-warrior-pvp-build')}
    />,
  )
  expect(screen.getByRole('heading', { name: 'What can be planned now' })).toBeTruthy()
  expect(screen.getByText(/role-specific legal allocation has not been published/)).toBeTruthy()
  expect(screen.queryByRole('link', { name: 'Edit in Calculator' })).toBeNull()
  expect(container.querySelector('.rs-surface')?.firstElementChild?.classList.contains('rs-unavailable')).toBe(true)
})

it.each([
  ['PvP', PvpPlanner, warriorClass, 'wow-forever-arms-warrior-pvp-build'],
  ['dungeon', DungeonPlanner, warriorClass, 'wow-forever-protection-warrior-dungeon-build'],
  ['tank', TankPlanner, druidClass, 'wow-forever-feral-druid-tank-build'],
  ['healing', HealingPlanner, priestClass, 'wow-forever-priest-healing-build'],
  ['pet', PetPlanner, warlockClass, 'wow-forever-warlock-pet-build'],
  ['totem', TotemPlanner, shamanClass, 'wow-forever-shaman-totem-build'],
] as const)('shows unavailable first for a %s role without a legal build', (_role, Surface, def, slug) => {
  const { container } = render(<Surface classDef={{ ...def, builds: [] }} page={page(def, slug)} />)
  expect(container.querySelector('.rs-surface')?.firstElementChild?.classList.contains('rs-unavailable')).toBe(true)
  expect(screen.queryByRole('link', { name: 'Edit in Calculator' })).toBeNull()
})

it('limits the class PvP picker to reviewed PvP routes', () => {
  render(
    <PvpPlanner
      classDef={warriorClass}
      page={page(warriorClass, 'wow-forever-warrior-pvp-build')}
    />,
  )
  const select = screen.getByLabelText('PvP route') as HTMLSelectElement
  const options = Array.from(select.options).map((option) => option.value)
  expect(options).toEqual(expect.arrayContaining(['warrior-arms-pvp', 'warrior-fury-pvp']))
  expect(options.some((option) => option.includes('leveling'))).toBe(false)
  fireEvent.change(select, { target: { value: 'warrior-fury-pvp' } })
  expect(select.value).toBe('warrior-fury-pvp')
  expect(new URL(screen.getByRole('link', { name: 'Edit in Calculator' }).getAttribute('href')!, 'https://buildforgetools.com').searchParams.get('build')).toContain('warrior-fury')
})

it('prepares a dungeon pull using a phase control before showing the route', () => {
  const { container } = render(
    <DungeonPlanner
      classDef={warriorClass}
      page={page(warriorClass, 'wow-forever-protection-warrior-dungeon-build')}
    />,
  )
  expect(container.querySelector('[data-surface="dungeon-pull"]')).toBeTruthy()
  expectBuildBeforeGuidance(container)
  expect(screen.getByRole('heading', { name: 'Prepare a pull' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'After the pull' }))
  expect(screen.getByRole('button', { name: 'After the pull' }).getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByRole('link', { name: 'Edit in Calculator' })).toBeTruthy()
})

it('starts the tank route with threat and mitigation review, then lists selected ranks', () => {
  const { container } = render(
    <TankPlanner
      classDef={druidClass}
      page={page(druidClass, 'wow-forever-feral-druid-tank-build')}
    />,
  )
  expect(container.querySelector('[data-surface="tank-inventory"]')).toBeTruthy()
  expectBuildBeforeGuidance(container)
  expect(screen.getByRole('region', { name: 'Druid role conditions' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Cat positioning' }))
  expect(screen.getByRole('button', { name: 'Cat positioning' }).getAttribute('aria-pressed')).toBe('true')
  expect(container.querySelector('.rs-evidence')?.textContent).not.toContain('Feral Charge (Bear)')
  expect(screen.getByRole('heading', { name: 'Selected talent ranks' })).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Edit in Calculator' })).toBeTruthy()
})

it('preserves Priest healing decisions on the retained Holy dungeon page', () => {
  const { container } = render(
    <DungeonPlanner
      classDef={priestClass}
      page={page(priestClass, 'wow-forever-holy-priest-dungeon-build')}
    />,
  )
  expect(container.querySelector('[data-surface="dungeon-pull"]')).toBeTruthy()
  expectBuildBeforeGuidance(container)
  expect(screen.getByRole('heading', { name: 'What limits this Priest healing pull?' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Mana recovery limits the next pull' }))
  expect(screen.getByRole('button', { name: 'Mana recovery limits the next pull' }).getAttribute('aria-pressed')).toBe('true')
  expect(container.querySelector('.rs-evidence')?.textContent).toContain('Holy Nova')
  expect(container.querySelector('.rs-evidence')?.textContent).not.toContain('Divine Fury')
  expect(screen.getByRole('link', { name: 'Edit in Calculator' })).toBeTruthy()
})

it('compares Shaman healing casts with moving group support', () => {
  const { container } = render(
    <HealingPlanner
      classDef={shamanClass}
      page={page(shamanClass, 'wow-forever-restoration-shaman-healing-build')}
    />,
  )
  expect(container.querySelector('[data-surface="healing-compare"]')).toBeTruthy()
  expectBuildBeforeGuidance(container)
  expect(screen.getByRole('heading', { name: 'What limits this Shaman healing pull?' })).toBeTruthy()
  expect(container.querySelector('.rs-evidence')?.textContent).toContain('Improved Healing Wave')
  fireEvent.click(screen.getByRole('button', { name: 'Moving group needs support' }))
  expect(container.querySelector('.rs-evidence')?.textContent).toContain('Totemic Mastery')
  expect(container.querySelector('.rs-evidence')?.textContent).not.toContain('Improved Healing Wave')
  expect(screen.getByRole('link', { name: 'Edit in Calculator' })).toBeTruthy()
})

it('shows selected pet-support ranks without inventing a pet-family dataset', () => {
  const { container } = render(
    <PetPlanner
      classDef={warlockClass}
      page={page(warlockClass, 'wow-forever-warlock-pet-build')}
    />,
  )
  expect(container.querySelector('[data-surface="pet-support"]')).toBeTruthy()
  expectBuildBeforeGuidance(container)
  expect(screen.getByRole('heading', { name: 'Which demon is part of this Warlock test?' })).toBeTruthy()
  expect(container.querySelector('.rs-evidence')?.textContent).toContain('Improved Voidwalker')
  expect(screen.getByText(/No pet scaling coefficient or best-pet ranking is verified/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Another demon is needed' }))
  expect(container.querySelector('.rs-evidence')?.textContent).toContain('Fel Domination')
  expect(container.querySelector('.rs-evidence')?.textContent).not.toContain('Improved Voidwalker')
  expect(screen.getByRole('link', { name: 'Edit in Calculator' })).toBeTruthy()
})

it('distinguishes verified talent records from unavailable and datamined rank tooltips', () => {
  const { container } = render(
    <PetPlanner
      classDef={warlockClass}
      page={page(warlockClass, 'wow-forever-warlock-pet-build')}
    />,
  )
  const row = (name: string) => Array.from(container.querySelectorAll('.rs-evidence li')).find((item) => item.querySelector('strong')?.textContent?.includes(name))
  expect(row('Improved Voidwalker')?.querySelector('small')?.textContent)
    .toBe('Talent record: Client verified · Rank tooltip: Unavailable')
  expect(row('Improved Voidwalker')?.querySelector('p')?.textContent)
    .toBe('General description (not rank-specific): Exact text for this rank is not available in the reviewed client transcription.')
  fireEvent.click(screen.getByRole('button', { name: 'Another demon is needed' }))
  expect(row('Fel Domination')?.querySelector('small')?.textContent)
    .toBe('Talent record: Client verified · Rank tooltip: Client datamined')
  expect(row('Fel Domination')?.querySelector('p')?.textContent)
    .toBe('Your next Imp, Voidwalker, Succubus, Incubus, or Felhunter Summon spell has its casting time reduced by 5.5 sec and its Mana cost reduced by 50%.')
})

it('marks an existing rank text unverified when its field evidence is unknown', () => {
  const talents = warlockClass.talents.map((talent) => talent.name === 'Fel Domination'
    ? { ...talent, fieldEvidence: { ...talent.fieldEvidence, rankDescriptions: 'unknown' as const } }
    : talent)
  const { container } = render(
    <PetPlanner
      classDef={{ ...warlockClass, talents }}
      page={page(warlockClass, 'wow-forever-warlock-pet-build')}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Another demon is needed' }))
  const row = Array.from(container.querySelectorAll('.rs-evidence li'))
    .find((item) => item.querySelector('strong')?.textContent?.includes('Fel Domination'))
  expect(row?.querySelector('small')?.textContent)
    .toBe('Talent record: Client verified · Rank tooltip: Unverified')
})

it('shows totem talent coverage and marks spell loadout as unverified', () => {
  const { container } = render(
    <TotemPlanner
      classDef={shamanClass}
      page={page(shamanClass, 'wow-forever-shaman-totem-build')}
    />,
  )
  expect(container.querySelector('[data-surface="totem-coverage"]')).toBeTruthy()
  expectBuildBeforeGuidance(container)
  expect(screen.getByRole('heading', { name: 'How does the party use this Shaman’s placement?' })).toBeTruthy()
  expect(container.querySelector('.rs-evidence')?.textContent).toContain('Totemic Focus')
  expect(screen.getByText(/loadout.*remain unverified/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Movement and healing dominate' }))
  expect(container.querySelector('.rs-evidence')?.textContent).toContain('Improved Healing Wave')
  expect(container.querySelector('.rs-evidence')?.textContent).not.toContain('Totemic Focus')
  expect(screen.getByRole('link', { name: 'Edit in Calculator' })).toBeTruthy()
})


it('changes the pet rank evidence and alternate calculator when the demon condition changes', () => {
  const route = {
    ...page(warlockClass, 'wow-forever-warlock-pet-build'),
    roleDecision: {
      question: 'Which demon is active?',
      options: [
        { id: 'voidwalker', label: 'Voidwalker active', explanation: 'Review the Voidwalker-specific rank before crediting the pet package.', talentIds: ['warlock-1225'] },
        { id: 'other', label: 'Another demon active', explanation: 'Improved Voidwalker is conditional on its named demon. Compare summon support and the Affliction starter.', talentIds: ['warlock-1226'], alternativeBuildId: 'warlock-affliction-starter' },
      ],
      sources: [{ label: 'Client talent table', url: 'https://wago.tools/db2/Talent?build=1.60.1.69913' }],
    },
  }
  const { container } = render(<PetPlanner classDef={warlockClass} page={route} />)
  const inventory = container.querySelector('.rs-evidence') as HTMLElement
  expect(inventory.textContent).toContain('Improved Voidwalker')
  expect(inventory.textContent).not.toContain('Fel Domination')
  const conditions = within(screen.getByRole('region', { name: 'Warlock role conditions' }))
  expect(conditions.queryByRole('link', { name: 'Compare Affliction in Calculator' })).toBeNull()
  fireEvent.click(conditions.getByRole('button', { name: 'Another demon active' }))
  expect(inventory.textContent).toContain('Fel Domination')
  expect(inventory.textContent).not.toContain('Improved Voidwalker')
  expect(conditions.getByText(/Improved Voidwalker is conditional/)).toBeTruthy()
  const target = new URL(conditions.getByRole('link', { name: 'Compare Affliction in Calculator' }).getAttribute('href')!, 'https://buildforgetools.com')
  expect(target.pathname).toBe('/warlock')
  expect(target.searchParams.get('build')).toContain('warlock-1003.5')
  expect(conditions.getByRole('link', { name: 'Client talent table' }).getAttribute('href')).toBe('https://wago.tools/db2/Talent?build=1.60.1.69913')
})
