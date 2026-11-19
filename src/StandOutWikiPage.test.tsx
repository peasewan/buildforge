import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import StandOutWikiPage from './StandOutWikiPage'
import { pageForPath } from './lib/routes'

afterEach(cleanup)

describe('Stand Out wiki', () => {
  it('publishes searchable Stand records in the initial HTML, including unknown cooldowns', () => {
    expect(pageForPath('/roblox/stand-out/').canonical).toBe('https://buildforgetools.com/roblox/stand-out')
    const html = renderToStaticMarkup(<StandOutWikiPage />)
    const document = new DOMParser().parseFromString(html, 'text/html')
    expect(document.querySelector('#stand-star-platinum')?.textContent).toContain('Star Finger')
    expect(document.querySelector('#stand-kiss')?.textContent).toContain('Unlisted')
    expect(document.querySelector('#stand-tower-of-gray')?.textContent).toContain('Removed from the arrow pool')
    expect(document.querySelector('a[href="/roblox/stand-out/arrow-crafting"]')).not.toBeNull()
    expect(document.querySelector('a[href="/roblox/stand-out/arrow-calculator"]')).not.toBeNull()
    expect(document.querySelector('a[href="/roblox/stand-out/stand-picker"]')).not.toBeNull()
  })

  it('combines name and rarity filters, and lets visitors recover from no matches', () => {
    render(<StandOutWikiPage />)
    fireEvent.change(screen.getByLabelText('Find a Stand'), { target: { value: '  STAR PLATINUM  ' } })
    const directory = screen.getByRole('region', { name: 'Stand directory' })
    expect(within(directory).queryByText('Kiss (Kizz)', { selector: 'h3' })).toBeNull()
    expect(within(directory).getByText('Star Platinum', { selector: 'h3' })).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Rarity'), { target: { value: 'Rare' } })
    expect(screen.getByText(/No Stands match/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }))
    expect(within(directory).getByText('Kiss (Kizz)', { selector: 'h3' })).toBeTruthy()
  })

  it('changes story restrictions without making removed Stands rollable', () => {
    const { container } = render(<StandOutWikiPage />)
    expect(container.querySelector('#stand-rolling-stones')?.textContent).toContain('Blocked by the story pool')
    fireEvent.change(screen.getByLabelText('Story progress'), { target: { value: 'complete' } })
    expect(container.querySelector('#stand-rolling-stones')?.textContent).toContain('Eligible for an arrow roll')
    expect(container.querySelector('#stand-tower-of-gray')?.textContent).toContain('Removed from the arrow pool')
  })
})
