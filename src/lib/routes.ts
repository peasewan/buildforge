import type { ExampleBuildId } from '../data/builds'
import { BUILD_LANDING_PAGES, type BuildLandingPageId } from '../data/buildLandingPages'

export interface PageDefinition {
  kind: 'planner' | 'guide' | 'build-guide' | 'build-landing' | 'build-hub' | 'protection-hub' | 'protection-talents'
  title: string
  description: string
  canonical: string
  robots: 'index, follow' | 'noindex, follow'
  buildId?: ExampleBuildId
  landingPageId?: BuildLandingPageId
}

const plannerPage: PageDefinition = {
  kind: 'planner',
  title: 'WoW Forever Paladin Talent Preview | BuildForgeTools',
  description: 'Use the WoW Forever Paladin Talent Calculator to explore the WoW Forever Paladin talent tree, plan all 51 points, and share Holy, Protection, or Retribution builds.',
  canonical: 'https://buildforgetools.com/paladin',
  robots: 'index, follow',
}

const guidePage: PageDefinition = {
  kind: 'guide',
  title: 'WoW Forever Paladin Talent Guide & Build Planner | BuildForgeTools',
  description: 'Explore every WoW Forever Paladin talent path for Holy, Protection, and Retribution, then open the talent calculator to create a 51-point build.',
  canonical: 'https://buildforgetools.com/wow-forever-paladin-talents',
  robots: 'index, follow',
}

const holyHealingBuildPage: PageDefinition = {
  kind: 'build-guide',
  buildId: 'holy-healing-31-20-0',
  title: 'WoW Forever Paladin Build – Holy Healing 31/20/0 | BuildForgeTools',
  description: 'Open a community-preview WoW Forever Holy Paladin build with a 31/20/0 healing talent allocation, then edit and share it in the BuildForge planner.',
  canonical: 'https://buildforgetools.com/wow-forever-paladin-build',
  robots: 'index, follow',
}

const protectionBuildPage: PageDefinition = {
  kind: 'build-guide',
  buildId: 'protection-shield-20-31-0',
  title: 'WoW Forever Protection Paladin Build | BuildForgeTools',
  description: 'Open a community-preview WoW Forever Protection Paladin build with a complete 20/31/0 allocation, then edit and share it in the BuildForge planner.',
  canonical: 'https://buildforgetools.com/wow-forever-protection-paladin-build',
  robots: 'index, follow',
}

const retributionBuildPage: PageDefinition = {
  kind: 'build-guide',
  buildId: 'retribution-judgment-0-20-31',
  title: 'WoW Forever Retribution Paladin Build | BuildForgeTools',
  description: 'Open a community-preview WoW Forever Retribution Paladin build with a complete 0/20/31 allocation, then edit and share it in the BuildForge planner.',
  canonical: 'https://buildforgetools.com/wow-forever-retribution-paladin-build',
  robots: 'index, follow',
}

const buildsHubPage: PageDefinition = {
  kind: 'build-hub',
  title: 'WoW Forever Paladin Builds & Talent Calculator | BuildForgeTools',
  description: 'Explore WoW Forever Paladin builds for Holy, Protection, and Retribution. Plan talents, customize builds, and share your setup with BuildForgeTools.',
  canonical: 'https://buildforgetools.com/wow-forever-paladin-builds',
  robots: 'index, follow',
}

const protectionBuildsHubPage: PageDefinition = {
  kind: 'protection-hub',
  title: 'WoW Forever Protection Paladin Builds | Tank Talent Planner',
  description: 'Explore WoW Forever Protection Paladin tank builds, leveling paths, dungeon setups, and talents in the BuildForgeTools planner.',
  canonical: 'https://buildforgetools.com/wow-forever-protection-paladin-builds',
  robots: 'index, follow',
}

const protectionTalentsPage: PageDefinition = {
  kind: 'protection-talents',
  title: 'WoW Forever Protection Paladin Talents | Talent Tree',
  description: 'Explore the WoW Forever Protection Paladin talent tree, review key tank talents, and create a custom build in the talent calculator.',
  canonical: 'https://buildforgetools.com/wow-forever-protection-paladin-talents',
  robots: 'index, follow',
}

export function pageForPath(pathname: string): PageDefinition {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  if (normalized === '/build') return { ...plannerPage, robots: 'noindex, follow' }
  if (normalized === '/wow-forever-paladin-builds') return buildsHubPage
  if (normalized === '/wow-forever-protection-paladin-builds') return protectionBuildsHubPage
  if (normalized === '/wow-forever-protection-paladin-talents') return protectionTalentsPage
  const landing = BUILD_LANDING_PAGES.find((page) => normalized === `/${page.slug}`)
  if (landing) return {
    kind: 'build-landing',
    landingPageId: landing.id,
    title: landing.metaTitle,
    description: landing.description,
    canonical: `https://buildforgetools.com/${landing.slug}`,
    robots: 'index, follow',
  }
  if (normalized === '/wow-forever-paladin-talents') return guidePage
  if (normalized === '/wow-forever-paladin-build') return holyHealingBuildPage
  if (normalized === '/wow-forever-protection-paladin-build') return protectionBuildPage
  if (normalized === '/wow-forever-retribution-paladin-build') return retributionBuildPage
  return plannerPage
}
