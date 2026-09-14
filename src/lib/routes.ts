import type { ExampleBuildId } from '../data/builds'
import { BUILD_LANDING_PAGES, type BuildLandingPageId } from '../data/buildLandingPages'

export interface PageDefinition {
  kind: 'planner' | 'guide' | 'build-guide' | 'build-landing'
  title: string
  description: string
  canonical: string
  buildId?: ExampleBuildId
  landingPageId?: BuildLandingPageId
}

const plannerPage: PageDefinition = {
  kind: 'planner',
  title: 'WoW Forever Paladin Talent Preview | BuildForgeTools',
  description: 'Use the WoW Forever Paladin Talent Calculator to explore the WoW Forever Paladin talent tree, plan all 51 points, and share Holy, Protection, or Retribution builds.',
  canonical: 'https://buildforgetools.com/paladin',
}

const guidePage: PageDefinition = {
  kind: 'guide',
  title: 'WoW Forever Paladin Talent Guide & Build Planner | BuildForgeTools',
  description: 'Explore every WoW Forever Paladin talent path for Holy, Protection, and Retribution, then open the talent calculator to create a 51-point build.',
  canonical: 'https://buildforgetools.com/wow-forever-paladin-talents',
}

const holyHealingBuildPage: PageDefinition = {
  kind: 'build-guide',
  buildId: 'holy-healing-31-20-0',
  title: 'WoW Forever Paladin Build – Holy Healing 31/20/0 | BuildForgeTools',
  description: 'Open a community-preview WoW Forever Holy Paladin build with a 31/20/0 healing talent allocation, then edit and share it in the BuildForge planner.',
  canonical: 'https://buildforgetools.com/wow-forever-paladin-build',
}

const protectionBuildPage: PageDefinition = {
  kind: 'build-guide',
  buildId: 'protection-shield-20-31-0',
  title: 'WoW Forever Protection Paladin Build | BuildForgeTools',
  description: 'Open a community-preview WoW Forever Protection Paladin build with a complete 20/31/0 allocation, then edit and share it in the BuildForge planner.',
  canonical: 'https://buildforgetools.com/wow-forever-protection-paladin-build',
}

const retributionBuildPage: PageDefinition = {
  kind: 'build-guide',
  buildId: 'retribution-judgment-0-20-31',
  title: 'WoW Forever Retribution Paladin Build | BuildForgeTools',
  description: 'Open a community-preview WoW Forever Retribution Paladin build with a complete 0/20/31 allocation, then edit and share it in the BuildForge planner.',
  canonical: 'https://buildforgetools.com/wow-forever-retribution-paladin-build',
}

export function pageForPath(pathname: string): PageDefinition {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  const landing = BUILD_LANDING_PAGES.find((page) => normalized === `/${page.slug}`)
  if (landing) return {
    kind: 'build-landing',
    landingPageId: landing.id,
    title: landing.metaTitle,
    description: landing.description,
    canonical: `https://buildforgetools.com/${landing.slug}`,
  }
  if (normalized === '/wow-forever-paladin-talents') return guidePage
  if (normalized === '/wow-forever-paladin-build') return holyHealingBuildPage
  if (normalized === '/wow-forever-protection-paladin-build') return protectionBuildPage
  if (normalized === '/wow-forever-retribution-paladin-build') return retributionBuildPage
  return plannerPage
}
