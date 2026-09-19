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

  it('explains why a short message cannot be submitted', () => {
    render(<FeedbackWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Feedback' }))
    fireEvent.change(screen.getByPlaceholderText(/Tell us what you need/), { target: { value: 'test' } })

    expect(screen.getByText('Enter at least 6 more characters.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Send Feedback' }).hasAttribute('disabled')).toBe(true)
  })

  it('accepts a valid message with the optional email left blank', () => {
    render(<FeedbackWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Feedback' }))
    fireEvent.change(screen.getByPlaceholderText(/Tell us what you need/), { target: { value: 'The icon is incorrect.' } })

    expect(screen.getByRole('button', { name: 'Send Feedback' }).hasAttribute('disabled')).toBe(false)
  })

  it('explains an invalid optional email address', () => {
    render(<FeedbackWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Feedback' }))
    fireEvent.change(screen.getByPlaceholderText(/Tell us what you need/), { target: { value: 'The icon is incorrect.' } })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test' } })

    expect(screen.getByText('Enter a valid email address or leave it blank.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Send Feedback' }).hasAttribute('disabled')).toBe(true)
  })
})
