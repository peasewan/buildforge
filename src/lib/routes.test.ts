import { describe, expect, it } from 'vitest'
import { pageForPath } from './routes'

describe('public page routing', () => {
  it('serves the calculator for the canonical tool path and shared builds', () => {
    expect(pageForPath('/paladin')).toMatchObject({
      kind: 'planner',
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
      description: 'Learn how Holy, Protection, and Retribution Paladin talents work in WoW Forever, then plan and share a build with the BuildForgeTools calculator.',
      canonical: 'https://buildforgetools.com/wow-forever-paladin-talents',
    })
  })
})
