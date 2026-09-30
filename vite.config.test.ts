// @vitest-environment node
import { randomUUID } from 'node:crypto'
import { writeFile, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { resolveConfig } from 'vite'

const projectRoot = dirname(fileURLToPath(import.meta.url))

describe('Clerk public key in the Vite config', () => {
  it('uses the VITE_ key from an env file ahead of the marketplace fallback', async () => {
    const mode = `forgepilotkey${randomUUID().replaceAll('-', '')}`
    const envPath = resolve(projectRoot, `.env.${mode}.local`)
    const previousViteKey = process.env.VITE_CLERK_PUBLISHABLE_KEY
    const previousMarketplaceKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    await writeFile(envPath, 'VITE_CLERK_PUBLISHABLE_KEY=pk_test_local_fixture\n')
    delete process.env.VITE_CLERK_PUBLISHABLE_KEY
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_marketplace_fixture'

    try {
      const config = await resolveConfig({ configFile: resolve(projectRoot, 'vite.config.ts'), mode }, 'serve')
      const replacement = config.define?.['import.meta.env.VITE_CLERK_PUBLISHABLE_KEY']
        ?? JSON.stringify(config.env.VITE_CLERK_PUBLISHABLE_KEY)
      expect(JSON.parse(replacement)).toBe('pk_test_local_fixture')
    } finally {
      await rm(envPath, { force: true })
      if (previousViteKey === undefined) delete process.env.VITE_CLERK_PUBLISHABLE_KEY
      else process.env.VITE_CLERK_PUBLISHABLE_KEY = previousViteKey
      if (previousMarketplaceKey === undefined) delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      else process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = previousMarketplaceKey
    }
  })
})
