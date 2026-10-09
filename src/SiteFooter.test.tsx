import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import SiteFooter from './SiteFooter'
import { publishedClassCatalogues } from './lib/classStaticPages'

afterEach(cleanup)

describe('site footer entries', () => {
  it('names the Emberville notebook truthfully while preserving the existing resource destinations', () => {
    render(<SiteFooter />)

    const resources = within(screen.getByRole('navigation', { name: 'BuildForgeTools resources' }))
    expect(resources.getByRole('link', { name: 'Emberville Notebook' }).getAttribute('href')).toBe('/emberville')
    expect(resources.queryByRole('link', { name: 'Emberville Planner' })).toBeNull()
    for (const [label, href] of [
      ['Warrior Calculator', '/warrior'],
      ['Warrior Builds', '/wow-forever-warrior-builds'],
      ['Paladin Builds', '/wow-forever-paladin-builds'],
      ['Talent Calculator', '/paladin'],
      ['Paladin Talents', '/wow-forever-paladin-talents'],
      ['Paladin Abilities', '/wow-forever-paladin-abilities'],
    ]) {
      expect(resources.getByRole('link', { name: label }).getAttribute('href')).toBe(href)
    }
    for (const { classDef, page } of publishedClassCatalogues()) {
      expect(resources.getByRole('link', { name: `${classDef.name} Talents` }).getAttribute('href')).toBe(`/${page.slug}`)
    }
    expect(screen.getByRole('link', { name: 'About' }).getAttribute('href')).toBe('/about')
    expect(screen.getByRole('link', { name: 'Contact' }).getAttribute('href')).toBe('/contact')
    expect(screen.getByRole('link', { name: 'Privacy' }).getAttribute('href')).toBe('/privacy')
  })
})
