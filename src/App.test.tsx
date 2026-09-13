import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(cleanup)

describe('Paladin talent calculator page', () => {
  it('labels the interactive planner as a WoW Forever Paladin talent tree', () => {
    render(<App />)

    const primaryHeading = document.querySelector('.hero-copy h1')
    expect(primaryHeading?.textContent).toBe('WoW ForeverPaladin TalentCalculator')
    expect(screen.getByRole('heading', { level: 2, name: 'WoW Forever Paladin Talent Tree' })).toBeTruthy()
  })

  it('links all three specialization builds from Popular Builds', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 2, name: 'Popular Paladin Builds' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Holy Paladin Healing Build/ }).getAttribute('href')).toBe('/wow-forever-paladin-build')
    expect(screen.getByRole('link', { name: /Protection Paladin Shield Build/ }).getAttribute('href')).toBe('/wow-forever-protection-paladin-build')
    expect(screen.getByRole('link', { name: /Retribution Paladin Judgment Build/ }).getAttribute('href')).toBe('/wow-forever-retribution-paladin-build')
  })
})
