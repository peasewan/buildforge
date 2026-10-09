import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { hunterClass } from '../data/classes/hunter'
import { druidClass } from '../data/classes/druid'
import ClassExperiencePage from './ClassExperiencePage'

const SOURCE = 'https://news.blizzard.com/en-us/article/24301515/world-of-warcraft-forever-class-deep-dives-hunter-and-druid'
const OCTOBER_SOURCE = 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696'
const targetSlugs = [
  'wow-forever-hunter-builds',
  'wow-forever-beast-mastery-vs-marksmanship-hunter-leveling',
  'wow-forever-hunter-pvp-build',
  'wow-forever-hunter-pet-build',
]

afterEach(cleanup)

function renderHunter(slug: string) {
  const page = hunterClass.pages.find((candidate) => candidate.slug === slug)!
  return render(<ClassExperiencePage classDef={hunterClass} page={page} />)
}

function officialUpdate() {
  return within(screen.getByRole('region', { name: 'Hunter official class deep dive' }))
}

it('shows a source-linked official design note only on the four reviewed Hunter pages', () => {
  for (const slug of targetSlugs) {
    renderHunter(slug)
    const note = officialUpdate()
    expect(note.getByRole('link', { name: /Blizzard class deep dive/i }).getAttribute('href')).toBe(SOURCE)
    expect(note.getByRole('link', { name: /October 1 Beta notes/i }).getAttribute('href')).toBe(OCTOBER_SOURCE)
    expect(note.getByText(/Sep 30, 2026/)).toBeTruthy()
    expect(note.getByText(/Talent structure was reconciled through/).textContent).toContain('1.60.1.70291')
    expect(note.queryByText(/Editable talent records still come from client build/i)).toBeNull()
    cleanup()
  }
  for (const page of hunterClass.pages.filter((candidate) => !targetSlugs.includes(candidate.slug))) {
    render(<ClassExperiencePage classDef={hunterClass} page={page} />)
    expect(screen.queryByRole('region', { name: 'Hunter official class deep dive' }), page.slug).toBeNull()
    cleanup()
  }
  render(<ClassExperiencePage classDef={druidClass} page={druidClass.pages.find((page) => page.kind === 'buildsHub')!} />)
  expect(screen.queryByRole('region', { name: 'Hunter official class deep dive' })).toBeNull()
  expect(hunterClass.sources.some((source) => source.url === SOURCE)).toBe(false)
}, 20_000)

it('explains the three official Hunter baseline changes on the builds hub', () => {
  renderHunter('wow-forever-hunter-builds')
  const note = officialUpdate()
  expect(note.getByText(/Aimed Shot.*baseline.*level 20/i)).toBeTruthy()
  expect(note.getByText(/traps.*combat.*30 seconds/i)).toBeTruthy()
  expect(note.getByText(/pet stats.*Hunter.*gear/i)).toBeTruthy()
  expect(note.getByText(/no scaling formula/i)).toBeTruthy()
})

it('keeps announced BM and MM milestones separate from editable current routes and Level 20 stages', () => {
  renderHunter('wow-forever-beast-mastery-vs-marksmanship-hunter-leveling')
  const note = officialUpdate()
  expect(note.getByText(/Summon Hawk.*16-point/i)).toBeTruthy()
  expect(note.getByText(/Lone Wolf.*11-point/i)).toBeTruthy()
  expect(note.getByText(/Trueshot Aura.*21-point/i)).toBeTruthy()
  expect(note.getByText(/Level 20.*eleven points/i)).toBeTruthy()
  expect(note.getByText(/reviewed.*1\.60\.1\.70291.*21-point Level 30 endpoints/i)).toBeTruthy()
  expect(note.queryByText(/does not verify a Level 30 allocation/i)).toBeNull()
  expect(note.queryByText(/calculator still loads a reviewed Level 20 plan/i)).toBeNull()
  expect(note.queryByText(/blank calculator.*historical.*removed/i)).toBeNull()
})

