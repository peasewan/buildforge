import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { warriorClass } from '../data/classes/warrior'
import { mageClass } from '../data/classes/mage'
import { rogueClass } from '../data/classes/rogue'
import ClassIntentExperience from './ClassIntentExperience'
import ClassExperiencePage from './ClassExperiencePage'
import { readFileSync } from 'node:fs'
const baseStyles = readFileSync('src/styles.css', 'utf8')
const experienceStyles = readFileSync('src/experiences/experience.css', 'utf8')
afterEach(cleanup)
const page = (slug: string) => warriorClass.pages.find((p) => p.slug === slug)!
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
  expect(slots('wow-forever-warrior-talents').slice(0, 3)).toEqual(['intent', 'evidence', 'editorial'])
  expect(slots('wow-forever-fury-warrior-build').slice(0, 3)).toEqual(['intent', 'editorial', 'evidence'])
  expect(slots('wow-forever-arms-vs-fury-warrior-leveling').slice(0, 3)).toEqual(['intent', 'comparison', 'editorial'])
})
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
    expected: 'Recorded general effect.',
  },
  {
    rankText: ' \n ',
    description: 'Recorded general effect.',
    expected: 'Recorded general effect.',
  },
  {
    rankText: undefined,
    description: 'Recorded general effect.',
    expected: 'Recorded general effect.',
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
