import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import BuildPage from './BuildPage'

describe('Holy healing build page', () => {
  it('keeps the allocation status separate from the site footer', () => {
    render(<BuildPage />)

    const allocation = screen.getByLabelText('Build allocation')
    expect(allocation.querySelector('footer')).toBeNull()
    expect(allocation.textContent).toContain('51 of 51 points allocated')
  })
})
