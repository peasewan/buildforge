import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import betaTalentData from '../src/data/paladin-beta-1.60.1.69913.json'

const outputDir = join(process.cwd(), 'public', 'images', 'talents')
const iconNames = [...new Set(betaTalentData.talents.map((talent) => talent.iconName.toLowerCase()))].sort()
const force = process.argv.includes('--force')

const providers = {
  wowhead: (iconName: string) => `https://wow.zamimg.com/images/wow/icons/large/${iconName}.jpg`,
  blizzard: (iconName: string) => `https://render.worldofwarcraft.com/us/icons/56/${iconName}.jpg`,
} as const

type Provider = keyof typeof providers

const isJpeg = (bytes: Uint8Array) =>
  bytes.length > 500 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff

async function fetchIcon(url: string, timeout = 12_000): Promise<Uint8Array | null> {
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

async function selectProvider(): Promise<Provider> {
  const probe = iconNames[0]
  const wowhead = await fetchIcon(providers.wowhead(probe))
  if (wowhead) return 'wowhead'

  const blizzard = await fetchIcon(providers.blizzard(probe))
  if (blizzard) {
    console.warn('Wowhead CDN probe failed; using Blizzard render CDN for the same iconName assets.')
    return 'blizzard'
  }

  throw new Error('Neither Wowhead nor Blizzard icon CDN passed the JPEG probe.')
}

await mkdir(outputDir, { recursive: true })
const provider = await selectProvider()
let downloaded = 0
let reused = 0
const failed: string[] = []

async function download(iconName: string) {
  const destination = join(outputDir, `${iconName}.jpg`)
  if (!force && await validExisting(destination)) {
    reused += 1
    return
  }

  const bytes = await fetchIcon(providers[provider](iconName))
  if (!bytes) {
    failed.push(iconName)
    return
  }

  const temporary = `${destination}.tmp`
  await writeFile(temporary, bytes)
  await rename(temporary, destination)
  downloaded += 1
}

const concurrency = 8
for (let index = 0; index < iconNames.length; index += concurrency) {
  await Promise.all(iconNames.slice(index, index + concurrency).map(download))
}

for (const entry of failed) await rm(join(outputDir, `${basename(entry)}.jpg.tmp`), { force: true })

console.log(`Talent icons: ${iconNames.length - failed.length}/${iconNames.length} ready (${downloaded} downloaded, ${reused} reused) via ${provider}.`)
if (failed.length) {
  console.error(`Missing icons: ${failed.join(', ')}`)
  process.exitCode = 1
}
