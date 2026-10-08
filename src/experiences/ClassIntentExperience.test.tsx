import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { warriorClass } from '../data/classes/warrior'
import { mageClass } from '../data/classes/mage'
import { rogueClass } from '../data/classes/rogue'
import { warlockClass } from '../data/classes/warlock'
import { hunterClass } from '../data/classes/hunter'
import { PUBLISHED_CLASSES } from '../data/classes'
import { officialTalentNotice } from '../data/officialOctoberChanges'
import { decodePlannerBuild } from '../lib/talentPlanner'
import ClassIntentExperience from './ClassIntentExperience'
import ClassExperiencePage from './ClassExperiencePage'
import { readFileSync } from 'node:fs'
const baseStyles = readFileSync('src/styles.css', 'utf8')
const experienceStyles = readFileSync('src/experiences/experience.css', 'utf8')
afterEach(cleanup)
const page = (slug: string) => warriorClass.pages.find((p) => p.slug === slug)!
it('opens the Hunter PvP build from a prominent hero calculator link', () => {
  const hunterPvp = hunterClass.pages.find((p) => p.slug === 'wow-forever-hunter-pvp-build')!
  const { container } = render(<ClassExperiencePage classDef={hunterClass} page={hunterPvp} />)
  const hero = container.querySelector('.ix-hero')!
  const link = within(hero as HTMLElement).getByRole('link', { name: /Inspect Level 20 snapshot in Calculator/i })
  const url = new URL(link.getAttribute('href')!, 'https://buildforgetools.com')
  expect(url.pathname).toBe('/hunter')
  expect(url.searchParams.get('level')).toBe('20')
  expect(url.searchParams.get('build')).toContain('hunter-')
})

it.each([
  'wow-forever-beast-mastery-hunter-build',
  'wow-forever-marksmanship-hunter-build',
  'wow-forever-hunter-leveling-build',
  'wow-forever-beast-mastery-hunter-leveling-build',
  'wow-forever-marksmanship-hunter-leveling-build',
  'wow-forever-hunter-pet-build',
  'wow-forever-hunter-dungeon-build',
])('opens a blank calculator instead of an unshareable removed-talent route from %s', (slug) => {
  const route = hunterClass.pages.find((candidate) => candidate.slug === slug)!
  const { container } = render(<ClassExperiencePage classDef={hunterClass} page={route} />)
  const hero = container.querySelector('.ix-hero')!
  const action = within(hero as HTMLElement).getByRole('link', { name: /Open blank Hunter Calculator/i })
  expect(action.getAttribute('href')).toBe('/hunter?build=#class-calculator')
  expect(hero.textContent).toMatch(/historical.*removed talent/i)
})

it('does not offer a prefilled primary or alternative link for archived Hunter allocations', () => {
  const route = hunterClass.pages.find((candidate) => candidate.slug === 'wow-forever-beast-mastery-hunter-build')!
  const { container } = render(<ClassIntentExperience classDef={hunterClass} page={route} />)
  const primary = container.querySelector('.ix-build-target .ix-action') as HTMLAnchorElement
  expect(primary.getAttribute('href')).toBe('/hunter?build=#class-calculator')
  expect(primary.textContent).toMatch(/archived route/i)
  const alternative = container.querySelector('.ix-panel:not(.ix-build-target) .ix-action') as HTMLAnchorElement
  expect(alternative.getAttribute('href')).toBe('/hunter?build=#class-calculator')
})

it('describes the Hunter BM/MM comparison as read-only historical evidence', () => {
  const route = hunterClass.pages.find((candidate) => candidate.slug === 'wow-forever-beast-mastery-vs-marksmanship-hunter-leveling')!
  const { container } = render(<ClassExperiencePage classDef={hunterClass} page={route} />)
  expect(container.textContent).toContain('Compare the read-only historical ranks here')
  expect(container.textContent).not.toContain('Open both snapshots in the calculator')
})

