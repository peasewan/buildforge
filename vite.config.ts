import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        paladin: resolve(import.meta.dirname, 'paladin/index.html'),
        guide: resolve(import.meta.dirname, 'wow-forever-paladin-talents/index.html'),
        buildGuide: resolve(import.meta.dirname, 'wow-forever-paladin-build/index.html'),
        protectionBuild: resolve(import.meta.dirname, 'wow-forever-protection-paladin-build/index.html'),
        retributionBuild: resolve(import.meta.dirname, 'wow-forever-retribution-paladin-build/index.html'),
        levelingBuild: resolve(import.meta.dirname, 'wow-forever-paladin-leveling-build/index.html'),
        pvpBuild: resolve(import.meta.dirname, 'wow-forever-paladin-pvp-build/index.html'),
        raidBuild: resolve(import.meta.dirname, 'wow-forever-paladin-raid-build/index.html'),
        protectionDungeonBuild: resolve(import.meta.dirname, 'wow-forever-protection-paladin-dungeon-build/index.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
})
