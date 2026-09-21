import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import rawTalents from '../src/data/mage-beta-1.60.1.69913.json'

const outputDir = join(process.cwd(), 'public', 'images', 'mage-talents')
const iconNames = [...new Set((rawTalents as { iconName?: string }[]).map((talent) => talent.iconName).filter((name): name is string => Boolean(name)).map((name) => name.toLowerCase()))].sort()
const force = process.argv.includes('--force')
const providers = {
  wowhead: (iconName: string) => `https://wow.zamimg.com/images/wow/icons/large/${iconName}.jpg`,
  blizzard: (iconName: string) => `https://render.worldofwarcraft.com/us/icons/56/${iconName}.jpg`,
} as const

const isJpeg = (bytes: Uint8Array) => bytes.length > 500 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff

async function fetchIcon(url: string, timeout = 12_000) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(timeout) })
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) return null
    const bytes = new Uint8Array(await response.arrayBuffer())
    return isJpeg(bytes) ? bytes : null
  } catch {
    return null
  }
}

async function validExisting(path: string) {
  try {
    const info = await stat(path)
    if (info.size <= 500) return false
    return isJpeg(new Uint8Array(await readFile(path)))
  } catch {
    return false
  }
}

await mkdir(outputDir, { recursive: true })
const probe = await fetchIcon(providers.wowhead(iconNames[0]))
const provider = probe ? 'wowhead' : 'blizzard'
let downloaded = 0
let reused = 0
const failed: string[] = []

for (const iconName of iconNames) {
  const destination = join(outputDir, `${iconName}.jpg`)
  if (!force && await validExisting(destination)) {
    reused += 1
    continue
  }
  const bytes = await fetchIcon(providers[provider](iconName))
  if (!bytes) {
    failed.push(iconName)
    continue
  }
  const temporary = `${destination}.tmp`
  await writeFile(temporary, bytes)
  await rename(temporary, destination)
  downloaded += 1
}

console.log(`Mage icons: downloaded ${downloaded}, reused ${reused}, failed ${failed.length}`)
if (failed.length) throw new Error(`Missing Mage icons: ${failed.join(', ')}`)