it('never publishes a removed-node prefilled calculator link from any Hunter content page', () => {
  const removedIds = hunterClass.talents
    .filter((talent) => officialTalentNotice('hunter', talent.name)?.status === 'removed')
    .map((talent) => talent.id)
  for (const route of hunterClass.pages.filter((candidate) => candidate.kind !== 'calculator')) {
    const { container, unmount } = render(<ClassExperiencePage classDef={hunterClass} page={route} />)
    for (const anchor of container.querySelectorAll<HTMLAnchorElement>('a[href^="/hunter?build="]')) {
      const url = new URL(anchor.getAttribute('href')!, 'https://buildforgetools.com')
      const allocation = decodePlannerBuild(url.searchParams.get('build') ?? '', hunterClass.talents)
      for (const id of removedIds) expect(allocation[id] ?? 0, `${route.slug}: ${anchor.getAttribute('href')} loads removed ${id}`).toBe(0)
    }
    unmount()
  }
})

it('opens a blank calculator from a talent reference with no selected build', () => {
  const { container } = render(<ClassExperiencePage classDef={warriorClass} page={page('wow-forever-warrior-talents')} />)
  const hero = container.querySelector('.ix-hero')!
  const link = within(hero as HTMLElement).getByRole('link', { name: 'Open Warrior Calculator' })
  expect(link.getAttribute('href')).toBe('/warrior')
})
it('gives Warlock PvP a distinct editorial note instead of repeating the route paragraph', () => {
  const warlockPvp = warlockClass.pages.find(p => p.slug === 'wow-forever-warlock-pvp-build')!
  const { container } = render(<ClassExperiencePage classDef={warlockClass} page={warlockPvp} />)
  const text = container.textContent ?? ''
  expect(text.split('This Level 20 starting snapshot spends').length - 1).toBe(1)
  expect(text).toContain('a PvP check needs to include the opponent')
})
it.each([
  ['wow-forever-warrior-builds', 'build-discovery', 'a[href]'],
  ['wow-forever-fury-warrior-build', 'build-workbench', 'a[href*="build="]'],
  ['wow-forever-fury-warrior-leveling-build', 'level-progression', 'input[aria-label="Your level"]'],
  ['wow-forever-arms-warrior-pvp-build', 'pvp-matchup', 'button[aria-pressed]'],
  ['wow-forever-protection-warrior-dungeon-build', 'dungeon-pull', 'button[aria-pressed]'],
  ['wow-forever-warrior-talents', 'talent-reference', 'input[aria-label="Search talents"]'],
  ['wow-forever-arms-vs-fury-warrior-leveling', 'route-comparison', 'select'],
])('puts the %s task first as %s', (slug, surface, control) => {
  const { container } = render(<ClassExperiencePage classDef={warriorClass} page={page(slug)} />)
  const first = container.querySelector('[data-surface]')
  expect(first?.getAttribute('data-surface')).toBe(surface)
  expect(first?.querySelector(control)).toBeTruthy()
  expect(container.querySelector('main')?.getAttribute('data-intent-page')).toBe(page(slug).kind)
})

it('composes support modules by task rather than the same template order', () => {
  const slots = (slug: string) => {
    const { container, unmount } = render(<ClassExperiencePage classDef={warriorClass} page={page(slug)} />)
    const result = [...container.querySelectorAll('[data-composition-slot]')]
      .map(element => element.getAttribute('data-composition-slot'))
    unmount()
    return result
  }
  expect(slots('wow-forever-warrior-builds').slice(0, 2)).toEqual(['intent', 'signature'])
  expect(slots('wow-forever-warrior-talents').slice(0, 3)).toEqual(['intent', 'official', 'evidence'])
  expect(slots('wow-forever-fury-warrior-build').slice(0, 3)).toEqual(['intent', 'editorial', 'official'])
  expect(slots('wow-forever-arms-vs-fury-warrior-leveling').slice(0, 3)).toEqual(['intent', 'comparison', 'official'])
  const pilot = [
    'wow-forever-warrior-builds', 'wow-forever-fury-warrior-build',
    'wow-forever-fury-warrior-leveling-build', 'wow-forever-arms-warrior-pvp-build',
    'wow-forever-protection-warrior-dungeon-build', 'wow-forever-warrior-talents',
    'wow-forever-arms-vs-fury-warrior-leveling',
  ]
  expect(new Set(pilot.map(slug => slots(slug).join('>'))).size).toBe(pilot.length)
})

