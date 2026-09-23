import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { PUBLISHED_CLASSES } from '../data/classes'
import { publishedClassPages } from '../lib/classPage'
import ClassSignature from './ClassSignature'

afterEach(cleanup)

const cases = [
  { id: 'warrior', feature: 'pvp', core: 'arms', pattern: 'rage-cycle', question: /rage/i },
  { id: 'mage', feature: 'aoe', core: 'frost', pattern: 'cast-window', question: /mana|control/i },
  { id: 'rogue', feature: 'pvp', core: 'combat', pattern: 'opener-cycle', question: /opener|energy/i },
  { id: 'priest', feature: 'healing', core: 'shadow', pattern: 'recovery-ledger', question: /mana|recovery/i },
  { id: 'druid', feature: 'tank', core: 'feral', pattern: 'form-switch', question: /form|bear/i },
  { id: 'warlock', feature: 'pet', core: 'affliction', pattern: 'pet-compact', question: /pet|demon/i },
  { id: 'hunter', feature: 'pet', core: 'beast-mastery', pattern: 'distance-track', question: /pet|range/i },
  { id: 'shaman', feature: 'totem', core: 'enhancement', pattern: 'totem-field', question: /totem|weapon/i },
] as const

for (const item of cases) {
  it(`${item.id} shows a sourced, class-specific planning module on its four entry routes`, () => {
    const classDef = PUBLISHED_CLASSES.find((def) => def.id === item.id)!
    const pages = publishedClassPages([classDef]).map(({ page }) => page)
    const entryPages = [
      pages.find((page) => page.kind === 'buildsHub'),
      pages.find((page) => page.kind === 'leveling'),
      pages.find((page) => page.kind === item.feature),
      pages.find((page) => page.kind === 'specBuild' && page.spec === item.core),
    ]
    expect(entryPages.every(Boolean)).toBe(true)
    const routeCopy: string[] = []
    for (const page of entryPages) {
      const { container, unmount } = render(<ClassSignature classDef={classDef} page={page!} />)
      const surface = container.querySelector<HTMLElement>(`[data-class-signature="${item.id}"]`)
      expect(surface?.getAttribute('data-signature-pattern')).toBe(item.pattern)
      expect(surface?.textContent).toMatch(item.question)
      routeCopy.push(surface?.textContent ?? '')
      const link = surface?.querySelector<HTMLAnchorElement>('a[href^="/"]')
      expect(link).not.toBeNull()
      const destination = new URL(link!.getAttribute('href')!, 'https://buildforgetools.com')
      expect(destination.pathname).toBe(classDef.plannerPath)
      expect(destination.searchParams.get('build')).toBeTruthy()
      expect(screen.getByText(/Editorial test prompt/i)).toBeTruthy()
      unmount()
    }
    expect(new Set(routeCopy).size).toBe(4)
  })
}

it('omits the signature from unrelated routes and the protected Paladin surface', () => {
  const warrior = PUBLISHED_CLASSES.find((def) => def.id === 'warrior')!
  const talentsPage = warrior.pages.find((page) => page.kind === 'talents')!
  const { container, rerender } = render(<ClassSignature classDef={warrior} page={talentsPage} />)
  expect(container.querySelector('[data-class-signature]')).toBeNull()
  rerender(<ClassSignature classDef={{ ...warrior, id: 'paladin' }} page={warrior.pages.find((page) => page.kind === 'buildsHub')!} />)
  expect(container.querySelector('[data-class-signature]')).toBeNull()
})
