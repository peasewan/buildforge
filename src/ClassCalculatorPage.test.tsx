import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ClassCalculatorPage from './ClassCalculatorPage'
import { HUNTER_FIXTURE_AOE_BUILD_ID, HUNTER_FIXTURE_STORAGE_KEY, hunterClassFixture } from './data/fixtures/hunterClass.fixture'
import { assertUniquePageIntents } from './lib/classPage'
import { totalPlannerPoints } from './lib/talentPlanner'

const calculatorPage = hunterClassFixture.pages.find((page) => page.kind === 'calculator')!
const buildById = (id: string) => hunterClassFixture.builds.find((build) => build.id === id)!
const clipboardWrite = vi.fn().mockResolvedValue(undefined)

describe('ClassCalculatorPage renders any class from ClassDefinition', () => {
  afterEach(cleanup)
  beforeEach(() => {
    clipboardWrite.mockClear()
    localStorage.clear()
    history.replaceState({}, '', hunterClassFixture.plannerPath)
    Object.assign(navigator, { clipboard: { writeText: clipboardWrite } })
  })

  it('renders the Hunter fixture H1, every branch and every talent', () => {
    render(<ClassCalculatorPage classDef={hunterClassFixture} />)
    expect(screen.getByRole('heading', { level: 1, name: calculatorPage.h1 })).toBeTruthy()
    expect(screen.getAllByTestId('class-talent')).toHaveLength(hunterClassFixture.talents.length)
    for (const branch of hunterClassFixture.branches) {
      expect(screen.getByRole('heading', { level: 3, name: hunterClassFixture.branchNames[branch] })).toBeTruthy()
    }
  })

  it('uses the class artwork in the calculator hero', () => {
    const { container } = render(<ClassCalculatorPage classDef={{ ...hunterClassFixture, ogImage: '/images/hunter/calculator.webp' }} />)

    expect(container.querySelector('.class-hero')?.getAttribute('style')).toContain('/images/hunter/calculator.webp')
  })

  it('spends and refunds ranks on a class-neutral talent node', () => {
    render(<ClassCalculatorPage classDef={hunterClassFixture} />)
    fireEvent.click(screen.getByRole('button', { name: /Add rank to Fixture Tracking/i }))
    expect(document.getElementById('bm-1')?.textContent).toContain('1/5')
    expect(screen.getAllByText('1 / 11').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: /Remove rank from Fixture Tracking/i }))
    expect(document.getElementById('bm-1')?.textContent).toContain('0/5')
  })

  it('offers exactly the recommendedBuildIds as presets and loads the clicked one', () => {
    render(<ClassCalculatorPage classDef={hunterClassFixture} />)
    const presetButtons = hunterClassFixture.recommendedBuildIds.map((id) =>
      screen.getByRole('button', { name: new RegExp(`Load ${buildById(id).shortTitle}`, 'i') }),
    )
    expect(presetButtons).toHaveLength(hunterClassFixture.recommendedBuildIds.length)
    // A build that is not recommended is not offered as a preset.
    expect(screen.queryByRole('button', { name: /Load Survival Leveling/i })).toBeNull()

    const aoe = buildById(HUNTER_FIXTURE_AOE_BUILD_ID)
    fireEvent.click(presetButtons[1])
    for (const [talentId, rank] of Object.entries(aoe.build)) {
      const talent = hunterClassFixture.talents.find((candidate) => candidate.id === talentId)!
      expect(document.getElementById(talentId)?.textContent).toContain(`${rank}/${talent.maxRank}`)
    }
    expect(totalPlannerPoints(aoe.build)).toBe(11)
  })

  it('restores a shared build code and level from the URL', () => {
    history.replaceState({}, '', `${hunterClassFixture.plannerPath}?build=bm-1.5&level=30`)
    render(<ClassCalculatorPage classDef={hunterClassFixture} />)
    expect(document.getElementById('bm-1')?.textContent).toContain('5/5')
    expect(screen.getAllByText('5 / 21').length).toBeGreaterThan(0)
  })

  it('switches planner modes from classDef.plannerModes', () => {
    render(<ClassCalculatorPage classDef={hunterClassFixture} />)
    fireEvent.click(screen.getByRole('button', { name: /Level 60/i }))
    expect(screen.getAllByText('0 / 51').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: /Level 20/i }))
    expect(screen.getAllByText('0 / 11').length).toBeGreaterThan(0)
  })

  it('copies a share link on classDef.plannerPath and stores state under classDef.storageKey only', () => {
    render(<ClassCalculatorPage classDef={hunterClassFixture} />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Load ${buildById('hunter-bm-leveling').shortTitle}`, 'i') }))
    fireEvent.click(screen.getByRole('button', { name: /Copy build link/i }))

    const copiedUrl = String(clipboardWrite.mock.calls[0]?.[0])
    expect(copiedUrl).toMatch(/^http:\/\/localhost:\d+\/hunter\?build=.+&level=20$/)
    expect(copiedUrl).toContain('build=')
    expect(copiedUrl).toContain('level=20')

    const stored = JSON.parse(localStorage.getItem(HUNTER_FIXTURE_STORAGE_KEY) ?? 'null') as { build: Record<string, number>; level: number } | null
    expect(stored?.level).toBe(20)
    expect(totalPlannerPoints(stored?.build ?? {})).toBe(11)

    // The fixture key is honoured; no Paladin or Warrior storage key is ever written.
    expect(localStorage.getItem('wow-forever-warrior-build')).toBeNull()
    expect(localStorage.getItem('wow-forever-paladin-build')).toBeNull()
  })

  it('sizes each tree canvas from the deepest row of the dataset, not from the fixture', () => {
    render(<ClassCalculatorPage classDef={hunterClassFixture} />)
    expect(screen.getAllByTestId('class-tree-canvas')[0].style.height).toBe('282px')
    cleanup()

    // The production coordinate map used by the real Mage and Warrior datasets
    // (`src/data/mageTalents.ts:23`, `src/data/warriorTalents.ts:57`): 7 rows over a 660px-class canvas.
    const productionRowY: Record<number, number> = { 1: 7, 2: 21.3, 3: 35.6, 4: 49.9, 5: 64.2, 6: 78.5, 7: 92.8 }
    const sevenRowClass = {
      ...hunterClassFixture,
      talents: hunterClassFixture.talents.map((talent, index) => {
        const row = (index % 7) + 1
        return { ...talent, row, y: productionRowY[row] }
      }),
    }
    render(<ClassCalculatorPage classDef={sevenRowClass} />)
    expect(screen.getAllByTestId('class-tree-canvas')[0].style.height).toBe('658px')
  })

  it('resets the tree and says so when a lower cap cannot hold the spent points', () => {
    render(<ClassCalculatorPage classDef={hunterClassFixture} />)
    fireEvent.click(screen.getByRole('button', { name: /Level 60/i }))
    const spend = (talentName: string, ranks: number) => {
      for (let rank = 0; rank < ranks; rank += 1) {
        fireEvent.click(screen.getByRole('button', { name: new RegExp(`Add rank to ${talentName}`, 'i') }))
      }
    }
    spend('Fixture Tracking', 5)
    spend('Fixture Guard', 5)
    spend('Fixture Pack Leader', 1)
    spend('Fixture Steady Aim', 1)
    expect(screen.getAllByText('12 / 51').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: /Level 20/i }))
    expect(screen.getAllByText('0 / 11').length).toBeGreaterThan(0)
    for (const talent of hunterClassFixture.talents) {
      expect(document.getElementById(talent.id)?.textContent).toContain(`0/${talent.maxRank}`)
    }
    expect(screen.getByRole('status').textContent).toMatch(/reset/i)

    const stored = JSON.parse(localStorage.getItem(HUNTER_FIXTURE_STORAGE_KEY) ?? 'null') as { build: Record<string, number>; level: number } | null
    expect(stored?.level).toBe(20)
    expect(totalPlannerPoints(stored?.build ?? {})).toBe(0)
  })

  it('shows client-verified talent chrome and community/editorial build chrome separately', () => {
    render(<ClassCalculatorPage classDef={hunterClassFixture} />)
    const presets = screen.getByTestId('class-presets')
    expect(within(presets).getByText('Community / Editorial Build')).toBeTruthy()
    expect(within(presets).queryByText(/client verified/i)).toBeNull()
    expect(screen.getAllByText('Client verified').length).toBeGreaterThan(0)
  })

  it('hardcodes no class name and leaves the site-wide footer list to SiteFooter', () => {
    // The class-neutral layer may name its own class only through `classDef`. Cross-class names
    // (`/paladin`, `/warrior`) belong in SiteFooter, which already owns the site-wide class list.
    const source = readFileSync(join(process.cwd(), 'src/ClassCalculatorPage.tsx'), 'utf8')
    expect(source).not.toContain("'/paladin'")
    expect(source).not.toContain("'/warrior'")

    const { container } = render(<ClassCalculatorPage classDef={hunterClassFixture} />)
    const footer = container.querySelector('footer')!
    expect(within(footer).getByRole('link', { name: `${hunterClassFixture.name} Talent Calculator` }).getAttribute('href'))
      .toBe(hunterClassFixture.plannerPath)
    // SiteFooter still renders its own site-wide list next to the class-specific links.
    for (const href of ['/emberville', '/warrior', '/paladin', '/wow-forever-paladin-builds']) {
      expect(footer.querySelector(`a[href="${href}"]`)).toBeTruthy()
    }
  })

  it('states the per-rank-text coverage the dataset actually has', () => {
    render(<ClassCalculatorPage classDef={hunterClassFixture} />)
    const ranked = hunterClassFixture.talents.filter((talent) => talent.rankDescriptions?.length).length
    expect(screen.getByText(/carry client build tags/i).textContent)
      .toContain(`${hunterClassFixture.talentCount} Hunter nodes carry client build tags, coordinates and source records; ${ranked} of ${hunterClassFixture.talentCount} also carry per-rank text`)
    cleanup()

    // Sparse per-rank data must not be described as complete: report the actual count.
    const sparse = {
      ...hunterClassFixture,
      talents: hunterClassFixture.talents.map((talent, index) => (index < 2 ? talent : { ...talent, rankDescriptions: undefined })),
    }
    render(<ClassCalculatorPage classDef={sparse} />)
    expect(screen.getByText(/carry client build tags/i).textContent)
      .toContain('9 Hunter nodes carry client build tags, coordinates and source records; 2 of 9 also carry per-rank text')
  })
})

describe('Hunter fixture shape', () => {
  it('covers every ClassPageKind with unique intents, titles, H1s and canonicals', () => {
    const expectedKinds = [
      'aoe',
      'buildsHub',
      'calculator',
      'comparison',
      'dungeon',
      'levelCap',
      'leveling',
      'pvp',
      'specBuild',
      'specLeveling',
      'talents',
    ]
    expect([...new Set(hunterClassFixture.pages.map((page) => page.kind))].sort()).toEqual(expectedKinds)
    expect(hunterClassFixture.pages[0].kind).toBe('calculator')
    expect(() => assertUniquePageIntents(hunterClassFixture.pages)).not.toThrow()
    for (const page of hunterClassFixture.pages) {
      expect(page.canonical).toBe(`https://buildforgetools.com/${page.slug}`)
    }
  })

  it('keeps every fixture preset inside its own level cap', () => {
    for (const build of hunterClassFixture.builds) {
      expect(totalPlannerPoints(build.build)).toBe(build.points)
      expect(build.points).toBeLessThanOrEqual(build.levelCap)
      expect(hunterClassFixture.talents.some((talent) => talent.id === build.order[0])).toBe(true)
    }
    for (const id of hunterClassFixture.recommendedBuildIds) {
      expect(hunterClassFixture.builds.map((build) => build.id)).toContain(id)
    }
  })
})
