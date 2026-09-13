import { describe, expect, it } from 'vitest'
import { pageForPath } from './routes'

describe('public page routing', () => {
  it('serves the calculator for the canonical tool path and shared builds', () => {
    expect(pageForPath('/paladin')).toMatchObject({
      kind: 'planner',
      title: 'WoW Forever Paladin Talent Calculator | BuildForgeTools',
      description: expect.stringContaining('WoW Forever Paladin talent tree'),
      canonical: 'https://buildforgetools.com/paladin',
    })
    expect(pageForPath('/build')).toMatchObject({
      kind: 'planner',
      canonical: 'https://buildforgetools.com/paladin',
    })
  })

  it('serves the guide with its own canonical metadata', () => {
    expect(pageForPath('/wow-forever-paladin-talents/')).toEqual({
      kind: 'guide',
      title: 'WoW Forever Paladin Talent Guide & Build Planner | BuildForgeTools',
      description: 'Explore every WoW Forever Paladin talent path for Holy, Protection, and Retribution, then open the talent calculator to create a 51-point build.',
      canonical: 'https://buildforgetools.com/wow-forever-paladin-talents',
    })
  })

  it('serves the Holy healing build as its own indexable page', () => {
    expect(pageForPath('/wow-forever-paladin-build/')).toEqual({
      kind: 'build-guide',
      buildId: 'holy-healing-31-20-0',
      title: 'WoW Forever Paladin Build – Holy Healing 31/20/0 | BuildForgeTools',
      description: 'Open a community-preview WoW Forever Holy Paladin build with a 31/20/0 healing talent allocation, then edit and share it in the BuildForge planner.',
      canonical: 'https://buildforgetools.com/wow-forever-paladin-build',
    })
  })

  it.each([
    ['/wow-forever-protection-paladin-build/', 'protection-shield-20-31-0', 'WoW Forever Protection Paladin Build | BuildForgeTools'],
    ['/wow-forever-retribution-paladin-build/', 'retribution-judgment-0-20-31', 'WoW Forever Retribution Paladin Build | BuildForgeTools'],
  ])('serves %s as an indexable example build', (pathname, buildId, title) => {
    expect(pageForPath(pathname)).toMatchObject({ kind: 'build-guide', buildId, title })
  })
})
