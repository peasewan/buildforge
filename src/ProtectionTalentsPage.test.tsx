import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import ProtectionTalentsPage from './ProtectionTalentsPage'

afterEach(cleanup)

describe('Protection Paladin talents page', () => {
  it('shows the Protection talent tree and links to the planner and hub', () => {
    render(<ProtectionTalentsPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Protection Paladin Talents' })).toBeTruthy()
    expect(screen.getByLabelText('Protection talent tree')).toBeTruthy()
    expect(document.querySelector('a[href="/paladin"]')).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-protection-paladin-builds"]')).toBeTruthy()
  })
})
