import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import SpecBuildsHub from './SpecBuildsHub'
import { SPEC_BUILDS_HUBS } from './data/specBuildsHubs'
import { betaLevelingPlannerHref } from './data/levelingBeta'

afterEach(cleanup)

describe('specialization builds hub', () => {
  it.each(SPEC_BUILDS_HUBS.map((hub) => [hub.spec, hub.title] as const))(
    'renders the %s hub from its own configuration',
    (spec, title) => {
      render(<SpecBuildsHub spec={spec} />)

      expect(screen.getByRole('heading', { level: 1, name: title })).toBeTruthy()
    },
  )

  it('never promises a specialization its destination does not deliver', () => {
    for (const hub of SPEC_BUILDS_HUBS) {
      for (const build of hub.buildTypes) {
        for (const copy of [build.title, build.eyebrow]) {
          const promised = copy.match(/\b(Holy|Protection|Retribution)\b/)?.[1].toLowerCase()

          if (promised) expect(build.href, `"${copy}" promises ${promised}`).toContain(`-${promised}-`)
        }
      }
    }
  })

  it('reports every build type under its own stable id', () => {
    for (const hub of SPEC_BUILDS_HUBS) {
      cleanup()
      const events: Record<string, unknown>[] = []
      window.gtag = (_command: string, ...args: unknown[]) => { events.push(args[1] as Record<string, unknown>) }
      render(<SpecBuildsHub spec={hub.spec} />)

      for (const build of hub.buildTypes) {
        for (const anchor of document.querySelectorAll(`a[href="${build.href}"]`)) fireEvent.click(anchor)
      }

      for (const build of hub.buildTypes) {
        const placements = events.filter((entry) => entry.destination === build.href).map((entry) => entry.placement)

        expect(placements, `${build.href} should report its own id`).toContain(`type-${build.id}`)
      }
    }
  })

  it('keeps the event name per specialization so existing history stays continuous', () => {
    const events: string[] = []
    window.gtag = (command: string, ...args: unknown[]) => { events.push(args[0] as string) }
    render(<SpecBuildsHub spec="protection" />)

    fireEvent.click(document.querySelector('a[href="/wow-forever-protection-paladin-dungeon-build"]')!)

    expect(events).toContain('protection_hub_click')
  })

  it('shows the reviewed Beta version on specialization hubs', () => {
    render(<SpecBuildsHub spec="retribution" />)

    expect(screen.getByText('Beta build 1.60.1.70245')).toBeTruthy()
    expect(screen.getByText('70245 structure reviewed October 7, 2026')).toBeTruthy()
    expect(screen.getByText('14 talents with 32 changed rank strings since 69913 in that comparison')).toBeTruthy()
  })

  it('puts the editable Protection route before the historical featured build', () => {
    render(<SpecBuildsHub spec="protection" />)

    const route = screen.getByRole('region', { name: 'Current Beta Protection starting route' })
    expect(route.textContent).toContain('Level 20')
    expect(route.textContent).toContain('0/11/0')
    expect(route.textContent).toContain('0/21/0')
    expect(betaLevelingPlannerHref('protection-leveling')).toContain('level=20')
    expect(route.querySelector('a[href*="improved_holy_strike"]')).toBeNull()
    expect(route.querySelector('a[href*="redoubt.5"][href*="level=20"]')).toBeTruthy()
    expect(route.querySelector('a[href="/wow-forever-protection-paladin-leveling-build"]')).toBeTruthy()
    expect(route.compareDocumentPosition(document.querySelector('#featured-build')!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(document.querySelector('#featured-build')?.textContent).toContain('Historical 51-point reference')
  })

  it('advertises the reviewed-node Protection route without an archived label', () => {
    render(<SpecBuildsHub spec="protection" />)

    const links = document.querySelectorAll('a[href="/wow-forever-protection-paladin-leveling-build"]')
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) expect(link.closest('article, .spec-beta-start')?.textContent).not.toMatch(/archived/i)
  })

  it('does not add the Protection starting route to Retribution', () => {
    render(<SpecBuildsHub spec="retribution" />)
    expect(screen.queryByRole('region', { name: 'Archived Beta Protection starting route' })).toBeNull()
  })

  it('presents the two full Retribution snapshots as historical removals without promising to load them', () => {
    render(<SpecBuildsHub spec="retribution" />)
    expect(document.querySelector('#featured-build')?.textContent).toContain('Historical 51-point reference')
    expect(document.body.textContent).toMatch(/0\/20\/31.*historical/i)
    expect(document.body.textContent).toMatch(/Crusade.*absent.*70245/i)
    expect(document.body.textContent).not.toContain('open that exact setup in the calculator')
  })

  it('gives every specialization hub a substantial, distinct editorial guide', () => {
    for (const hub of SPEC_BUILDS_HUBS) {
      const sections = (hub as typeof hub & { editorialSections?: { heading: string; paragraphs: string[] }[] }).editorialSections
      const words = sections?.flatMap((section) => [section.heading, ...section.paragraphs]).join(' ').match(/[A-Za-z0-9'-]+/g)?.length ?? 0

      expect(sections?.length).toBeGreaterThanOrEqual(3)
      expect(words, `${hub.spec} hub editorial copy`).toBeGreaterThanOrEqual(350)
      expect(sections?.some((section) => section.heading.includes(hub.spec === 'protection' ? 'Protection' : 'Retribution'))).toBe(true)
    }
  })
})
