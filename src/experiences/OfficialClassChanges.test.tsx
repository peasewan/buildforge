import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import OfficialClassChanges from './OfficialClassChanges'

const source = 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696/1'

afterEach(cleanup)

const classes = ['warrior', 'mage', 'rogue', 'priest', 'druid', 'warlock', 'hunter', 'shaman'] as const

it.each(classes)('shows sourced October 1 %s changes apart from the older talent snapshot', (classId) => {
  render(<OfficialClassChanges classId={classId} />)
  const dateLabel = classId === 'warrior' ? 'October 1–2' : 'October 1'
  const notice = within(screen.getByRole('region', { name: new RegExp(`${classId} ${dateLabel} official changes`, 'i') }))

  expect(notice.getByRole('link', { name: /Blizzard.*October 1 development notes/i }).getAttribute('href')).toBe(source)
  expect(notice.getByText(/live Beta level cap is 30/i)).toBeTruthy()
  expect(notice.getByText(/1\.60\.1\.69913.*older/i)).toBeTruthy()
  expect(notice.getByText(/Level 20.*11 talent points.*starting snapshots/i)).toBeTruthy()
  expect(notice.getByText(/Level 30 allocation.*not.*verified/i)).toBeTruthy()
})

it('does not show an October 1 notice for a class outside this eight-class scope', () => {
  render(<OfficialClassChanges classId="paladin" />)
  expect(screen.queryByRole('region')).toBeNull()
})

it.each([
  ['druid', /King of the Jungle.*removed/i, /Tiger.s Fury.*removed/i, /Shifting Power.*row 4.*Improved Shifting Power.*row 5/i],
  ['hunter', /Deflection.*1\/2\/3\/4\/5%.*2\/4\/6\/8\/10%/i, /31-point.*Sniper Shot.*45-yard/i, /Aggressive Mode.*pet/i],
  ['mage', /Hot Streak.*Heating Up/i, /Combustion.*3.*4/i, /Winter.s Chill.*resist/i],
  ['priest', /Early Demise.*health/i, /Inner Focus.*periodic/i, /Shadow Weaving.*apply/i],
  ['shaman', /Totemic Recall.*Mana/i, /Disease Cleansing Totem.*5-minute/i, /no Shaman talent-tree change/i],
  ['warlock', /Soul Harvesting.*Soul Harvest.*50\/100%.*Mana regeneration/i, /Hellfire.*critically strike/i, /Aggressive Mode.*pet/i],
  ['warrior', /Improved Cleave.*Boundless Rage.*removed/i, /Lingering Rage.*row 2.*Furious Precision.*row 3/i, /Toughness.*removed.*Iron Will.*Protection row 1/i],
  ['rogue', /Expose Armor.*miss.*combo points/i, /Setup.*same target.*dodge or spell resist/i, /gameplay fixes.*not.*new talent tree/i],
] as const)('reports October 1 %s class changes', (classId, ...patterns) => {
  render(<OfficialClassChanges classId={classId} />)
  const dateLabel = classId === 'warrior' ? 'October 1–2' : 'October 1'
  const notice = screen.getByRole('region', { name: new RegExp(`${classId} ${dateLabel} official changes`, 'i') })
  for (const pattern of patterns) expect(within(notice).getByText(pattern)).toBeTruthy()
})

it('links the superseding October 2 Warrior announcement and its 100% Rage change', () => {
  render(<OfficialClassChanges classId="warrior" />)
  const notice = within(screen.getByRole('region', { name: /Warrior October 1–2 official changes/i }))
  expect(notice.getByRole('link', { name: /October 2 Warrior follow-up/i }).getAttribute('href')).toContain('warrior-updates-in-todays-beta-build')
  expect(notice.getByText(/100% extra Rage/i)).toBeTruthy()
})
