import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import BuildCard from './BuildCard'

describe('BuildCard', () => {
  it('renders reusable build metadata and destination', () => {
    render(<BuildCard eyebrow="Protection" title="Dungeon Tank Build" role="Tank" focus="Defensive" href="/tank" icon="protection" />)

    expect(screen.getByRole('heading', { level: 3, name: 'Dungeon Tank Build' })).toBeTruthy()
    expect(screen.getByText('Tank')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Open Build/ }).getAttribute('href')).toBe('/tank')
  })
})