it.each(['warrior', 'mage', 'rogue', 'priest', 'druid', 'warlock', 'hunter', 'shaman'])(
  'puts %s build route links before its planning signature',
  (id) => {
    const classDef = PUBLISHED_CLASSES.find((candidate) => candidate.id === id)!
    const hub = classDef.pages.find((candidate) => candidate.kind === 'buildsHub')!
    const { container } = render(<ClassExperiencePage classDef={classDef} page={hub} />)
    const slots = [...container.querySelectorAll('[data-composition-slot]')]
    expect(slots[0]?.getAttribute('data-composition-slot')).toBe('intent')
    expect(slots[0]?.querySelector('[data-surface="build-discovery"] .ix-route-grid a[href]')).toBeTruthy()
    expect(slots[1]?.getAttribute('data-composition-slot')).toBe('signature')
  },
)
it('changes the current allocation and next point with the leveling control', () => {
  render(
    <ClassIntentExperience
      classDef={warriorClass}
      page={page('wow-forever-fury-warrior-leveling-build')}
    />,
  )
  fireEvent.change(screen.getByLabelText('Your level'), {
    target: { value: '14' },
  })
  expect(screen.getByTestId('progression-current').textContent).toContain(
    '5 points',
  )
  expect(screen.getByTestId('progression-next').textContent).toContain(
    'Unbridled Wrath',
  )
  const link = screen
    .getByRole('link', { name: 'Edit this level in Calculator' })
    .getAttribute('href')!
  expect(link).toContain('cruelty.5')
  expect(link).not.toContain('unbridled-wrath.5')
})

it('shows a clearly modeled Talented timing comparison without adding unverified points', () => {
  render(
    <ClassIntentExperience
      classDef={warriorClass}
      page={page('wow-forever-fury-warrior-leveling-build')}
    />,
  )
  expect(screen.getByTestId('progression-current').textContent).toContain('1 point')
  fireEvent.click(screen.getByRole('switch', { name: /Legacy: Talented/i }))
  expect(screen.getByTestId('progression-current').textContent).toContain('6 points')
  expect(screen.getByTestId('progression-next').textContent).toContain('level 11')
  expect(screen.getByText(/illustrative maximum five-level advance/i)).toBeTruthy()
  expect(screen.getByText(/requires earned Legacy points and a per-character choice/i)).toBeTruthy()
  expect(screen.getByRole('link', { name: /Blizzard Legacy announcement/i }).getAttribute('href'))
    .toBe('https://news.blizzard.com/en-us/article/24307383/get-to-know-the-world-of-warcraft-forever-legacy-system')

  fireEvent.change(screen.getByLabelText('Your level'), { target: { value: '20' } })
  expect(screen.getByTestId('progression-current').textContent).toContain('11 points')
  expect(screen.getByText(/does not model points beyond this published route/i)).toBeTruthy()
})
it('keeps the Frost AoE route available after switching to leveling and back', () => {
  render(
    <ClassIntentExperience
      classDef={mageClass}
      page={mageClass.pages.find(
        (p) => p.slug === 'wow-forever-frost-mage-aoe-build',
      )!}
    />,
  )
  const picker = screen.getByLabelText('Progression route') as HTMLSelectElement
  fireEvent.change(screen.getByLabelText('Your level'), {
    target: { value: '20' },
  })
  const calculatorBuild = () =>
    new URL(
      screen
        .getByRole('link', { name: 'Edit this level in Calculator' })
        .getAttribute('href')!,
      'https://buildforgetools.com',
    ).searchParams.get('build')
  expect(picker.value).toBe('mage-frost-aoe')
  expect(calculatorBuild()).toContain('mage-frost-improved-blizzard.1')
  fireEvent.change(picker, { target: { value: 'mage-frost-leveling' } })
  expect(picker.value).toBe('mage-frost-leveling')
  expect(calculatorBuild()).not.toContain('improved-blizzard')
  expect(Array.from(picker.options).map((option) => option.value)).toContain(
    'mage-frost-aoe',
  )
  fireEvent.change(picker, { target: { value: 'mage-frost-aoe' } })
  expect(picker.value).toBe('mage-frost-aoe')
  expect(calculatorBuild()).toContain('mage-frost-improved-blizzard.1')
  expect(screen.getByTestId('progression-current').textContent).toContain(
    '11 points',
  )
})
it('honestly reports identical baseline allocation for Arms PvP', () => {
  render(
    <ClassIntentExperience
      classDef={warriorClass}
      page={page('wow-forever-arms-warrior-pvp-build')}
    />,
  )
  expect(
    screen.getByText(/These routes use the same talent allocation/),
  ).toBeTruthy()
})
it('searches talent names and displays only matching evidence records', () => {
  render(
    <ClassIntentExperience
      classDef={warriorClass}
      page={page('wow-forever-warrior-talents')}
    />,
  )
  fireEvent.change(screen.getByLabelText('Search talents'), {
    target: { value: 'Piercing Howl' },
  })
  expect(screen.getAllByTestId('talent-record')).toHaveLength(1)
  expect(screen.getByTestId('talent-record').textContent).toContain(
    'Piercing Howl',
  )
})

