import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import ClassCalculatorPage from './ClassCalculatorPage'
import ClassDocumentPage from './ClassDocumentPage'
import { PUBLISHED_CLASSES } from './data/classes'
import { mageClass } from './data/classes/mage'
import { hunterClassFixture, type HunterBranch } from './data/fixtures/hunterClass.fixture'
import type { ClassDefinition } from './lib/classPage'
import { publishedClassPages, publishRequirementsFor, satisfiedRequirements } from './lib/classPage'
import { pageForPath } from './lib/routes'
import { canIncrementPlannerTalent, encodePlannerBuild, incrementPlannerTalent, plannerLockReason } from './lib/talentPlanner'

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

  it('drops every calculator link on a class whose planner requirement is unmet', () => {
    // R17: `/mage` is withheld, so a link to `classDef.plannerPath` would hand a Frost Mage
    // reader the Paladin calculator. The gate decides, and it withholds the whole CTA — and any
    // other link to a withheld page — from every published Mage page.
    const satisfied = satisfiedRequirements(mageClass)
    const pages = publishedClassPages([mageClass]).map(({ page }) => page)

    expect(satisfied.has('completeClassPlanner')).toBe(false)
    expect(pages).toHaveLength(8)
    for (const page of pages) {
      const { container } = render(<ClassDocumentPage classDef={mageClass} page={page} />)
      const hrefs = [...container.querySelectorAll('a')].map((anchor) => anchor.getAttribute('href') ?? '')

      expect(hrefs.filter((href) => href === mageClass.plannerPath || href.startsWith(`${mageClass.plannerPath}?`)), page.slug).toEqual([])
      expect(within(container).queryByText(/Edit this build in Calculator/i), page.slug).toBeNull()
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

// The branch whose nodes are visible but unallocatable. Every expectation below reads the branch
// list straight off the dataset, so it cannot come from the same helper the renderer uses.
const mageTalentsPage = mageClass.pages.find((page) => page.kind === 'talents')!
const entrylessTalents = mageClass.talents.filter((talent) => talent.branch === 'fire')
const entryPointBranches = new Set(mageClass.talents.filter((talent) => talent.requiredTreePoints === 0).map((talent) => talent.branch))
const ids = (talents: { id: string }[]) => talents.map((talent) => talent.id).sort()

const markedEntries = () => screen.getAllByTestId('class-talent-entry').filter((entry) => entry.getAttribute('data-excluded') === 'true')
const markerText = (entry: HTMLElement) => within(entry).getByTestId('class-exclusion-marker').textContent ?? ''

/** The same class with one branch renamed, to show the marker follows the data and not a name. */
function renameBranch<B extends string>(classDef: ClassDefinition<B>, from: B, to: string): ClassDefinition<string> {
  const renamed = (branch: B) => (branch === from ? to : branch)
  return {
    ...classDef,
    branches: classDef.branches.map(renamed),
    branchNames: Object.fromEntries(classDef.branches.map((branch) => [renamed(branch), classDef.branchNames[branch]])),
    branchTaglines: Object.fromEntries(classDef.branches.map((branch) => [renamed(branch), classDef.branchTaglines[branch]])),
    talents: classDef.talents.map((talent) => (talent.branch === from ? { ...talent, branch: to } : talent)),
    plannerConfig: { ...classDef.plannerConfig, branches: classDef.branches.map(renamed) },
  }
}

describe('the catalogue states a branch that cannot be allocated without offering it', () => {
  afterEach(cleanup)

  it('marks every node of a branch with no allocatable entry point, and names the reason', () => {
    expect(entryPointBranches.has('fire'), 'the case under test needs a branch with no entry point').toBe(false)
    expect(entrylessTalents.length).toBeGreaterThan(0)

    render(<ClassDocumentPage classDef={mageClass} page={mageTalentsPage} />)

    const markedIds = markedEntries().map((entry) => entry.getAttribute('data-talent-id') ?? '')
    expect(markedIds.sort()).toEqual(ids(entrylessTalents))
    for (const entry of markedEntries()) {
      expect(markerText(entry)).toMatch(/excluded from build validation/i)
      expect(markerText(entry)).toMatch(/position conflict between the two sources/i)
    }

    // The branch that carries them is marked too, and the branches that can be started are not.
    const branches = [...document.querySelectorAll('.class-catalogue-branch')]
    expect(branches.filter((branch) => branch.getAttribute('data-excluded') === 'true').map((branch) => branch.getAttribute('data-branch')))
      .toEqual(['fire'])
    expect(branches.length).toBe(mageClass.branches.length)
  })

  it('leaves every node of an allocatable branch unmarked', () => {
    render(<ClassDocumentPage classDef={mageClass} page={mageTalentsPage} />)
    const unmarked = screen.getAllByTestId('class-talent-entry').filter((entry) => entry.getAttribute('data-excluded') !== 'true')

    expect(unmarked.map((entry) => entry.getAttribute('data-talent-id') ?? '').sort())
      .toEqual(ids(mageClass.talents.filter((talent) => talent.branch !== 'fire')))
    expect(unmarked.length).toBeGreaterThan(0)
    cleanup()

    // A class where every branch can be started carries no exclusion marker at all.
    render(<ClassDocumentPage classDef={hunterClassFixture} page={pageOfKind('talents')} />)
    expect(screen.queryAllByTestId('class-exclusion-marker')).toHaveLength(0)
  })

  it('marks any class whose branch cannot be started, whatever that branch is called', () => {
    const renamed = renameBranch(mageClass, 'fire', 'inferno')
    expect(renamed.talents.filter((talent) => talent.branch === 'inferno').length).toBe(entrylessTalents.length)

    render(<ClassDocumentPage classDef={renamed} page={mageTalentsPage} />)

    expect(markedEntries().map((entry) => entry.getAttribute('data-talent-id') ?? '').sort())
      .toEqual(ids(entrylessTalents))
    for (const entry of markedEntries()) expect(markerText(entry)).toMatch(/excluded from build validation/i)
    // A branch this class can start from is still unmarked under the same code path.
    expect(screen.getAllByTestId('class-talent-entry').length).toBeGreaterThan(markedEntries().length)
  })

  it('derives the exclusion from the dataset, never from a branch name in the renderer', () => {
    const source = readFileSync(join(process.cwd(), 'src/ClassDocumentPage.tsx'), 'utf8')
    expect(source).not.toMatch(/\bfire\b/i)
    expect(source).not.toMatch(/\binferno\b/i)
    // No second copy of the entry-point rule: the renderer asks the shared gate which branches
    // cannot be started, so a class with a different broken branch needs no renderer change.
    expect(source).toMatch(/unallocatableBranches/)
  })

  it('renders the marker as a third state, distinct from the client and editorial chrome', () => {
    render(<ClassDocumentPage classDef={mageClass} page={mageTalentsPage} />)
    const entry = markedEntries()[0]
    const marker = within(entry).getByTestId('class-exclusion-marker')

    // Both labels it must not be mistaken for are on this same page.
    expect(screen.getAllByText('Client verified').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Community / Editorial Build').length).toBeGreaterThan(0)

    expect(marker.className).not.toMatch(/verification-badge|verification-client_verified|class-build-chip/)
    const text = marker.textContent ?? ''
    expect(text).not.toMatch(/client verified/i)
    expect(text).not.toMatch(/community\s*\/\s*editorial/i)
    expect(text).not.toMatch(/positions and ranks/i)
    expect(within(entry).queryByText(/^Client verified$/)).toBeTruthy() // the node keeps its own evidence badge

    const styles = readFileSync(join(process.cwd(), 'src/styles.css'), 'utf8')
    const markerRule = styles.match(/\.class-exclusion-marker[^{]*\{[^}]*\}/)?.[0] ?? ''
    expect(markerRule, 'the marker needs its own treatment in the stylesheet').not.toBe('')
    expect(markerRule).toContain('dashed')
    expect(markerRule).not.toContain('border-radius: 999px')
    expect(styles.match(/\.verification-badge[^{]*\{[^}]*\}/)?.[0] ?? '').not.toContain('dashed')
  })

  it('enforces the exclusion: a marked node cannot enter a build, preset or copyable allocation', () => {
    const markedIds = new Set(entrylessTalents.map((talent) => talent.id))
    const config = { branches: mageClass.branches, pointCap: mageClass.beta.pointsAtCap }

    // 1. Nothing the site already loads or copies names one. A preset loads `build.build` whole,
    //    and both copyable allocations — the calculator's copy link and the document page's
    //    "edit in calculator" CTA — encode exactly that object through `encodePlannerBuild`.
    for (const build of mageClass.builds) {
      expect(Object.keys(build.build).filter((id) => markedIds.has(id)), build.id).toEqual([])
      expect(encodePlannerBuild(build.build).split('~').map((token) => token.split('.')[0]).filter((id) => markedIds.has(id)), build.id).toEqual([])
    }

    // 2. The allocation path the calculator runs, refused from every state a preset can load.
    for (const talent of entrylessTalents) {
      expect(plannerLockReason({}, talent, mageClass.talents, config)).toMatchObject({ type: 'branch-points' })
      for (const start of [{}, ...mageClass.builds.map((build) => build.build)]) {
        expect(canIncrementPlannerTalent(start, talent, mageClass.talents, config), talent.id).toBe(false)
        // Identity, not a copy: refused allocations return the build they were handed.
        expect(incrementPlannerTalent(start, talent, mageClass.talents, config), talent.id).toBe(start)
      }
    }

    // 3. The same path behind the calculator's own add buttons.
    localStorage.clear()
    history.replaceState({}, '', mageClass.plannerPath)
    render(<ClassCalculatorPage classDef={mageClass} />)

    const control = screen.getByRole('button', { name: /Add rank to Frost Warding/i })
    expect(control.hasAttribute('disabled')).toBe(false)
    fireEvent.click(control)
    expect(document.getElementById('mage-frost-frost-warding')?.textContent).toContain('1/2')
    expect(screen.getAllByText('0/0/1').length).toBeGreaterThan(0) // arcane / fire / frost

    for (const talent of entrylessTalents) {
      const add = screen.getByRole('button', { name: `Add rank to ${talent.name}` })
      expect(add.hasAttribute('disabled'), talent.name).toBe(true)
      fireEvent.click(add)
      expect(document.getElementById(talent.id)?.textContent, talent.id).toContain('0/')
    }
    // The frost point stands and not one fire rank landed, through the buttons or around them.
    expect(screen.getAllByText('0/0/1').length).toBeGreaterThan(0)
    localStorage.clear()
  })
})
