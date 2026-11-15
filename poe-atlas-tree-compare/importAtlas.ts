const wrongTree = 'Use an official pathofexile.com standard Atlas share link from 3.29.'
const damaged = 'Incomplete or invalid allocation. Copy the full share link again.'

export function importAtlas(value: string) {
  const input = value.trim()
  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(input) ? input : 'https://' + input)
  } catch {
    throw new Error(wrongTree)
  }
  if (!/^https?:$/.test(url.protocol) || !/^(?:[a-z]+\.)?pathofexile\.com$/i.test(url.hostname)
      || url.username || url.password || url.port) throw new Error(wrongTree)
  const path = /^\/(?:fullscreen-)?atlas-skill-tree\/(?:(\d+(?:\.\d+)+)\/)?([^/]+)\/?$/.exec(url.pathname)
  if (!path || [...url.searchParams.keys()].some(key => !key.startsWith('utm_'))) throw new Error(wrongTree)
  const [, patch, encoded] = path
  if (patch && !/^3\.29(?:\.\d+)?$/.test(patch)) throw new Error('This comparison needs a 3.29 allocation. The link specifies ' + patch + '.')
  let code: string
  let bytes: string
  try {
    code = decodeURIComponent(encoded)
    if (!/^[a-zA-Z0-9_-]+={0,2}$/.test(code) || code.length > 1024) throw new Error()
    bytes = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
    if (btoa(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') !== code.replace(/=+$/, '')) throw new Error()
  } catch {
    throw new Error(damaged)
  }
  if (bytes.length < 9) throw new Error(damaged)
  if (bytes.slice(0, 6) !== '\x00\x00\x00\x06\x00\x00') throw new Error('Unsupported tree format. Copy a 3.29 standard Atlas link.')
  const count = bytes.charCodeAt(6)
  // Version 6 stores a counted list of big-endian IDs, then two empty optional sections for the standard Atlas.
  if (bytes.length !== 9 + 2 * count || bytes.slice(-2) !== '\x00\x00') throw new Error(damaged)
  const ids = new Set<string>()
  for (let i = 7; i < bytes.length - 2; i += 2) {
    ids.add(String(bytes.charCodeAt(i) * 256 + bytes.charCodeAt(i + 1)))
  }
  return { ids: [...ids], patch }
}