it('shows an unavailable tooltip for the empty Remorseless Attacks rank record', () => {
  render(
    <ClassIntentExperience
      classDef={rogueClass}
      page={rogueClass.pages.find((p) => p.kind === 'talents')!}
    />,
  )
  fireEvent.change(screen.getByLabelText('Search talents'), {
    target: { value: 'Remorseless Attacks' },
  })
  expect(screen.getAllByTestId('talent-record')).toHaveLength(1)
  expect(
    screen.getByText(
      'This rank’s tooltip is not available in the reviewed dataset.',
    ),
  ).toBeTruthy()
})

it.each([undefined, '', ' \n\t '])(
  'shows an unavailable notice for missing or blank rank text (%j)',
  (rankText) => {
    const def = {
      ...warriorClass,
      talents: warriorClass.talents.map((t) =>
        t.name === 'Piercing Howl'
          ? {
              ...t,
              rankDescriptions: rankText === undefined ? undefined : [rankText],
            }
          : t,
      ),
    }
    render(
      <ClassIntentExperience
        classDef={def}
        page={page('wow-forever-warrior-talents')}
      />,
    )
    fireEvent.change(screen.getByLabelText('Search talents'), {
      target: { value: 'Piercing Howl' },
    })
    expect(screen.getAllByTestId('talent-record')).toHaveLength(1)
    expect(
      screen.getByText(
        'This rank’s tooltip is not available in the reviewed dataset.',
      ),
    ).toBeTruthy()
  },
)

it.each([
  {
    rankText: '',
    description: 'Recorded general effect.',
    expected: 'General description (not rank-specific): Recorded general effect.',
  },
  {
    rankText: ' \n ',
    description: 'Recorded general effect.',
    expected: 'General description (not rank-specific): Recorded general effect.',
  },
  {
    rankText: undefined,
    description: 'Recorded general effect.',
    expected: 'General description (not rank-specific): Recorded general effect.',
  },
  {
    rankText: '',
    description: ' \t ',
    expected: 'A verified effect description for this rank is not available.',
  },
  {
    rankText: '  Recorded rank effect.  ',
    description: 'Recorded general effect.',
    expected: 'Recorded rank effect.',
  },
])(
  'uses the first nonblank role-tool description: $expected',
  ({ rankText, description, expected }) => {
    const def = {
      ...warriorClass,
      talents: warriorClass.talents.map((t) => ({
        ...t,
        rankDescriptions:
          rankText === undefined
            ? undefined
            : Array<string>(t.maxRank).fill(rankText),
        description,
      })),
    }
    render(
      <ClassIntentExperience
        classDef={def}
        page={page('wow-forever-arms-warrior-pvp-build')}
      />,
    )
    expect(screen.getAllByText(expected)).toHaveLength(4)
  },
)

