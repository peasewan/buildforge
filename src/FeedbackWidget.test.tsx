import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import FeedbackWidget from './FeedbackWidget'

afterEach(cleanup)

describe('multi-game feedback widget', () => {
  it('uses game-neutral correction language', () => {
    render(<FeedbackWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Feedback' }))

    expect(screen.getByText('Game data')).toBeTruthy()
    expect(screen.getByText(/incorrect game data/)).toBeTruthy()
    expect(screen.getByPlaceholderText(/game record looks wrong/)).toBeTruthy()
  })
})
