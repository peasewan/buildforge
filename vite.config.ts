import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { transformAnalyticsHtml } from './src/lib/analyticsBootstrap.ts'

// One entry per published class page, from the same requirement gate the routes, rewrites and
// sitemap read. A withheld page has no input here, so it cannot reach `dist/`.
//
// The list is generated (`npm run classes:sync`) rather than imported: this file is its own
// TypeScript project, and the build refuses to run while the generated artifacts are stale.
const classInputs = Object.fromEntries(
  (JSON.parse(readFileSync(resolve(import.meta.dirname, 'class-static-pages.json'), 'utf8')) as { name: string; file: string }[])
    .map(({ name, file }) => [name, resolve(import.meta.dirname, file)]),
)

export default defineConfig(({ mode }) => ({
  // Clerk's Vercel integration supplies NEXT_PUBLIC_ for Next.js. Expose only
  // its publishable key to this Vite client; never map CLERK_SECRET_KEY here.
  define: {
    'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(
      loadEnv(mode, import.meta.dirname, 'VITE_').VITE_CLERK_PUBLISHABLE_KEY
        ?? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        ?? '',
    ),
  },
  plugins: [
    {
      name: 'production-only-analytics',
      enforce: 'pre',
      transformIndexHtml: transformAnalyticsHtml,
    },
    {
      name: 'adsense-site-verification',
      apply: 'build',
      transformIndexHtml(_html, context) {
        if (process.env.VERCEL_ENV === 'preview') return []
        const publisher = 'ca-pub-4279730688530289'
        // Keep the consent policy readable and the incomplete preview notebook unmonetized.
        // The separate sourced Emberville mechanics guides retain their ad eligibility.
        if (/^\/(?:privacy|emberville)(?:\/index\.html|\/)?$/.test(context.path)) return []
        return [{
          tag: 'script',
          attrs: {
            async: true,
            src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisher}`,
            crossorigin: 'anonymous',
          },
          injectTo: 'head' as const,
        }]
      },
    },
    react(),
  ],
  build: {
    rollupOptions: {
      input: {
        invokyrHome: resolve(import.meta.dirname, 'invokyr/index.html'),
        invokyrMultiplayer: resolve(import.meta.dirname, 'invokyr-multiplayer/index.html'),
        invokyrEnding: resolve(import.meta.dirname, 'invokyr-how-to-win/index.html'),
        main: resolve(import.meta.dirname, 'index.html'),
        dungeonFinder: resolve(import.meta.dirname, 'wow-forever-dungeon-build-finder/index.html'),
        classPicker: resolve(import.meta.dirname, 'wow-forever-class-picker/index.html'),
        wowClasses: resolve(import.meta.dirname, 'wow-forever-classes/index.html'),
        wowBuilds: resolve(import.meta.dirname, 'wow-forever-builds/index.html'),
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
        protectionPvpBuild: resolve(import.meta.dirname, 'wow-forever-protection-paladin-pvp-build/index.html'),
        retributionPvpBuild: resolve(import.meta.dirname, 'wow-forever-retribution-paladin-pvp-build/index.html'),
        holyPvpBuild: resolve(import.meta.dirname, 'wow-forever-holy-paladin-pvp-build/index.html'),
        paladinBuildsHub: resolve(import.meta.dirname, 'wow-forever-paladin-builds/index.html'),
        protectionBuildsHub: resolve(import.meta.dirname, 'wow-forever-protection-paladin-builds/index.html'),
        retributionBuildsHub: resolve(import.meta.dirname, 'wow-forever-retribution-paladin-builds/index.html'),
        protectionTalents: resolve(import.meta.dirname, 'wow-forever-protection-paladin-talents/index.html'),
        holyTalents: resolve(import.meta.dirname, 'wow-forever-holy-paladin-talents/index.html'),
        retributionTalents: resolve(import.meta.dirname, 'wow-forever-retribution-paladin-talents/index.html'),
        paladinComparator: resolve(import.meta.dirname, 'wow-forever-paladin-build-comparator/index.html'),
        betaChanges: resolve(import.meta.dirname, 'wow-forever-paladin-beta-talent-changes/index.html'),
        paladinAbilities: resolve(import.meta.dirname, 'wow-forever-paladin-abilities/index.html'),
        about: resolve(import.meta.dirname, 'about/index.html'),
        contact: resolve(import.meta.dirname, 'contact/index.html'),
        privacy: resolve(import.meta.dirname, 'privacy/index.html'),
        songsOfGlimmerwick: resolve(import.meta.dirname, 'songs-of-glimmerwick/index.html'),
        glimmerwickFirstDays: resolve(import.meta.dirname, 'songs-of-glimmerwick-first-days/index.html'),
        glimmerwickSpellcasting: resolve(import.meta.dirname, 'songs-of-glimmerwick-spellcasting/index.html'),
        glimmerwickGardenWell: resolve(import.meta.dirname, 'songs-of-glimmerwick-garden-well/index.html'),
        nivalisProfit: resolve(import.meta.dirname, 'nivalis-nights-profit-calculator/index.html'),
        emberville: resolve(import.meta.dirname, 'emberville/index.html'),
        embervilleBuilds: resolve(import.meta.dirname, 'emberville-builds/index.html'),
        embervilleClasses: resolve(import.meta.dirname, 'emberville-classes/index.html'),
        embervilleInheritance: resolve(import.meta.dirname, 'emberville-skill-inheritance/index.html'),
        ...classInputs,
      },
    },
  },
  test: {
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'https://buildforgetools.com/' } },
    exclude: ['**/node_modules/**', '**/.worktrees/**'],
  },
}))
