import { readFileSync } from 'node:fs'
import { PAGE_CONSOLIDATIONS, REMOVED_PAGE_PATHS } from '../src/data/pageConsolidations'

const origin = 'https://buildforgetools.com'
const problems: string[] = []
const expected = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8')
const sitemap = await fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(15000) }).then(response => {
  if (response.status !== 200) throw new Error(`Sitemap HTTP ${response.status}`)
  return response.text()
})
const paths = (xml: string) => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname).sort()
if (JSON.stringify(paths(expected)) !== JSON.stringify(paths(sitemap))) problems.push('Production sitemap differs from the reviewed publication list')

const jobs: (() => Promise<void>)[] = []
for (const [source, target] of Object.entries(PAGE_CONSOLIDATIONS)) for (const suffix of ['', '/index.html']) jobs.push(async () => {
  const response = await fetch(origin+source+suffix, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(15000) })
  const destination = response.headers.get('location')
  if (![301, 308].includes(response.status) || !destination || new URL(destination, origin).href !== origin+target) problems.push(`${source+suffix}: expected a direct permanent redirect to ${target}; got ${response.status} ${destination}`)
})
for (const source of REMOVED_PAGE_PATHS) for (const suffix of ['', '/index.html']) jobs.push(async () => {
  const response = await fetch(origin+source+suffix, { redirect: 'manual', signal: AbortSignal.timeout(15000) })
  if (response.status !== 410) problems.push(`${source+suffix}: expected 410, got ${response.status}`)
  if ((await response.text()).includes('adsbygoogle')) problems.push(`${source+suffix}: retired screen contains advertising`)
})
for (const target of new Set(Object.values(PAGE_CONSOLIDATIONS))) jobs.push(async () => {
  const response = await fetch(origin+target, { redirect: 'manual', signal: AbortSignal.timeout(15000) })
  const html = await response.text()
  if (response.status !== 200 || !html.includes(`href="${origin+target}"`)) problems.push(`${target}: retained target does not serve its canonical page`)
})
let next = 0
await Promise.all(Array.from({length: 5}, async () => {
  while (next < jobs.length) {
    const i = next++
    try { await jobs[i]() } catch (error) { problems.push(`Request ${i}: ${error instanceof Error ? error.message : String(error)}`) }
  }
}))
for (const problem of problems) console.error(problem)
console.log(`${problems.length ? 'FAIL' : 'PASS'} pruning smoke: ${Object.keys(PAGE_CONSOLIDATIONS).length} consolidations, ${REMOVED_PAGE_PATHS.length} gone pages, ${paths(sitemap).length} retained sitemap URLs`)
if (problems.length) process.exitCode = 1
