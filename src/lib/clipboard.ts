export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Older browsers and denied Clipboard API access can still support manual copy.
  }

  let field: HTMLTextAreaElement | undefined
  try {
    if (typeof document === 'undefined' || typeof document.execCommand !== 'function') return false
    field = document.createElement('textarea')
    field.value = text
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.appendChild(field)
    field.focus()
    field.select()
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    field?.remove()
  }
}
