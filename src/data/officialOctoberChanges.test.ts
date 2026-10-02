import { describe, expect, it } from 'vitest'
import { officialTalentNotice } from './officialOctoberChanges'

const hunterSource = 'https://news.blizzard.com/en-us/article/24301515/world-of-warcraft-forever-class-deep-dives-hunter-and-druid'
const septemberSource = 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-september-24/2360696'
const octoberSource = 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696/1'
const warriorSource = 'https://us.forums.blizzard.com/en/wow/t/warrior-updates-in-todays-beta-build/2369360'

describe('official notices on older client talent nodes', () => {
  it.each([
    ['Thick Hide', 'merged into Endurance Training'],
    ['Aimed Shot', 'baseline at Level 20'],
    ['Improved Eyes of the Beast', 'baseline'],
    ["Improved Hunter's Mark", 'baseline'],
    ['Humanoid Slaying', 'Improved Tracking'],
    ['Improved Feign Death', 'Resourcefulness'],
    ['Killer Instinct', 'Resourcefulness'],
    ['Wyvern Sting', 'Resourcefulness'],
  ])('marks the Hunter %s node historical after the official class deep dive', (name, detail) => {
    const notice = officialTalentNotice('hunter', name)
    expect(notice).toMatchObject({ status: 'removed', source: hunterSource })
    expect(notice?.message).toContain(detail)
  })

  it.each([
    ['druid', 'Primal Fury', 'Blood Frenzy'],
    ['mage', 'Wake of Fire', '30 seconds'],
    ['shaman', 'Elemental Fury', 'row 6'],
    ['shaman', 'Elemental Alacrity', 'row 3'],
    ['warrior', 'Bastion', 'Focused Rage'],
    ['warrior', 'Focused Rage', 'Bastion'],
    ['warrior', 'Bloodthrill', '4/8/12/16/20%'],
    ['warrior', 'Improved Slam', '1.5/3 seconds'],
  ])('labels the September 24 %s %s client conflict without claiming a new import', (classId, name, detail) => {
    const notice = officialTalentNotice(classId, name)
    expect(notice).toMatchObject({ status: 'changed', source: septemberSource })
    expect(notice?.message).toContain(detail)
    expect(notice?.message).toMatch(/69913|older client|import/i)
  })

  it('keeps later Warrior removals attached to the October 2 follow-up', () => {
    expect(officialTalentNotice('warrior', 'Improved Cleave')).toMatchObject({
      status: 'removed', source: warriorSource,
    })
  })

  it('keeps the later Hot Streak rename attached to October 1 instead of older duration tuning', () => {
    const notice = officialTalentNotice('mage', 'Hot Streak')
    expect(notice).toMatchObject({ status: 'changed', source: octoberSource })
    expect(notice?.message).toContain('Heating Up')
  })

  it('does not confuse unrelated same-name or ability records with changed talents', () => {
    expect(officialTalentNotice('druid', 'Thick Hide')).toBeUndefined()
    expect(officialTalentNotice('druid', 'Mangle')).toBeUndefined()
    expect(officialTalentNotice('hunter', 'Endurance Training')).toBeUndefined()
  })
})
