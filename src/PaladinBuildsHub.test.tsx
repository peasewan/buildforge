import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import PaladinBuildsHub from './PaladinBuildsHub'

afterEach(cleanup)

describe('Paladin builds hub', () => {
  it('connects the specializations and calculator', () => {
    render(<PaladinBuildsHub />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Paladin Builds & Talent Calculator' })).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-holy-paladin-build"]')).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-protection-paladin-builds"]')).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-retribution-paladin-build"]')).toBeTruthy()
    expect(document.querySelector('a[href="/paladin"]')).toBeTruthy()
  })

  it('links every content-focused build page', () => {
    render(<PaladinBuildsHub />)

    for (const href of [
      '/wow-forever-protection-paladin-dungeon-build',
      '/wow-forever-paladin-leveling-build',
      '/wow-forever-paladin-pvp-build',
      '/wow-forever-paladin-raid-build',
    ]) expect(document.querySelector(`a[href="${href}"]`)).toBeTruthy()
  })
})
