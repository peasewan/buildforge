import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import PaladinBuildsHub from './PaladinBuildsHub'
import { HUB_BUILD_HREFS, HUB_PLAYSTYLE_SECTIONS, HUB_SPECIALIZATIONS } from './data/paladinBuildsHub'
import { SPEC_BUILDS_HUBS } from './data/specBuildsHubs'

afterEach(cleanup)

function captureTrackedEvents() {
  const events: { event: string; params: Record<string, unknown> }[] = []
  window.gtag = (_command: string, ...args: unknown[]) => { events.push({ event: args[0] as string, params: args[1] as Record<string, unknown> }) }
  return events
}

const clickAll = (hrefs: string[]) => {
  for (const href of hrefs) fireEvent.click(document.querySelector(`a[href="${href}"]`)!)
}

describe('Paladin builds hub', () => {
  it('connects the specializations and calculator', () => {
    render(<PaladinBuildsHub />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Paladin Builds & Talent Calculator' })).toBeTruthy()
    for (const spec of HUB_SPECIALIZATIONS) expect(document.querySelector(`a[href="${spec.href}"]`)).toBeTruthy()
    expect(document.querySelector('a[href="/paladin"]')).toBeTruthy()
  })

  it('links every build its own data declares', () => {
    render(<PaladinBuildsHub />)

    for (const href of HUB_BUILD_HREFS) expect(document.querySelector(`a[href="${href}"]`)).toBeTruthy()
  })

  it('lists the spec-specific builds next to their generic parents', () => {
    render(<PaladinBuildsHub />)

    for (const href of [
      '/wow-forever-protection-paladin-leveling-build',
      '/wow-forever-retribution-paladin-pvp-build',
      '/wow-forever-holy-paladin-pvp-build',
    ]) expect(document.querySelector(`a[href="${href}"]`)).toBeTruthy()
  })

  it('sends a specialization card to its hub whenever that specialization has one', () => {
    for (const spec of HUB_SPECIALIZATIONS) {
      const hub = SPEC_BUILDS_HUBS.find((candidate) => candidate.spec === spec.id)

      if (hub) expect(spec.href, `${spec.id} has a hub but its card points elsewhere`).toBe(`/${hub.slug}`)
    }
  })

  it('never promises a specialization its destination does not deliver', () => {
    for (const build of HUB_PLAYSTYLE_SECTIONS.flatMap((section) => section.builds)) {
      const promised = build.title.match(/\b(Holy|Protection|Retribution)\b/)?.[1].toLowerCase()

      if (promised) expect(build.href, `"${build.title}" promises ${promised}`).toContain(`-${promised}-`)
    }
  })

  it('reports every build card under its own stable id', () => {
    const events = captureTrackedEvents()
    const builds = HUB_PLAYSTYLE_SECTIONS.flatMap((section) => section.builds)
    render(<PaladinBuildsHub />)

    clickAll(builds.map((build) => build.href))

    for (const build of builds) {
      const click = events.find((entry) => entry.params.destination === build.href)

      expect(click?.params.placement, `${build.href} should report its own id`).toBe(build.id)
    }
  })

  it('reports every specialization under its own stable id', () => {
    const events = captureTrackedEvents()
    render(<PaladinBuildsHub />)

    clickAll(HUB_SPECIALIZATIONS.map((spec) => spec.href))

    for (const spec of HUB_SPECIALIZATIONS) {
      const click = events.find((entry) => entry.params.destination === spec.href)

      expect(click?.params.placement).toBe(`spec-${spec.id}`)
    }
  })

  it('does not derive placement from display text', () => {
    const events = captureTrackedEvents()
    render(<PaladinBuildsHub />)

    clickAll(HUB_PLAYSTYLE_SECTIONS.flatMap((section) => section.builds.map((build) => build.href)))

    for (const entry of events) {
      expect(String(entry.params.placement)).not.toMatch(/paladin leveling build|dungeon tank build/i)
    }
  })
})
