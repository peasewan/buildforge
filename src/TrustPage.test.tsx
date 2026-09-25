import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import TrustPage from './TrustPage'

afterEach(cleanup)

describe('site trust pages', () => {
  it.each([
    ['about', 'About BuildForgeTools'],
    ['contact', 'Contact BuildForgeTools'],
    ['privacy', 'Privacy Policy'],
  ] as const)('renders the %s page with its own heading', (pageId, heading) => {
    render(<TrustPage pageId={pageId} />)

    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeTruthy()
  })

  it('explains how to report talent-data errors without publishing a personal email address', () => {
    render(<TrustPage pageId="contact" />)

    expect(screen.getByText(/Feedback button/)).toBeTruthy()
    expect(document.querySelector('a[href^="mailto:"]')).toBeNull()
  })

  it('presents BuildForgeTools as a multi-game planning site', () => {
    render(<TrustPage pageId="about" />)

    expect(screen.getByRole('heading', { level: 2, name: 'Current Games' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Explore WoW Forever tools' }).getAttribute('href')).toBe('/wow-forever-classes')
    expect(screen.getByRole('link', { name: 'Explore the Emberville planner' }).getAttribute('href')).toBe('/emberville')
    expect(screen.getByText(/tools and reproducible build data/)).toBeTruthy()
  })

  it('asks for game-neutral correction evidence', () => {
    render(<TrustPage pageId="contact" />)

    expect(screen.getByText(/game, affected system, class, build, skill, or talent/)).toBeTruthy()
  })

  it('discloses analytics and private feedback storage', () => {
    render(<TrustPage pageId="privacy" />)

    expect(screen.getByRole('heading', { level: 2, name: 'Analytics' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Feedback Data' })).toBeTruthy()
    expect(screen.getByText(/Vercel Blob/)).toBeTruthy()
    expect(screen.getByText(/talent or skill interactions/)).toBeTruthy()
  })

  it('explains future advertising cookies and gives visitors a personalization opt-out', () => {
    render(<TrustPage pageId="privacy" />)

    expect(screen.getByText(/does not currently display third-party advertising/)).toBeTruthy()
    expect(screen.getByText(/third-party vendors, including Google, may use cookies to serve ads based on prior visits/i)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Google Ads Settings' }).getAttribute('href')).toBe('https://www.google.com/settings/ads')
    expect(screen.getByText(/Google-certified consent platform/)).toBeTruthy()
  })
})
