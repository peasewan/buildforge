import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import WarriorBuildPage from './WarriorBuildPage'
import WarriorBuildsHub from './WarriorBuildsHub'

describe('Warrior build pages', () => {
  afterEach(cleanup)
  it.each(['leveling', 'arms', 'fury', 'protection'] as const)('renders the %s page with an executable calculator link', (pageId) => {
    render(<WarriorBuildPage pageId={pageId} />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Warrior')
    expect(screen.getByRole('link', { name: /Open .* Calculator/i }).getAttribute('href')).toContain('/warrior?build=')
    expect(screen.getByText(/Community recommendation/i)).toBeTruthy()
  })

  it('links all three specializations from the Warrior hub', () => {
    render(<WarriorBuildsHub />)
    for (const label of ['Arms Warrior Build', 'Fury Warrior Build', 'Protection Warrior Build']) {
      expect(screen.getByRole('link', { name: label })).toBeTruthy()
    }
  })
})