it('normalizes fractional levels to an existing step with an exact calculator allocation', () => {
  render(
    <ClassIntentExperience
      classDef={warriorClass}
      page={page('wow-forever-fury-warrior-leveling-build')}
    />,
  )
  fireEvent.change(screen.getByLabelText('Your level'), {
    target: { value: '14.5' },
  })
  expect((screen.getByLabelText('Your level') as HTMLInputElement).value).toBe(
    '14',
  )
  expect(screen.getByTestId('progression-current').textContent).toContain(
    '5 points',
  )
  expect(screen.getByTestId('progression-next').textContent).toContain(
    'At level 15',
  )
  const link = new URL(
    screen
      .getByRole('link', { name: 'Edit this level in Calculator' })
      .getAttribute('href')!,
    'https://buildforgetools.com',
  )
  expect(link.searchParams.get('build')).toBe('warrior-fury-cruelty.5')
  expect(link.searchParams.get('level')).toBe('20')
})

it('shows unavailable Protection PvP allocation instead of borrowing another specialization', () => {
  render(
    <ClassIntentExperience
      classDef={warriorClass}
      page={page('wow-forever-protection-warrior-pvp-build')}
    />,
  )
  expect(
    screen.getByRole('heading', { name: 'What can be planned now' }),
  ).toBeTruthy()
  expect(screen.queryByRole('link', { name: 'Edit in Calculator' })).toBeNull()
  expect(
    screen.queryByRole('heading', { name: 'Encounter checklist' }),
  ).toBeNull()
})

it('keeps specialization PvP scoped while allowing class PvP route selection', () => {
  const { rerender } = render(
    <ClassIntentExperience
      classDef={warriorClass}
      page={page('wow-forever-arms-warrior-pvp-build')}
    />,
  )
  expect(screen.queryByLabelText('PvP route')).toBeNull()
  rerender(
    <ClassIntentExperience
      classDef={warriorClass}
      page={page('wow-forever-warrior-pvp-build')}
    />,
  )
  const select = screen.getByLabelText('PvP route') as HTMLSelectElement
  expect(Array.from(select.options).map((option) => option.value)).toEqual(
    expect.arrayContaining(['warrior-arms-pvp', 'warrior-fury-pvp']),
  )
})

it('keeps client preview heroes compact despite legacy preview styles', () => {
  const preview = {
    ...warriorClass,
    dataReview: { ready: true, notice: 'Preview' },
  }
  const { container } = render(
    <>
      <style>{baseStyles + experienceStyles}</style>
      <ClassExperiencePage
        classDef={preview}
        page={page('wow-forever-warrior-talents')}
      />
    </>,
  )
  const style = getComputedStyle(container.querySelector('.ix-hero')!)
  expect(style.minHeight).toBe('0px')
  expect(style.paddingTop).toBe('26px')
  expect(style.backgroundSize).toBe('auto 100%')
  expect(style.backgroundPosition).toBe('right top')
})

