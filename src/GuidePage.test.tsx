import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GuidePage from './GuidePage'

describe('Paladin talents guide', () => {
  it('preserves the title that serves existing talent and build queries', () => {
    render(<GuidePage />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Paladin Talent Guide & Build Planner' })).toBeTruthy()
  })
})
