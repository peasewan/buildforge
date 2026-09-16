import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import SpecBuildsHub from './SpecBuildsHub'
import { SPEC_BUILDS_HUBS } from './data/specBuildsHubs'

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
})
