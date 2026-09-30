import { del, get, list, put } from '@vercel/blob'
import type { ForgePilotSavedBuild } from './forgePilot'
import { CLOUD_BUILD_LIMIT, cloudBuildPath, cloudUserPrefix, parseCloudBuild, sameCloudBuild, validCloudBuildName } from './forgePilotCloud.js'

export type CloudStoreErrorCode = 'invalid_id' | 'limit_reached' | 'conflict' | 'not_found' | 'corrupt_store'

export class CloudStoreError extends Error {
  constructor(public readonly code: CloudStoreErrorCode) { super(code) }
}

const MAX_BLOB_BYTES = 8_000

async function readRecord(pathname: string): Promise<ForgePilotSavedBuild | null> {
  const result = await get(pathname, { access: 'private', useCache: false })
  if (!result) return null
  if (result.statusCode !== 200 || result.blob.size > MAX_BLOB_BYTES) throw new CloudStoreError('corrupt_store')
  const raw = await new Response(result.stream).text()
  if (new TextEncoder().encode(raw).length > MAX_BLOB_BYTES) throw new CloudStoreError('corrupt_store')
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { throw new CloudStoreError('corrupt_store') }
  const build = parseCloudBuild(parsed)
  if (!build || !pathname.endsWith(`/${build.id}.json`)) throw new CloudStoreError('corrupt_store')
  return build
}

/** Private listing is scoped to a server-derived Clerk user prefix; Blob URLs never leave the server. */
export async function listCloudBuilds(userId: string): Promise<ForgePilotSavedBuild[]> {
  const prefix = cloudUserPrefix(userId)
  if (!prefix) throw new CloudStoreError('invalid_id')
  const blobs: { pathname: string; size: number }[] = []
  let cursor: string | undefined
  while (true) {
    const page = await list({ prefix, limit: CLOUD_BUILD_LIMIT + 1, ...(cursor ? { cursor } : {}) })
    blobs.push(...page.blobs)
    if (!page.hasMore) break
    if (!page.cursor || page.cursor === cursor) throw new CloudStoreError('corrupt_store')
    cursor = page.cursor
  }
  // Concurrent writes can briefly exceed the 20-build quota. Keep those records
  // readable and deletable; saveCloudBuild still refuses any new distinct build.
  const builds = await Promise.all(blobs.map(async ({ pathname, size }) => {
    if (!pathname.startsWith(prefix) || size > MAX_BLOB_BYTES) throw new CloudStoreError('corrupt_store')
    const build = await readRecord(pathname)
    if (!build) throw new CloudStoreError('corrupt_store')
    return build
  }))
  return builds.sort((left, right) => right.savedAt.localeCompare(left.savedAt))
}

export async function saveCloudBuild(userId: string, requested: ForgePilotSavedBuild): Promise<{ build: ForgePilotSavedBuild; created: boolean }> {
  const build = parseCloudBuild(requested)
  if (!build) throw new CloudStoreError('invalid_id')
  const current = await listCloudBuilds(userId)
  const duplicate = current.find((candidate) => sameCloudBuild(candidate, build))
  if (current.some((candidate) => candidate.id === build.id && candidate !== duplicate)) throw new CloudStoreError('conflict')
  // Import is idempotent. A repeat import must not replace an account-side
  // rename or original save time with stale metadata from this browser.
  if (duplicate) return { build: duplicate, created: false }
  if (!duplicate && current.length >= CLOUD_BUILD_LIMIT) throw new CloudStoreError('limit_reached')
  const pathname = cloudBuildPath(userId, build.id)
  if (!pathname) throw new CloudStoreError('invalid_id')
  await put(pathname, JSON.stringify(build), {
    access: 'private', addRandomSuffix: false, contentType: 'application/json',
  })
  return { build, created: true }
}

export async function renameCloudBuild(userId: string, id: string, name: string): Promise<ForgePilotSavedBuild> {
  if (!validCloudBuildName(name)) throw new CloudStoreError('invalid_id')
  const pathname = cloudBuildPath(userId, id)
  if (!pathname) throw new CloudStoreError('invalid_id')
  const existing = await readRecord(pathname)
  if (!existing) throw new CloudStoreError('not_found')
  const build = { ...existing, name: name.trim() }
  await put(pathname, JSON.stringify(build), {
    access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json',
  })
  return build
}

export async function deleteCloudBuild(userId: string, id: string): Promise<void> {
  const pathname = cloudBuildPath(userId, id)
  if (!pathname) throw new CloudStoreError('invalid_id')
  await del(pathname)
}
