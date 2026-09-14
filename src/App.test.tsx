import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(cleanup)

describe('Paladin talent calculator page', () => {
  it('labels the interactive planner as a WoW Forever Paladin talent tree', () => {
    render(<App />)

    const primaryHeading = document.querySelector('.hero-copy h1')
    expect(primaryHeading?.textContent).toBe('WoW ForeverPaladin TalentCalculator')
    expect(screen.getByText('Build Paladin talent trees for Holy, Protection, and Retribution.')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'WoW Forever Paladin Talent Tree' })).toBeTruthy()
  })

  it('links all three specialization builds from Popular Builds', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 2, name: 'Popular Paladin Builds' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Holy Paladin Healing Build/ }).getAttribute('href')).toBe('/wow-forever-paladin-build')
    expect(screen.getByRole('link', { name: /Protection Paladin Shield Build/ }).getAttribute('href')).toBe('/wow-forever-protection-paladin-build')
    expect(screen.getByRole('link', { name: /Retribution Paladin Judgment Build/ }).getAttribute('href')).toBe('/wow-forever-retribution-paladin-build')
  })

  it('links the four content-focused build pages', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 2, name: 'Explore Paladin Builds' })).toBeTruthy()
    for (const href of [
      '/wow-forever-paladin-leveling-build',
      '/wow-forever-paladin-pvp-build',
      '/wow-forever-paladin-raid-build',
      '/wow-forever-protection-paladin-dungeon-build',
    ]) {
      expect(document.querySelector(`a[href="${href}"]`)).toBeTruthy()
    }
    expect(document.querySelector('a[href="/wow-forever-paladin-builds"]')).toBeTruthy()
  })

  it('shows field-aware evidence for officially announced talents', () => {
    render(<App />)

    expect(screen.getByText("Light's Vigil")).toBeTruthy()
    expect(screen.getAllByText('Officially confirmed name · Demo-verified details').length).toBeGreaterThan(0)
    const source = screen.getAllByRole('link', { name: 'Blizzard WoW Forever Deep Dive' })[0]
    expect(source.getAttribute('href')).toContain('worldofwarcraft.blizzard.com')
  })
})