it('retains excluded branch evidence when its entry nodes are unavailable', () => {
  const unresolved = {
    ...warriorClass,
    talents: warriorClass.talents.map((t) =>
      t.branch === 'arms'
        ? { ...t, requiredTreePoints: Math.max(1, t.requiredTreePoints) }
        : t,
    ),
  }
  render(
    <ClassIntentExperience
      classDef={unresolved}
      page={page('wow-forever-warrior-talents')}
    />,
  )
  expect(
    screen.getByText('Branch cannot be used in build validation'),
  ).toBeTruthy()
  const records = screen.getAllByTestId('talent-record')
  expect(
    records.filter((record) => record.dataset.excluded === 'true'),
  ).toHaveLength(warriorClass.talents.filter((t) => t.branch === 'arms').length)
  fireEvent.change(screen.getByLabelText('Specialization'), {
    target: { value: 'fury' },
  })
  expect(
    screen.queryByText('Branch cannot be used in build validation'),
  ).toBeNull()
  expect(
    screen
      .getAllByTestId('talent-record')
      .every((record) => record.dataset.excluded !== 'true'),
  ).toBe(true)
})

it('mentions the verified build only once in the new header', () => {
  const { container } = render(
    <ClassExperiencePage
      classDef={warriorClass}
      page={page('wow-forever-warrior-talents')}
    />,
  )
  expect(
    container
      .querySelector('.ix-meta')!
      .textContent!.split(warriorClass.verifiedBuild),
  ).toHaveLength(2)
})

it('shows exact editorial talent use without presenting it as player popularity', () => {
  const { container } = render(
    <ClassIntentExperience
      classDef={warriorClass}
      page={page('wow-forever-warrior-talents')}
    />,
  )
  const record = (name: string) => [...container.querySelectorAll('[data-testid="talent-record"]')]
    .find((candidate) => candidate.querySelector('h3')?.textContent === name)

  const angerUsage = record('Anger Management')?.querySelector('[data-editorial-usage]')
  expect(angerUsage).toBeTruthy()
  expect(angerUsage?.closest('details')).toBeNull()
  expect(angerUsage?.textContent).toContain('Editorial examples, not player popularity')
  const armsRoute = angerUsage?.querySelector('a[href="/wow-forever-arms-warrior-build"]')?.closest('li')
  expect(armsRoute?.textContent).toContain('Rank 1/1')
  expect(armsRoute?.textContent).toContain('Level 20')
  expect(armsRoute?.textContent).toContain('Weapon damage and stance control')
  expect(armsRoute?.textContent).toContain('Key talent in this editorial route')

  const rendRoute = record('Improved Rend')?.querySelector('[data-editorial-usage] a[href="/wow-forever-arms-warrior-build"]')?.closest('li')
  expect(rendRoute?.textContent).toContain('Rank 3/3')
  expect(rendRoute?.textContent).not.toContain('Key talent in this editorial route')
})

it('does not present source change labels as a verified client-build diff', () => {
  const { container } = render(
    <ClassIntentExperience
      classDef={warriorClass}
      page={page('wow-forever-warrior-talents')}
    />,
  )
  expect(container.querySelector('.ix-reference')?.textContent).toContain('No reviewed previous client-build snapshot')
  expect(container.querySelector('[data-testid="talent-record"] .ix-record-facts')?.textContent).not.toContain('Change:')
})

it.each([
  [warriorClass, 'Toughness', 'removed'],
  [warriorClass, 'Improved Cleave', 'removed'],
  [mageClass, 'Improved Scorch', 'changed'],
  [hunterClass, 'Aimed Shot', 'removed'],
  [hunterClass, 'Thick Hide', 'removed'],
] as const)('flags %s %s as an official %s while retaining the 69913 record', (classDef, name, status) => {
  const catalog = classDef.pages.find((candidate) => candidate.kind === 'talents')!
  const { container } = render(<ClassIntentExperience classDef={classDef} page={catalog} />)
  const record = [...container.querySelectorAll('[data-testid="talent-record"]')]
    .find((candidate) => candidate.querySelector('h3')?.textContent === name)
  expect(record, `${name} must remain in the historical catalog`).toBeTruthy()
  expect(record?.getAttribute('data-official-status')).toBe(status)
  expect(record?.textContent).toContain('69913')
  expect(record?.textContent).toContain(status === 'removed' ? 'Removed in official update' : 'Changed in official update')
  const sourceLink = within(record as HTMLElement).getByRole('link', { name: 'Read the official update' })
  expect(sourceLink.getAttribute('href')).toBe(officialTalentNotice(classDef.id, name)?.source)
  expect(record?.querySelector('.verification-client_verified')).toBeNull()
})

