import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import ProtectionBuildsHub from './ProtectionBuildsHub'

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
})
