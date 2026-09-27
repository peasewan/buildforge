import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyTextToClipboard } from './clipboard'

const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
const execCommandDescriptor = Object.getOwnPropertyDescriptor(document, 'execCommand')
const text = 'https://buildforgetools.com/hunter?build=bm-1.5&level=20'

function setClipboard(writeText: ((value: string) => Promise<void>) | undefined): void {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  })
}

function setExecCommand(execCommand: ((command: string) => boolean) | undefined): void {
  Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand })
}

afterEach(() => {
  if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor)
  else Reflect.deleteProperty(navigator, 'clipboard')
  if (execCommandDescriptor) Object.defineProperty(document, 'execCommand', execCommandDescriptor)
  else Reflect.deleteProperty(document, 'execCommand')
  vi.restoreAllMocks()
})

describe('copyTextToClipboard', () => {
  it('returns success after copying the exact text through the Clipboard API', async () => {
    let copiedText: string | undefined
    setClipboard(async (value) => { copiedText = value })
    setExecCommand(() => { throw new Error('Unexpected fallback') })

    await expect(copyTextToClipboard(text)).resolves.toBe(true)
    expect(copiedText).toBe(text)
    expect(document.querySelector('textarea')).toBeNull()
  })

  it.each(['missing', 'rejected'] as const)('falls back when the Clipboard API is %s', async (mode) => {
    setClipboard(mode === 'missing' ? undefined : async () => { throw new Error('Clipboard denied') })
    let copiedText: string | undefined
    setExecCommand((command) => {
      expect(command).toBe('copy')
      const field = document.activeElement as HTMLTextAreaElement
      expect(field.tagName).toBe('TEXTAREA')
      expect(field.readOnly).toBe(true)
      expect(field.style.position).toBe('fixed')
      expect(field.style.opacity).toBe('0')
      expect(field.selectionStart).toBe(0)
      expect(field.selectionEnd).toBe(text.length)
      copiedText = field.value
      return true
    })

    await expect(copyTextToClipboard(text)).resolves.toBe(true)
    expect(copiedText).toBe(text)
    expect(document.querySelector('textarea')).toBeNull()
  })

  it('returns false when both copy methods fail', async () => {
    setClipboard(async () => { throw new Error('Clipboard denied') })
    setExecCommand(() => false)

    await expect(copyTextToClipboard(text)).resolves.toBe(false)
    expect(document.querySelector('textarea')).toBeNull()
  })

  it('returns false when neither copy API is available', async () => {
    setClipboard(undefined)
    setExecCommand(undefined)

    await expect(copyTextToClipboard(text)).resolves.toBe(false)
    expect(document.querySelector('textarea')).toBeNull()
  })

  it('removes the temporary field even when the fallback throws', async () => {
    setClipboard(async () => { throw new Error('Clipboard denied') })
    setExecCommand(() => {
      expect(document.querySelector('textarea')?.value).toBe(text)
      throw new Error('Fallback denied')
    })

    await expect(copyTextToClipboard(text)).resolves.toBe(false)
    expect(document.querySelector('textarea')).toBeNull()
  })
})
