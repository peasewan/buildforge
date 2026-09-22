import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import ClassDocumentPage from './ClassDocumentPage'
import { PUBLISHED_CLASSES } from './data/classes'
import { mageClass } from './data/classes/mage'
import { warriorClass } from './data/classes/warrior'
import { hunterClassFixture, type HunterBranch } from './data/fixtures/hunterClass.fixture'
import type { ClassDefinition } from './lib/classPage'
import { publishedClassPages, publishRequirementsFor, satisfiedRequirements } from './lib/classPage'
import { pageForPath } from './lib/routes'

const pageOfKind = (kind: string) => hunterClassFixture.pages.find((page) => page.kind === kind)!
const buildById = (id: string) => hunterClassFixture.builds.find((build) => build.id === id)!
const branchName = (spec: string) => (hunterClassFixture.branchNames as Record<string, string>)[spec]

describe('ClassDocumentPage renders any class from ClassDefinition', () => {
  afterEach(cleanup)

  it('marks the page root with the class id for class-specific art direction', () => {
    const { container } = render(<ClassDocumentPage classDef={hunterClassFixture} page={pageOfKind('specBuild')} />)
    expect(container.querySelector('main')?.getAttribute('data-class')).toBe('hunter')
  })

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
    expect(screen.getAllByRole('link', { name: /Calculator/i }).length).toBeGreaterThan(0)
  })

  it('ships no Hunter React component and no published Hunter class', () => {
    // R1: `require` does not exist in this Vite/ESM test environment, so assert the module's absence directly.
    expect(existsSync(join(process.cwd(), 'src/HunterPage.tsx'))).toBe(false)
    expect(PUBLISHED_CLASSES).not.toContain(hunterClassFixture)
  })

  it('renders one document per ClassPageKind from the fixture H1 alone', () => {
    for (const page of hunterClassFixture.pages.filter((candidate) => candidate.kind !== 'calculator')) {
      render(<ClassDocumentPage classDef={hunterClassFixture} page={page} />)
      expect(screen.getByRole('heading', { level: 1, name: page.h1 })).toBeTruthy()
      expect(screen.getAllByRole('link', { name: /Calculator/i }).length).toBeGreaterThan(0)
      cleanup()
    }
  })

  it('uses page art in the hero and falls back to the class art', () => {
    const page = pageOfKind('specBuild')
    const classWithArt = { ...hunterClassFixture, ogImage: '/images/hunter/default.webp' }
    const { container, rerender } = render(<ClassDocumentPage classDef={classWithArt} page={page} />)

    expect(container.querySelector('.class-hero')?.getAttribute('style')).toContain('/images/hunter/default.webp')

    rerender(<ClassDocumentPage classDef={classWithArt} page={{ ...page, ogImage: '/images/hunter/spec.webp' }} />)
    expect(container.querySelector('.class-hero')?.getAttribute('style')).toContain('/images/hunter/spec.webp')
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

  it('limits a level-cap page to the builds selected by that page record', () => {
    const page = warriorClass.pages.find((candidate) => candidate.kind === 'levelCap')!
    const { container } = render(<ClassDocumentPage classDef={warriorClass} page={page} />)

    expect(container.querySelectorAll('.class-build-groups article')).toHaveLength(3)
    expect(container.querySelectorAll('.class-build-icon')).toHaveLength(3)
    expect(screen.getByText('Arms Warrior Build (Level 20)')).toBeTruthy()
    expect(screen.queryByText('Arms Warrior PvP Build (Level 20)')).toBeNull()
  })

  it('shows local talent artwork throughout Warrior document pages', () => {
    const page = warriorClass.pages.find((candidate) => candidate.slug === 'wow-forever-arms-warrior-talents')!
    const armsTalents = warriorClass.talents.filter((talent) => talent.branch === 'arms')
    const { container } = render(<ClassDocumentPage classDef={warriorClass} page={page} />)

    const catalogueIcons = [...container.querySelectorAll<HTMLImageElement>('.class-talent-entry-icon')]
    expect(catalogueIcons).toHaveLength(armsTalents.length)
    expect(catalogueIcons.map((icon) => icon.getAttribute('src')).sort()).toEqual(armsTalents.map((talent) => talent.icon).sort())
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
    // The one Mage discovery link is appended there, and it points at a page that publishes:
    // `/mage` is withheld, so the catalogue is the cluster's crawlable entry point.
    const mageLink = footer.querySelector('a[href="/wow-forever-mage-talents"]')
    expect(mageLink).toBeTruthy()
    expect(pageForPath('/wow-forever-mage-talents').kind).toBe('class-document')
  })

  it('scopes the client-verified talent badge to planner-legal fields, never tooltip text', () => {
    const page = pageOfKind('specBuild')
    render(<ClassDocumentPage classDef={hunterClassFixture} page={page} />)
    let claim = within(screen.getByTestId('class-talent-evidence')).getByText(/positions/i).textContent ?? ''
    expect(claim).toMatch(/positions and ranks/i)
    // The badge copy may only name the planner-legal fields every node verifies.
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
    expect(PUBLISHED_CLASSES).not.toContain(hunterClassFixture)
    expect(hunterClassFixture.branches).toHaveLength(3)
    expect(hunterClassFixture.branches.every((branch: HunterBranch) => hunterClassFixture.branchNames[branch])).toBe(true)
  })

  it('links the now-published Mage calculator while still hiding unmet build pages', () => {
    const satisfied = satisfiedRequirements(mageClass)
    const pages = publishedClassPages([mageClass]).map(({ page }) => page)

    expect(satisfied.has('completeClassPlanner')).toBe(true)
    expect(pages).toHaveLength(11)
    for (const page of pages) {
      const { container } = render(<ClassDocumentPage classDef={mageClass} page={page} />)
      const hrefs = [...container.querySelectorAll('a')].map((anchor) => anchor.getAttribute('href') ?? '')

      expect(hrefs.some((href) => href === mageClass.plannerPath || href.startsWith(`${mageClass.plannerPath}?`)), page.slug).toBe(true)
      for (const withheld of mageClass.pages.filter((candidate) => !publishRequirementsFor(candidate).every((requirement) => satisfied.has(requirement)))) {
        expect(hrefs.filter((href) => href.split('?')[0] === `/${withheld.slug}`), `${page.slug} -> ${withheld.slug}`).toEqual([])
      }
      cleanup()
    }
  })

  it('keeps the calculator links on a class whose planner requirement is met', () => {
    const satisfied = satisfiedRequirements(hunterClassFixture)

    expect(satisfied.has('completeClassPlanner')).toBe(true)
    for (const { page } of publishedClassPages([hunterClassFixture])) {
      const { container } = render(<ClassDocumentPage classDef={hunterClassFixture} page={page} />)
      const hrefs = [...container.querySelectorAll('a')].map((anchor) => anchor.getAttribute('href') ?? '')

      expect(hrefs.some((href) => href.startsWith(hunterClassFixture.plannerPath)), page.slug).toBe(true)
      cleanup()
    }
  })
})

