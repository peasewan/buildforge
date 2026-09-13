import { describe, expect, it } from 'vitest'
import content from './holy-healing-build.json'
import { HOLY_HEALING_BUILD } from '../data/builds'
import { decodeBuild } from '../lib/build'
import { talents } from '../data/talents'

describe('prerendered Holy healing build content', () => {
  it('contains the exact interactive build and every selected talent', () => {
    const prerender = content as typeof content & { plannerPath?: string; selectedTalents?: string[] }

    expect(prerender.plannerPath).toBeTypeOf('string')
    if (!prerender.plannerPath) return
    expect(prerender.plannerPath).toMatch(/^\/build\?id=/)
    const encoded = new URLSearchParams(prerender.plannerPath?.split('?')[1]).get('id') ?? ''
    expect(decodeBuild(encoded, talents)).toEqual(HOLY_HEALING_BUILD.build)
    expect(prerender.selectedTalents).toHaveLength(16)
    expect(prerender.selectedTalents).toContain('Holy Shock 1/1')
    expect(prerender.selectedTalents).toContain("Light's Vigil 1/1")
    expect(prerender.selectedTalents).toContain('Anticipation 5/5')
  })
})
