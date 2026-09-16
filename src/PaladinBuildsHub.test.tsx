import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import PaladinBuildsHub from './PaladinBuildsHub'
import { HUB_BUILD_HREFS } from './data/paladinBuildsHub'

afterEach(cleanup)

describe('Paladin builds hub', () => {
  it('connects the specializations and calculator', () => {
    render(<PaladinBuildsHub />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Paladin Builds & Talent Calculator' })).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-paladin-build"]')).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-protection-paladin-builds"]')).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-retribution-paladin-build"]')).toBeTruthy()
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
})
