import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import ProtectionBuildsHub from './ProtectionBuildsHub'
import { PROTECTION_HUB_BUILD_TYPES } from './data/protectionBuildsHub'

afterEach(cleanup)

describe('Protection Paladin builds hub', () => {
  it('connects the featured build, build types, talents, and calculator', () => {
    render(<ProtectionBuildsHub />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Protection Paladin Builds' })).toBeTruthy()
    for (const href of [
      '/wow-forever-protection-paladin-build',
      '/wow-forever-protection-paladin-dungeon-build',
      '/wow-forever-paladin-leveling-build',
      '/wow-forever-paladin-pvp-build',
      '/wow-forever-protection-paladin-talents',
      '/paladin',
    ]) expect(document.querySelector(`a[href="${href}"]`)).toBeTruthy()
  })

  it('sends the Leveling Tank card to the Protection leveling build it names', () => {
    render(<ProtectionBuildsHub />)

    expect(document.querySelector('a[href="/wow-forever-protection-paladin-leveling-build"]')).toBeTruthy()
  })

  it('never promises a specialization its destination does not deliver', () => {
    for (const build of PROTECTION_HUB_BUILD_TYPES) {
      for (const copy of [build.title, build.eyebrow]) {
        const promised = copy.match(/\b(Holy|Protection|Retribution)\b/)?.[1].toLowerCase()

        if (promised) expect(build.href, `"${copy}" promises ${promised}`).toContain(`-${promised}-`)
      }
    }
  })

  it('reports every build type under its own stable id', () => {
    const events: Record<string, unknown>[] = []
    window.gtag = (_command: string, ...args: unknown[]) => { events.push(args[1] as Record<string, unknown>) }
    render(<ProtectionBuildsHub />)

    for (const build of PROTECTION_HUB_BUILD_TYPES) {
      for (const anchor of document.querySelectorAll(`a[href="${build.href}"]`)) fireEvent.click(anchor)
    }

    for (const build of PROTECTION_HUB_BUILD_TYPES) {
      const placements = events.filter((entry) => entry.destination === build.href).map((entry) => entry.placement)

      expect(placements, `${build.href} should report its own id`).toContain(`type-${build.id}`)
    }
  })
})