it('labels officially removed Hunter nodes in the selected-rank comparison, not only in the talent catalog', () => {
  const comparison = hunterClass.pages.find((candidate) => candidate.slug === 'wow-forever-beast-mastery-vs-marksmanship-hunter-leveling')!
  const { container } = render(<ClassIntentExperience classDef={hunterClass} page={comparison} />)
  for (const name of ['Aimed Shot', 'Thick Hide']) {
    const row = [...container.querySelectorAll('.ix-ranks li')].find((candidate) => candidate.textContent?.includes(name))
    expect(row, `${name} should be visible in an editorial route`).toBeTruthy()
    expect(row?.getAttribute('data-official-status')).toBe('removed')
    expect(row?.textContent).toContain('Removed in official update')
    expect(row?.querySelector('a[href*="news.blizzard.com"]')).toBeTruthy()
  }
})

it('keeps specialization and playstyle discovery gated and search interactive', () => {
  const hub = mageClass.pages.find(p => p.kind === 'buildsHub')!
  const { container } = render(<ClassIntentExperience classDef={mageClass} page={hub} />)
  const grouped = container.querySelector('.ix-hub-discovery')!
  expect(grouped.textContent).toContain('Editorial allocation')
  const links = [...grouped.querySelectorAll('a')].map(a => a.getAttribute('href'))
  expect(links).not.toContain('/wow-forever-fire-mage-build')
  expect(links).toContain('/wow-forever-frost-mage-build')
  fireEvent.change(screen.getByLabelText('Find a route'), { target: { value: 'no-such-route' } })
  expect(container.querySelectorAll('.ix-route-grid a')).toHaveLength(0)
  expect(screen.getByText('No route matches that search.')).toBeTruthy()
  expect(container.querySelector('.ix-hub-discovery a')).toBeTruthy()
})


it('shows the selected route change summary on PvP and leveling surfaces', () => {
  const pvp = warriorClass.pages.find((candidate) => candidate.slug === 'wow-forever-arms-warrior-pvp-build')!
  const pvpView = render(<ClassIntentExperience classDef={warriorClass} page={pvp} />)
  const pvpSummary = pvpView.container.querySelector('[aria-label="Official change review"]')
  expect(pvpSummary).toBeTruthy()
  expect(pvpSummary?.getAttribute('data-build-version')).toBeTruthy()
  pvpView.unmount()

  const leveling = warriorClass.pages.find((candidate) => candidate.slug === 'wow-forever-fury-warrior-leveling-build')!
  const levelingView = render(<ClassIntentExperience classDef={warriorClass} page={leveling} />)
  expect(levelingView.container.querySelector('[aria-label="Official change review"]')).toBeTruthy()
})


it('starts a spec workbench with a different allocation and still explains an explicitly selected duplicate', () => {
  const route = rogueClass.pages.find((candidate) => candidate.slug === 'wow-forever-combat-rogue-build')!
  const { container } = render(<ClassIntentExperience classDef={rogueClass} page={route} />)
  const chooser = screen.getByLabelText('Alternative build') as HTMLSelectElement
  expect(chooser.value).toBe('rogue-assassination-starter')
  expect(container.querySelector('.ix-diff table')).toBeTruthy()
  expect(screen.queryByText(/These routes use the same talent allocation/)).toBeNull()

  fireEvent.change(chooser, { target: { value: 'rogue-combat-leveling' } })
  expect(container.querySelector('.ix-diff table')).toBeNull()
  expect(screen.getByText(/These routes use the same talent allocation/)).toBeTruthy()
})

