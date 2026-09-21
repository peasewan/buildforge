import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        warrior: resolve(import.meta.dirname, 'warrior/index.html'),
        warriorBuilds: resolve(import.meta.dirname, 'wow-forever-warrior-builds/index.html'),
        warriorLeveling: resolve(import.meta.dirname, 'wow-forever-warrior-leveling-build/index.html'),
        armsWarriorBuild: resolve(import.meta.dirname, 'wow-forever-arms-warrior-build/index.html'),
        furyWarriorBuild: resolve(import.meta.dirname, 'wow-forever-fury-warrior-build/index.html'),
        protectionWarriorBuild: resolve(import.meta.dirname, 'wow-forever-protection-warrior-build/index.html'),
        paladin: resolve(import.meta.dirname, 'paladin/index.html'),
        guide: resolve(import.meta.dirname, 'wow-forever-paladin-talents/index.html'),
        buildGuide: resolve(import.meta.dirname, 'wow-forever-paladin-build/index.html'),
        protectionBuild: resolve(import.meta.dirname, 'wow-forever-protection-paladin-build/index.html'),
        retributionBuild: resolve(import.meta.dirname, 'wow-forever-retribution-paladin-build/index.html'),
        retributionLevelingBuild: resolve(import.meta.dirname, 'wow-forever-retribution-paladin-leveling-build/index.html'),
        levelingBuild: resolve(import.meta.dirname, 'wow-forever-paladin-leveling-build/index.html'),
        pvpBuild: resolve(import.meta.dirname, 'wow-forever-paladin-pvp-build/index.html'),
        raidBuild: resolve(import.meta.dirname, 'wow-forever-paladin-raid-build/index.html'),
        protectionDungeonBuild: resolve(import.meta.dirname, 'wow-forever-protection-paladin-dungeon-build/index.html'),
        protectionLevelingBuild: resolve(import.meta.dirname, 'wow-forever-protection-paladin-leveling-build/index.html'),
        retributionPvpBuild: resolve(import.meta.dirname, 'wow-forever-retribution-paladin-pvp-build/index.html'),
        holyPvpBuild: resolve(import.meta.dirname, 'wow-forever-holy-paladin-pvp-build/index.html'),
        paladinBuildsHub: resolve(import.meta.dirname, 'wow-forever-paladin-builds/index.html'),
        protectionBuildsHub: resolve(import.meta.dirname, 'wow-forever-protection-paladin-builds/index.html'),
        retributionBuildsHub: resolve(import.meta.dirname, 'wow-forever-retribution-paladin-builds/index.html'),
        protectionTalents: resolve(import.meta.dirname, 'wow-forever-protection-paladin-talents/index.html'),
        holyTalents: resolve(import.meta.dirname, 'wow-forever-holy-paladin-talents/index.html'),
        retributionTalents: resolve(import.meta.dirname, 'wow-forever-retribution-paladin-talents/index.html'),
        betaChanges: resolve(import.meta.dirname, 'wow-forever-paladin-beta-talent-changes/index.html'),
        paladinAbilities: resolve(import.meta.dirname, 'wow-forever-paladin-abilities/index.html'),
        about: resolve(import.meta.dirname, 'about/index.html'),
        contact: resolve(import.meta.dirname, 'contact/index.html'),
        privacy: resolve(import.meta.dirname, 'privacy/index.html'),
        emberville: resolve(import.meta.dirname, 'emberville/index.html'),
        embervilleBuilds: resolve(import.meta.dirname, 'emberville-builds/index.html'),
        embervilleClasses: resolve(import.meta.dirname, 'emberville-classes/index.html'),
        embervilleInheritance: resolve(import.meta.dirname, 'emberville-skill-inheritance/index.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/.worktrees/**'],
  },
})
