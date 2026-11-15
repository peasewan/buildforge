import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import PaladinBuildsHub from './PaladinBuildsHub'
import { HUB_BUILD_HREFS, HUB_PLAYSTYLE_SECTIONS, HUB_SPECIALIZATIONS } from './data/paladinBuildsHub'
import { SPEC_BUILDS_HUBS } from './data/specBuildsHubs'
import { resolvePageHref } from './lib/pageRetirement'

afterEach(() => { cleanup(); window.gtag = undefined })

function captureTrackedEvents() {
  const events: { event: string; params: Record<string, unknown> }[] = []
  window.gtag = (_command: string, ...args: unknown[]) => { events.push({ event: args[0] as string, params: args[1] as Record<string, unknown> }) }
  return events
}

const clickWithoutNavigation = (link: HTMLElement) => {
  link.addEventListener('click', event => event.preventDefault(), { once: true })
  fireEvent.click(link)
}
const buildLink = (title: string) => {
  const link = screen.getByRole('heading', { name: title }).closest('.build-card')?.querySelector('a')
  expect(link, title).toBeTruthy()
  return link!
}

describe('Paladin builds hub', () => {
  it('connects the specializations and calculator', () => {
    render(<PaladinBuildsHub />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Paladin Builds & Talent Calculator' })).toBeTruthy()
    for (const spec of HUB_SPECIALIZATIONS) expect(screen.getByRole('heading', { name: spec.name }).closest('a')?.getAttribute('href')).toBe(resolvePageHref(spec.href))
    expect(document.querySelector('a[href="/paladin"]')).toBeTruthy()
  })

  it('links every build its own data declares', () => {
    render(<PaladinBuildsHub />)

    for (const href of HUB_BUILD_HREFS) expect(document.querySelector(`a[href="${resolvePageHref(href)}"]`)).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-paladin-abilities"]')).toBeNull()
  })

  it('shows the current Beta build status without changing the hub title', () => {
    render(<PaladinBuildsHub />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Paladin Builds & Talent Calculator' })).toBeTruthy()
    expect(screen.getByText('Beta build 1.60.1.70245')).toBeTruthy()
    expect(screen.getByText('70245 structure reviewed October 7, 2026')).toBeTruthy()
    expect(screen.getByText('14 talents with 32 changed rank strings since 69913 in that comparison')).toBeTruthy()
  })

  it('lists the spec-specific builds next to their generic parents', () => {
    render(<PaladinBuildsHub />)

    for (const href of [
      '/wow-forever-protection-paladin-leveling-build',
      '/wow-forever-retribution-paladin-pvp-build',
      '/wow-forever-holy-paladin-pvp-build',
    ]) expect(document.querySelector(`a[href="${href}"]`)).toBeTruthy()
  })

  it('labels the editable Protection leveling route before sending readers to it', () => {
    render(<PaladinBuildsHub />)

    const link = document.querySelector('a[href="/wow-forever-protection-paladin-leveling-build"]')
    expect(link?.closest('.build-card')?.textContent).toMatch(/0\/11\/0/i)
    expect(link?.closest('.build-card')?.textContent).toMatch(/0\/21\/0/i)
  })

  it('labels the Ret 51-point leveling example as historical before readers open it', () => {
    render(<PaladinBuildsHub />)

    const link = document.querySelector('a[href="/wow-forever-retribution-paladin-leveling-build"]')
    expect(link?.closest('.build-card')?.textContent).toMatch(/historical/i)
    expect(link?.closest('.build-card')?.textContent).toMatch(/Crusade.*absent/i)
  })

  it('sends a specialization card to its retained hub or consolidated build destination', () => {
    render(<PaladinBuildsHub />)
    for (const spec of HUB_SPECIALIZATIONS) {
      const hub = SPEC_BUILDS_HUBS.find((candidate) => candidate.spec === spec.id)

      if (hub) expect(screen.getByRole('heading', { name: spec.name }).closest('a')?.getAttribute('href')).toBe(resolvePageHref(`/${hub.slug}`))
    }
  })

  it('never promises a specialization its destination does not deliver', () => {
    for (const build of HUB_PLAYSTYLE_SECTIONS.flatMap((section) => section.builds)) {
      const promised = build.title.match(/\b(Holy|Protection|Retribution)\b/)?.[1].toLowerCase()

      if (promised) expect(resolvePageHref(build.href), `"${build.title}" promises ${promised}`).toContain(`-${promised}-`)
    }
  })

  it('reports every build card under its own stable id', () => {
    const events = captureTrackedEvents()
    const builds = HUB_PLAYSTYLE_SECTIONS.flatMap((section) => section.builds)
    render(<PaladinBuildsHub />)

    for (const build of builds) {
      const link = buildLink(build.title)
      expect(link.getAttribute('href')).toBe(resolvePageHref(build.href))
      clickWithoutNavigation(link)
      expect(events.filter(entry => entry.params.placement === build.id), build.id).toEqual([
        { event: 'paladin_hub_click', params: { placement: build.id, destination: build.href } },
      ])
    }
  })

  it('reports every specialization under its own stable id', () => {
    const events = captureTrackedEvents()
    render(<PaladinBuildsHub />)

    for (const spec of HUB_SPECIALIZATIONS) {
      const link = screen.getByRole('heading', { name: spec.name }).closest('a')!
      expect(link.getAttribute('href')).toBe(resolvePageHref(spec.href))
      clickWithoutNavigation(link)
      expect(events.filter(entry => entry.params.placement === `spec-${spec.id}`)).toEqual([
        { event: 'paladin_hub_click', params: { placement: `spec-${spec.id}`, destination: spec.href } },
      ])
    }
  })

  it('does not derive placement from display text', () => {
    const events = captureTrackedEvents()
    render(<PaladinBuildsHub />)

    for (const build of HUB_PLAYSTYLE_SECTIONS.flatMap(section => section.builds)) clickWithoutNavigation(buildLink(build.title))

    for (const entry of events) {
      expect(String(entry.params.placement)).not.toMatch(/paladin leveling build|dungeon tank build/i)
    }
  })
})