it('keeps specialization leveling focused on that specialization rather than offering every class route', () => {
  const route = rogueClass.pages.find((candidate) => candidate.slug === 'wow-forever-combat-rogue-leveling-build')!
  render(<ClassIntentExperience classDef={rogueClass} page={route} />)
  const chooser = screen.getByLabelText('Progression route') as HTMLSelectElement
  expect(Array.from(chooser.options).map((option) => option.value)).toEqual(['rogue-combat-leveling'])
  fireEvent.change(screen.getByLabelText('Your level'), { target: { value: '20' } })
  expect(screen.getByTestId('progression-current').textContent).toContain('0/11/0')
  expect(screen.getByRole('heading', { name: 'Your allocation at level 20' })).toBeTruthy()
})

it('lets class leveling choose another specialization and updates its exact points', () => {
  const route = rogueClass.pages.find((candidate) => candidate.kind === 'leveling')!
  render(<ClassIntentExperience classDef={rogueClass} page={route} />)
  const chooser = screen.getByLabelText('Progression route') as HTMLSelectElement
  expect(Array.from(chooser.options).map((option) => option.value)).toEqual([
    'rogue-assassination-leveling', 'rogue-combat-leveling', 'rogue-subtlety-leveling',
  ])
  fireEvent.change(screen.getByLabelText('Your level'), { target: { value: '20' } })
  fireEvent.change(chooser, { target: { value: 'rogue-assassination-leveling' } })
  expect(screen.getByTestId('progression-current').textContent).toContain('11/0/0')
  const target = new URL(screen.getByRole('link', { name: 'Edit this level in Calculator' }).getAttribute('href')!, 'https://buildforgetools.com')
  expect(target.searchParams.get('build')).toContain('rogue-281.1')
  expect(target.searchParams.get('build')).not.toContain('rogue-204')
})

it('explains the cap endpoint and why the next recorded tier cannot fit this budget', () => {
  const route = rogueClass.pages.find((candidate) => candidate.kind === 'levelCap')!
  const { container } = render(<ClassIntentExperience classDef={rogueClass} page={route} />)
  const combat = Array.from(container.querySelectorAll('.ix-cap-routes article'))
    .find((candidate) => candidate.querySelector('h2')?.textContent === 'Combat') as HTMLElement
  expect(combat.textContent).toContain('11 of 11 points spent')
  expect(combat.textContent).toContain('Recorded endpoint: Endurance 1/2')
  expect(combat.textContent).toContain('Improved Kick')
  expect(combat.textContent).toContain('15 Combat points')
  expect(combat.textContent).toContain('4 more in this branch before the first rank')
  expect(combat.textContent).toContain('5 additional points')
  expect(combat.textContent).toMatch(/planning assumption/i)
  const allocation = decodePlannerBuild(new URL(within(combat).getByRole('link', { name: 'Inspect Level 20 snapshot' }).getAttribute('href')!, 'https://buildforgetools.com').searchParams.get('build')!, rogueClass.talents)
  expect(allocation['rogue-204']).toBe(1)
  expect(allocation['rogue-206']).toBeUndefined()
})


it('keeps endpoint inspection and point-by-point progression together on an expansion spec build', () => {
  const route = rogueClass.pages.find((candidate) => candidate.slug === 'wow-forever-combat-rogue-build')!
  const { container } = render(<ClassIntentExperience classDef={rogueClass} page={route} />)
  expect(container.querySelector('[data-surface="build-workbench"]')).toBeTruthy()
  expect(container.querySelector('[data-surface="level-progression"]')).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Your level'), { target: { value: '14' } })
  expect(screen.getByTestId('progression-current').textContent).toContain('5 points')
  expect(screen.getByTestId('progression-current').textContent).toContain('0/5/0')
  const target = new URL(screen.getByRole('link', { name: 'Edit this level in Calculator' }).getAttribute('href')!, 'https://buildforgetools.com')
  expect(target.searchParams.get('build')).toContain('rogue-201.2')
  expect(target.searchParams.get('build')).toContain('rogue-186.3')
  expect(target.searchParams.get('build')).not.toContain('rogue-204')
})
