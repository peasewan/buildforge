import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { warriorClass } from '../data/classes/warrior'
import { druidClass } from '../data/classes/druid'
import { priestClass } from '../data/classes/priest'
import { warlockClass } from '../data/classes/warlock'
import { shamanClass } from '../data/classes/shaman'
import {
  DungeonPlanner,
  HealingPlanner,
  PetPlanner,
  PvpPlanner,
  TankPlanner,
  TotemPlanner,
} from './RoleIntentSurfaces'

afterEach(cleanup)

function page<T extends { pages: { slug: string }[] }>(def: T, slug: string) {
  const result = def.pages.find((candidate) => candidate.slug === slug)
  if (!result) throw new Error(`Missing fixture page: ${slug}`)
  return result
}

it('offers a PvP encounter focus and preserves a legal editable route', () => {
  const { container } = render(
    <PvpPlanner
      classDef={warriorClass}
      page={page(warriorClass, 'wow-forever-arms-warrior-pvp-build')}
    />,
  )
  expect(container.querySelector('[data-surface="pvp-matchup"]')).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Set the encounter focus' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Recovery and exit' }))
  expect(screen.getByRole('button', { name: 'Recovery and exit' }).getAttribute('aria-pressed')).toBe('true')
  const link = screen.getByRole('link', { name: 'Edit in Calculator' })
  expect(new URL(link.getAttribute('href')!, 'https://buildforgetools.com').searchParams.get('build')).toContain('warrior-arms')
  expect(screen.getByText(/same talent allocation/)).toBeTruthy()
})

it('keeps a PvP page with no legal allocation explicit and unlinked', () => {
  render(
    <PvpPlanner
      classDef={warriorClass}
      page={page(warriorClass, 'wow-forever-protection-warrior-pvp-build')}
    />,
  )
  expect(screen.getByRole('heading', { name: 'What can be planned now' })).toBeTruthy()
  expect(screen.getByText(/role-specific legal allocation has not been published/)).toBeTruthy()
  expect(screen.queryByRole('link', { name: 'Edit in Calculator' })).toBeNull()
})

it('limits the class PvP picker to reviewed PvP routes', () => {
  render(
    <PvpPlanner
      classDef={warriorClass}
      page={page(warriorClass, 'wow-forever-warrior-pvp-build')}
    />,
  )
  const select = screen.getByLabelText('PvP route') as HTMLSelectElement
  const options = Array.from(select.options).map((option) => option.value)
  expect(options).toEqual(expect.arrayContaining(['warrior-arms-pvp', 'warrior-fury-pvp']))
  expect(options.some((option) => option.includes('leveling'))).toBe(false)
  fireEvent.change(select, { target: { value: 'warrior-fury-pvp' } })
  expect(select.value).toBe('warrior-fury-pvp')
  expect(new URL(screen.getByRole('link', { name: 'Edit in Calculator' }).getAttribute('href')!, 'https://buildforgetools.com').searchParams.get('build')).toContain('warrior-fury')
})

it('prepares a dungeon pull using a phase control before showing the route', () => {
  const { container } = render(
    <DungeonPlanner
      classDef={warriorClass}
      page={page(warriorClass, 'wow-forever-protection-warrior-dungeon-build')}
    />,
  )
  expect(container.querySelector('[data-surface="dungeon-pull"]')).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Prepare a pull' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'After the pull' }))
  expect(screen.getByRole('button', { name: 'After the pull' }).getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByRole('link', { name: 'Edit in Calculator' })).toBeTruthy()
})

it('starts the tank route with threat and mitigation review, then lists selected ranks', () => {
  const { container } = render(
    <TankPlanner
      classDef={druidClass}
      page={page(druidClass, 'wow-forever-feral-druid-tank-build')}
    />,
  )
  expect(container.querySelector('[data-surface="tank-inventory"]')).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Tank review ledger' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Incoming damage' }))
  expect(screen.getByRole('button', { name: 'Incoming damage' }).getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByRole('heading', { name: 'Selected talent ranks' })).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Edit in Calculator' })).toBeTruthy()
})

it('makes mana and group support the first healing comparison', () => {
  const { container } = render(
    <HealingPlanner
      classDef={priestClass}
      page={page(priestClass, 'wow-forever-priest-healing-build')}
    />,
  )
  expect(container.querySelector('[data-surface="healing-compare"]')).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Compare the healing job' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Group support' }))
  expect(screen.getByRole('button', { name: 'Group support' }).getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByRole('link', { name: 'Edit in Calculator' })).toBeTruthy()
})

it('shows selected pet-support ranks without inventing a pet-family dataset', () => {
  const { container } = render(
    <PetPlanner
      classDef={warlockClass}
      page={page(warlockClass, 'wow-forever-warlock-pet-build')}
    />,
  )
  expect(container.querySelector('[data-surface="pet-support"]')).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Selected support talents' })).toBeTruthy()
  expect(container.querySelector('.rs-evidence')?.textContent).toContain('Improved Voidwalker')
  expect(screen.getByText(/No verified pet-family comparison/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Evidence gaps' }))
  expect(screen.getByText(/pet talent tree or pet scaling calculation/)).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Edit in Calculator' })).toBeTruthy()
})

it('shows totem talent coverage and marks spell loadout as unverified', () => {
  const { container } = render(
    <TotemPlanner
      classDef={shamanClass}
      page={page(shamanClass, 'wow-forever-shaman-totem-build')}
    />,
  )
  expect(container.querySelector('[data-surface="totem-coverage"]')).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Totem talent coverage' })).toBeTruthy()
  expect(container.querySelector('.rs-evidence')?.textContent).toContain('Totemic Focus')
  expect(screen.getByText(/Totem spell loadout is not verified/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Spell loadout limits' }))
  expect(screen.getByText(/does not assign totems to slots/)).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Edit in Calculator' })).toBeTruthy()
})
