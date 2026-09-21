import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import ClassDocumentPage from './ClassDocumentPage'
import { PUBLISHED_CLASSES } from './data/classes'
import { hunterClassFixture, type HunterBranch } from './data/fixtures/hunterClass.fixture'

const pageOfKind = (kind: string) => hunterClassFixture.pages.find((page) => page.kind === kind)!
const buildById = (id: string) => hunterClassFixture.builds.find((build) => build.id === id)!
const branchName = (spec: string) => (hunterClassFixture.branchNames as Record<string, string>)[spec]

describe('ClassDocumentPage renders any class from ClassDefinition', () => {
  afterEach(cleanup)

  it('renders the Hunter fixture comparison page with its table and FAQ', () => {
    const page = pageOfKind('comparison')
    const comparison = page.comparison!
    render(<ClassDocumentPage classDef={hunterClassFixture} page={page} />)

    expect(screen.getByRole('heading', { level: 1, name: /Hunter/ })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: page.h1 })).toBeTruthy()
    expect(screen.getByText(page.sections[0].heading)).toBeTruthy()

    const table = screen.getByRole('table')
    for (const column of comparison.columns) expect(within(table).getByText(column)).toBeTruthy()
    for (const row of comparison.rows) {
      expect(within(table).getByText(row.label)).toBeTruthy()
      for (const value of row.values) expect(within(table).getByText(value)).toBeTruthy()
    }
    for (const faq of page.faqs) {
      expect(screen.getByText(faq.question)).toBeTruthy()
      expect(screen.getByText(faq.answer)).toBeTruthy()
    }
    expect(screen.getAllByText(/Edit this build in Calculator/i).length).toBeGreaterThan(0)
  })

  it('ships no Hunter React component and no published Hunter class', () => {
    // R1: `require` does not exist in this Vite/ESM test environment, so assert the module's absence directly.
    expect(existsSync(join(process.cwd(), 'src/HunterPage.tsx'))).toBe(false)
    expect(PUBLISHED_CLASSES.some((classDef) => classDef.id === 'hunter')).toBe(false)
  })

  it('renders one document per ClassPageKind from the fixture H1 alone', () => {
    for (const page of hunterClassFixture.pages.filter((candidate) => candidate.kind !== 'calculator')) {
      render(<ClassDocumentPage classDef={hunterClassFixture} page={page} />)
      expect(screen.getByRole('heading', { level: 1, name: page.h1 })).toBeTruthy()
      expect(screen.getAllByText(/Edit this build in Calculator/i).length).toBeGreaterThan(0)
      cleanup()
    }
  })

  it('renders selected talents from primaryBuildId plus related builds and pages', () => {
    const page = pageOfKind('specBuild')
    const primary = buildById(page.primaryBuildId!)
    render(<ClassDocumentPage classDef={hunterClassFixture} page={page} />)

    expect(screen.getByText(primary.allocation)).toBeTruthy()
    for (const talentId of Object.keys(primary.build)) {
      const talent = hunterClassFixture.talents.find((candidate) => candidate.id === talentId)!
      expect(screen.getByText(talent.name)).toBeTruthy()
    }
    for (const relatedBuildId of page.relatedBuildIds) {
      const related = buildById(relatedBuildId)
      expect(screen.getByRole('link', { name: related.title })).toBeTruthy()
    }
    for (const related of page.relatedPages) {
      expect(screen.getByRole('link', { name: related.label })).toBeTruthy()
    }
  })

  it('renders one PvP tab per spec that has a pvp-intent build', () => {
    const page = pageOfKind('pvp')
    const pvpBuilds = hunterClassFixture.builds.filter((build) => build.intent === 'pvp')
    const specs = [...new Set(pvpBuilds.map((build) => build.spec))]
    render(<ClassDocumentPage classDef={hunterClassFixture} page={page} />)

    const tabs = screen.getAllByRole('tab')
    expect(tabs.map((tab) => tab.textContent)).toEqual(specs.map(branchName))
    expect(specs).not.toContain('beastmastery')

    const survival = pvpBuilds.find((build) => build.spec === 'survival')!
    fireEvent.click(tabs[1])
    expect(screen.getByText(survival.allocation)).toBeTruthy()
    expect(screen.getByText(survival.title)).toBeTruthy()
  })

  it('lists every talent grouped by branch and change status on the talents kind', () => {
    render(<ClassDocumentPage classDef={hunterClassFixture} page={pageOfKind('talents')} />)

    for (const branch of hunterClassFixture.branches) {
      expect(screen.getByRole('heading', { level: 3, name: hunterClassFixture.branchNames[branch] })).toBeTruthy()
    }
    expect(screen.getAllByTestId('class-talent-entry')).toHaveLength(hunterClassFixture.talents.length)
    for (const talent of hunterClassFixture.talents) {
      expect(screen.getByText(talent.name)).toBeTruthy()
    }
    const catalogue = screen.getByTestId('class-talent-catalogue')
    for (const label of ['New in this build', 'Changed in this build', 'Unchanged from Classic', 'Change status unknown']) {
      expect(within(catalogue).getAllByText(label).length).toBeGreaterThan(0)
    }
  })

  it('renders every class build on the builds hub grouped by intent', () => {
    render(<ClassDocumentPage classDef={hunterClassFixture} page={pageOfKind('buildsHub')} />)
    for (const build of hunterClassFixture.builds) {
      expect(screen.getByRole('link', { name: build.title })).toBeTruthy()
    }
    for (const label of ['Leveling', 'AoE', 'PvP']) {
      expect(screen.getByRole('heading', { name: label })).toBeTruthy()
    }
  })

  it('never labels a preset or build allocation as client verified', () => {
    render(<ClassDocumentPage classDef={hunterClassFixture} page={pageOfKind('specBuild')} />)
    const buildChrome = screen.getByTestId('class-build-evidence')
    expect(within(buildChrome).getAllByText('Community / Editorial Build').length).toBeGreaterThan(0)
    expect(within(buildChrome).queryAllByText(/client verified/i)).toHaveLength(0)

    const talentChrome = screen.getByTestId('class-talent-evidence')
    expect(within(talentChrome).getAllByText('Client verified').length).toBeGreaterThan(0)
    expect(within(talentChrome).queryAllByText(/Community \/ Editorial Build/i)).toHaveLength(0)
  })

  it('hardcodes no class name and leaves the site-wide footer list to SiteFooter', () => {
    // The class-neutral layer may name its own class only through `classDef`. Cross-class names
    // (`/paladin`, `/warrior`) belong in SiteFooter, which already owns the site-wide class list.
    const source = readFileSync(join(process.cwd(), 'src/ClassDocumentPage.tsx'), 'utf8')
    expect(source).not.toContain("'/paladin'")
    expect(source).not.toContain("'/warrior'")

    const { container } = render(<ClassDocumentPage classDef={hunterClassFixture} page={pageOfKind('specBuild')} />)
    const footer = container.querySelector('footer')!
    expect(within(footer).getByRole('link', { name: `${hunterClassFixture.name} Talent Calculator` }).getAttribute('href'))
      .toBe(hunterClassFixture.plannerPath)
    // SiteFooter still renders its own site-wide list next to the class-specific links.
    for (const href of ['/emberville', '/warrior', '/paladin', '/wow-forever-paladin-builds']) {
      expect(footer.querySelector(`a[href="${href}"]`)).toBeTruthy()
    }
  })

  it('scopes the client-verified talent badge to planner-legal fields, never tooltip text', () => {
    const page = pageOfKind('specBuild')
    render(<ClassDocumentPage classDef={hunterClassFixture} page={page} />)
    let claim = within(screen.getByTestId('class-talent-evidence')).getByText(/positions/i).textContent ?? ''
    expect(claim).toMatch(/positions and ranks/i)
    // The Mage dataset carries `rankDescriptions` evidence of `unknown` on 17 of its 30 published
    // nodes, so the badge copy may only name the planner-legal fields every node verifies.
    expect(claim).not.toMatch(/tooltip|per-rank|rank text/i)
    cleanup()

    // The claim does not change with the dataset: a class with unknown rank-description evidence
    // still gets the same planner-legal scoping rather than a claim it cannot support.
    const rankTextUnknown = {
      ...hunterClassFixture,
      talents: hunterClassFixture.talents.map((talent, index) => (index < 2 ? talent : {
        ...talent,
        rankDescriptions: undefined,
        fieldEvidence: { ...talent.fieldEvidence, rankDescriptions: 'unknown' as const },
      })),
    }
    render(<ClassDocumentPage classDef={rankTextUnknown} page={page} />)
    claim = within(screen.getByTestId('class-talent-evidence')).getByText(/positions/i).textContent ?? ''
    expect(claim).toMatch(/positions and ranks/i)
    expect(claim).not.toMatch(/tooltip|per-rank|rank text/i)
  })

  it('keeps the fixture out of the published registry while rendering it as a full class', () => {
    expect(hunterClassFixture.id).toBe('hunter')
    // The registry now carries the Mage class package, so emptiness is no longer the assertion
    // that matters; the fixture's absence from it is.
    expect(PUBLISHED_CLASSES.map((classDef) => classDef.id)).not.toContain('hunter')
    expect(hunterClassFixture.branches).toHaveLength(3)
    expect(hunterClassFixture.branches.every((branch: HunterBranch) => hunterClassFixture.branchNames[branch])).toBe(true)
  })
})
