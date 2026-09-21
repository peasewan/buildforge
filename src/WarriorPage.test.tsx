import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WarriorPage from './WarriorPage'

describe('Warrior talent calculator', () => {
  afterEach(cleanup)
  beforeEach(() => {
    localStorage.clear()
    history.replaceState({}, '', '/warrior')
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
  })

  it('renders all three trees and spends a point on an available talent', () => {
    render(<WarriorPage />)
    expect(screen.getByRole('heading', { name: 'WoW Forever Warrior Talent Calculator' })).toBeTruthy()
    expect(screen.getAllByTestId('warrior-talent')).toHaveLength(53)

    fireEvent.click(screen.getByRole('button', { name: /Add rank to Improved Heroic Strike/i }))
    expect(screen.getAllByText('1 / 11').length).toBeGreaterThan(0)
  })

  it('loads a current-cap preset and creates a canonical share URL', async () => {
    render(<WarriorPage />)
    fireEvent.click(screen.getByRole('button', { name: /Load Protection Tank/i }))
    expect(screen.getAllByText('0/0/11').length).toBeGreaterThan(0)
    expect(screen.getAllByText('11 / 11').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: /Copy build link/i }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringMatching(/^http:\/\/localhost:\d+\/warrior\?build=.+&level=20$/))
  })
})