it('uses the current talent tree while retaining explicit historical context for replaced nodes', () => {
  renderHunter('wow-forever-beast-mastery-vs-marksmanship-hunter-leveling')
  const note = officialUpdate()
  expect(note.getByText(/Aimed Shot is baseline and is not purchased as a talent/i)).toBeTruthy()
  expect(document.body.textContent).toContain('Trueshot Aura')
  expect(document.body.textContent).not.toContain('1.60.1.69913 client-table route')
  cleanup()

  renderHunter('wow-forever-hunter-pet-build')
  const petRoute = within(screen.getByRole('heading', { name: 'Evaluate the pet-supported loop' }).closest('section')!)
  expect(petRoute.getByText(/70291 route uses Endurance Training/)).toBeTruthy()
  expect(petRoute.getByText(/old Thick Hide node is retained only in the historical dataset/)).toBeTruthy()
  expect(hunterClass.talents.some(talent => talent.name === 'Thick Hide' || talent.name === 'Aimed Shot')).toBe(false)
})

it('states the official trap rules on Hunter PvP without a crit damage claim', () => {
  renderHunter('wow-forever-hunter-pvp-build')
  const note = officialUpdate()
  expect(note.getByText(/traps.*in combat.*30-second cooldown/i)).toBeTruthy()
  expect(note.getByText(/Fire.*Frost.*separate cooldowns/i)).toBeTruthy()
  expect(note.getByText(/Deflection.*1\/2\/3\/4\/5%/i)).toBeTruthy()
  expect(note.getByText(/reviewed.*Survival example spends 21 points at Level 30/i)).toBeTruthy()
  expect(note.queryByText(/no 21-point Hunter PvP route has been reviewed/i)).toBeNull()
  expect(note.queryByText(/crit damage|critical damage/i)).toBeNull()
})

it('separates current Level 30 endpoints from eleven-point Level 20 stages', () => {
  renderHunter('wow-forever-beast-mastery-vs-marksmanship-hunter-leveling')
  expect(document.body.textContent).toMatch(/21-point Level 30 endpoints/i)
  expect(document.body.textContent).toMatch(/Level 20 snapshots each spend eleven points/i)
  expect(document.body.textContent).toMatch(/live Beta cap is Level 30/i)
  expect(document.body.textContent).toMatch(/same ranged weapon, pet and equipment/i)
  expect(document.body.textContent).toMatch(/rank text is a licensed community transcription/i)
  expect(document.body.textContent).toMatch(/point-order rules remain derived assumptions/i)
})

it('lets readers search and select all 18 official pet families without ranking them', () => {
  renderHunter('wow-forever-hunter-pet-build')
  const note = officialUpdate()
  expect(note.getAllByRole('button', { name: /view .* family ability/i })).toHaveLength(18)
  fireEvent.change(note.getByRole('searchbox', { name: 'Search pet family or ability' }), { target: { value: 'web' } })
  expect(note.getAllByRole('button', { name: /view .* family ability/i })).toHaveLength(1)
  fireEvent.click(note.getByRole('button', { name: /view Spider family ability/i }))
  expect(note.getByRole('status').textContent).toMatch(/Spider.*Web.*immobiliz/i)
  fireEvent.change(note.getByRole('searchbox', { name: 'Search pet family or ability' }), { target: { value: 'fox' } })
  fireEvent.click(note.getByRole('button', { name: /view Fox family ability/i }))
  expect(note.getByRole('status').textContent).toMatch(/Fox.*Trickster's Dance.*dodge.*attack speed/i)
  expect(note.queryByText(/best pet|DPS ranking|scaling coefficient/i)).toBeNull()
  expect(note.getByText(/no scaling formula/i)).toBeTruthy()
})

it('dates reviewed active Hunter tasks while retaining explicit consolidation history', () => {
  for (const page of hunterClass.pages.filter(page => !page.retiredTo)) expect(page.updatedAt).toBe('2026-10-09')
  expect(hunterClass.pages.find(page => page.slug === 'wow-forever-hunter-pet-build')?.retiredTo).toBeUndefined()
})
