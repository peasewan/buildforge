import type { ExampleBuildId } from '../data/builds'
import { BUILD_LANDING_PAGES, type BuildLandingPageId } from '../data/buildLandingPages'
import { SPEC_BUILDS_HUBS } from '../data/specBuildsHubs'
import { SPEC_TALENTS_PAGES } from '../data/specTalentsPages'
import { TRUST_PAGES, type TrustPageId } from '../data/trustPages'
import type { Branch } from './build'
import { EMBERVILLE_PAGES, type EmbervillePageId } from '../data/emberville'

export interface PageDefinition {
  kind: 'planner' | 'guide' | 'build-guide' | 'build-landing' | 'build-hub' | 'spec-hub' | 'spec-talents' | 'beta-changes' | 'trust' | 'emberville'
  title: string
  description: string
  canonical: string
  robots: 'index, follow' | 'noindex, follow'
  buildId?: ExampleBuildId
  landingPageId?: BuildLandingPageId
  spec?: Branch
  trustPageId?: TrustPageId
  embervillePageId?: EmbervillePageId
}

const plannerPage: PageDefinition = {
  kind: 'planner',
  title: 'WoW Forever Paladin Talent Calculator | Beta Build 69913',
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
  description: 'Open a community WoW Forever Holy Paladin build with a 31/20/0 healing talent allocation, then edit and share it in the BuildForge planner.',
  canonical: 'https://buildforgetools.com/wow-forever-paladin-build',
  robots: 'index, follow',
}

const protectionBuildPage: PageDefinition = {
  kind: 'build-guide',
  buildId: 'protection-shield-20-31-0',
  title: 'WoW Forever Protection Paladin Build | BuildForgeTools',
  description: 'Open a community WoW Forever Protection Paladin build with a complete 20/31/0 allocation, then edit and share it in the BuildForge planner.',
  canonical: 'https://buildforgetools.com/wow-forever-protection-paladin-build',
  robots: 'index, follow',
}

const retributionBuildPage: PageDefinition = {
  kind: 'build-guide',
  buildId: 'retribution-judgment-0-20-31',
  title: 'WoW Forever Retribution Paladin Build | BuildForgeTools',
  description: 'Open a community WoW Forever Retribution Paladin build with a complete 0/20/31 allocation, then edit and share it in the BuildForge planner.',
  canonical: 'https://buildforgetools.com/wow-forever-retribution-paladin-build',
  robots: 'index, follow',
}

const retributionLevelingBuildPage: PageDefinition = {
  kind: 'build-guide',
  buildId: 'retribution-leveling-20-0-31',
  title: 'WoW Forever Retribution Paladin Leveling Build | BuildForgeTools',
  description: 'Open a community WoW Forever Retribution Paladin leveling build with a complete 20/0/31 allocation, then edit and share it in the BuildForge planner.',
  canonical: 'https://buildforgetools.com/wow-forever-retribution-paladin-leveling-build',
  robots: 'index, follow',
}

const buildsHubPage: PageDefinition = {
  kind: 'build-hub',
  title: 'WoW Forever Paladin Builds & Talent Calculator | BuildForgeTools',
  description: 'Explore WoW Forever Paladin builds for Holy, Protection, and Retribution. Plan talents, customize builds, and share your setup with BuildForgeTools.',
  canonical: 'https://buildforgetools.com/wow-forever-paladin-builds',
  robots: 'index, follow',
}

const betaChangesPage: PageDefinition = {
  kind: 'beta-changes',
  title: 'WoW Forever Paladin Beta Talent Changes | BuildForgeTools',
  description: 'Track every WoW Forever Paladin talent change discovered in the Beta, including exact build-to-build diffs and an archived demo comparison.',
  canonical: 'https://buildforgetools.com/wow-forever-paladin-beta-talent-changes',
  robots: 'index, follow',
}

export function pageForPath(pathname: string): PageDefinition {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  const embervillePage = EMBERVILLE_PAGES.find((page) => normalized === `/${page.slug}`)
  if (embervillePage) return {
    kind: 'emberville', embervillePageId: embervillePage.id,
    title: embervillePage.metaTitle, description: embervillePage.description,
    canonical: `https://buildforgetools.com/${embervillePage.slug}`, robots: 'index, follow',
  }
  if (normalized === '/build') return { ...plannerPage, robots: 'noindex, follow' }
  if (normalized === '/wow-forever-paladin-builds') return buildsHubPage
  const trustPage = TRUST_PAGES.find((page) => normalized === `/${page.slug}`)
  if (trustPage) return {
    kind: 'trust',
    trustPageId: trustPage.id,
    title: trustPage.metaTitle,
    description: trustPage.description,
    canonical: `https://buildforgetools.com/${trustPage.slug}`,
    robots: 'index, follow',
  }
  const specHub = SPEC_BUILDS_HUBS.find((hub) => normalized === `/${hub.slug}`)
  if (specHub) return {
    kind: 'spec-hub',
    spec: specHub.spec,
    title: specHub.metaTitle,
    description: specHub.description,
    canonical: `https://buildforgetools.com/${specHub.slug}`,
    robots: 'index, follow',
  }
  const specTalents = SPEC_TALENTS_PAGES.find((page) => normalized === `/${page.slug}`)
  if (specTalents) return {
    kind: 'spec-talents',
    spec: specTalents.spec,
    title: specTalents.metaTitle,
    description: specTalents.description,
    canonical: `https://buildforgetools.com/${specTalents.slug}`,
    robots: 'index, follow',
  }
  if (normalized === '/wow-forever-paladin-beta-talent-changes') return betaChangesPage
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
  if (normalized === '/wow-forever-retribution-paladin-leveling-build') return retributionLevelingBuildPage
  return plannerPage
}