// A class-neutral broken-branch fixture keeps the fallback UI covered without depending on a
// known Mage data defect. Mage itself is now planner-legal in all three branches.
const blockedBranch = hunterClassFixture.branches[0]
const blockedClass: ClassDefinition<HunterBranch> = {
  ...hunterClassFixture,
  talents: hunterClassFixture.talents.map((talent) => talent.branch === blockedBranch
    ? { ...talent, requiredTreePoints: Math.max(5, talent.requiredTreePoints) }
    : talent),
}

describe('the catalogue states a branch that cannot be allocated without repeating the warning', () => {
  afterEach(cleanup)

  it('shows one branch-level exclusion notice and none under individual talents', () => {
    render(<ClassDocumentPage classDef={blockedClass} page={pageOfKind('talents')} />)

    const branch = document.querySelector(`.class-catalogue-branch[data-branch="${blockedBranch}"]`) as HTMLElement
    const marker = within(branch).getByTestId('class-exclusion-marker')
    expect(within(branch).getAllByTestId('class-exclusion-marker')).toHaveLength(1)
    expect(marker.textContent).toMatch(/cannot be used in build validation/i)
    expect(marker.textContent).toMatch(/no node in this branch can be taken first/i)
    expect(marker.textContent).not.toMatch(/position conflict|column|source/i)

    for (const entry of within(branch).getAllByTestId('class-talent-entry')) {
      expect(entry.getAttribute('data-excluded')).toBe('true')
      expect(within(entry).queryByTestId('class-exclusion-marker')).toBeNull()
    }
  })

  it('leaves a fully allocatable class without exclusion notices', () => {
    render(<ClassDocumentPage classDef={mageClass} page={mageClass.pages.find((page) => page.kind === 'talents')!} />)

    expect(screen.queryAllByTestId('class-exclusion-marker')).toHaveLength(0)
    expect([...document.querySelectorAll('.class-catalogue-branch')].every((branch) => branch.getAttribute('data-excluded') !== 'true')).toBe(true)
  })

  it('derives the exclusion from the dataset and gives it distinct visual treatment', () => {
    const source = readFileSync(join(process.cwd(), 'src/ClassDocumentPage.tsx'), 'utf8')
    expect(source).not.toMatch(/\bfire\b/i)
    expect(source).toMatch(/unallocatableBranches/)

    render(<ClassDocumentPage classDef={blockedClass} page={pageOfKind('talents')} />)
    const marker = screen.getByTestId('class-exclusion-marker')
    expect(marker.className).not.toMatch(/verification-badge|verification-client_verified|class-build-chip/)
    expect(marker.textContent).not.toMatch(/client verified|community\s*\/\s*editorial|positions and ranks/i)

    const styles = readFileSync(join(process.cwd(), 'src/styles.css'), 'utf8')
    const markerRule = styles.match(/\.class-exclusion-marker[^{]*\{[^}]*\}/)?.[0] ?? ''
    expect(markerRule).toContain('dashed')
    expect(markerRule).not.toContain('border-radius: 999px')
  })
})
