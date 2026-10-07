import { INVOKYR_PAGES, type InvokyrPageId } from '../data/invokyr'
import { DISCOVERY_PAGES, type DiscoveryId } from '../data/siteDiscovery'
import type { ExampleBuildId } from '../data/builds'
import { BUILD_LANDING_PAGES, type BuildLandingPageId } from '../data/buildLandingPages'
import { SPEC_BUILDS_HUBS } from '../data/specBuildsHubs'
import { SPEC_TALENTS_PAGES } from '../data/specTalentsPages'
import { TRUST_PAGES, type TrustPageId } from '../data/trustPages'
import type { Branch } from './build'
import { EMBERVILLE_PAGES, type EmbervillePageId } from '../data/emberville'
import { publishedClassPage } from './classStaticPages'
import { NIVALIS_PAGE } from '../data/nivalis'
import { GLIMMERWICK_LAUNCH_PAGES, type GlimmerwickLaunchPageId } from '../data/glimmerwickLaunchPages'

export interface PageDefinition {
  kind: 'invokyr' | 'paladin-comparison' | 'discovery' | 'planner' | 'guide' | 'build-guide' | 'build-landing' | 'build-hub' | 'spec-hub' | 'spec-talents' | 'spellbook' | 'beta-changes' | 'trust' | 'emberville' | 'glimmerwick' | 'glimmerwick-launch' | 'nivalis' | 'class-calculator' | 'class-document'
  invokyrPageId?: InvokyrPageId
  title: string
  description: string
  canonical: string
  robots: 'index, follow' | 'noindex, follow'
  discoveryId?: DiscoveryId
  buildId?: ExampleBuildId
  landingPageId?: BuildLandingPageId
  spec?: Branch
  trustPageId?: TrustPageId
  embervillePageId?: EmbervillePageId
  classId?: string
  classPageSlug?: string
  glimmerwickLaunchPageId?: GlimmerwickLaunchPageId
}

const plannerPage: PageDefinition = {
  kind: 'planner',
  title: 'WoW Forever Paladin Talent Calculator | Beta Build 69913',
  description: 'Explore the WoW Forever Paladin talent tree in the older 69913 client snapshot. Plan with a 21-point Level 30 budget, review official changes, and share builds.',
  canonical: 'https://buildforgetools.com/paladin',
  robots: 'index, follow',
}

const guidePage: PageDefinition = {
  kind: 'guide',
  title: 'WoW Forever Paladin Talent Guide & Build Planner | BuildForgeTools',
  description: 'Explore Holy, Protection, and Retribution talents in the older 69913 snapshot. Plan a 21-point Level 30 idea, or inspect historical 51-point references.',
  canonical: 'https://buildforgetools.com/wow-forever-paladin-talents',
  robots: 'index, follow',
}

const holyHealingBuildPage: PageDefinition = {
  kind: 'build-guide',
  buildId: 'holy-healing-31-20-0',
  title: 'WoW Forever Paladin Build – Holy Healing 31/20/0 | BuildForgeTools',
  description: 'Inspect a historical 31/20/0 Holy Paladin healing reference, then start a new build for the live Level 30 Beta cap.',
  canonical: 'https://buildforgetools.com/wow-forever-paladin-build',
  robots: 'index, follow',
}

const protectionBuildPage: PageDefinition = {
  kind: 'build-guide',
  buildId: 'protection-shield-20-31-0',
  title: 'WoW Forever Protection Paladin Build | BuildForgeTools',
  description: 'Plan a Level 30 Protection Paladin tank route, review threat and patch caveats, and open 21 points in the calculator. Includes a historical 20/31/0 reference.',
  canonical: 'https://buildforgetools.com/wow-forever-protection-paladin-build',
  robots: 'index, follow',
}

const retributionBuildPage: PageDefinition = {
  kind: 'build-guide',
  buildId: 'retribution-judgment-0-20-31',
  title: 'WoW Forever Retribution Paladin Build | BuildForgeTools',
  description: 'Compare Level 30 Ret, Holy Shock and Twist of Light point requirements. Follow an editable leveling route, review Beta changes and inspect the historical build.',
  canonical: 'https://buildforgetools.com/wow-forever-retribution-paladin-build',
  robots: 'index, follow',
}

const retributionLevelingBuildPage: PageDefinition = {
  kind: 'build-guide',
  buildId: 'retribution-leveling-20-0-31',
  title: 'WoW Forever Retribution Paladin Leveling Build | BuildForgeTools',
  description: 'Follow a WoW Forever Ret Paladin Level 10–30 talent timeline, see your next point and load the allocation. Includes source limits and a historical build reference.',
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
  description: 'Review official Paladin Beta changes, affected build examples and historical client diffs. Separate current announcements from the imported 69913 talent snapshot.',
  canonical: 'https://buildforgetools.com/wow-forever-paladin-beta-talent-changes',
  robots: 'index, follow',
}

const spellbookPage: PageDefinition = {
  kind: 'spellbook',
  title: 'WoW Forever Paladin Abilities & Spellbook | BuildForgeTools',
  description: 'Browse 45 WoW Forever Paladin abilities, skills, and spells by specialization and trainer level, with Beta client build provenance and change labels.',
  canonical: 'https://buildforgetools.com/wow-forever-paladin-abilities',
  robots: 'index, follow',
}

const glimmerwickPage: PageDefinition = {
  kind: 'glimmerwick',
  title: 'Songs of Glimmerwick Garden Planner | BuildForgeTools',
  description: 'Plan your Songs of Glimmerwick garden with your own crop timings. Track planting days, estimate harvests, save notes, and export your plan.',
  canonical: 'https://buildforgetools.com/songs-of-glimmerwick',
  robots: 'index, follow',
}

export function pageForPath(pathname: string, search = ''): PageDefinition {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  const invokyr = INVOKYR_PAGES.find(page => page.path === normalized)
  if (invokyr) return { kind: 'invokyr', invokyrPageId: invokyr.id, title: invokyr.title, description: invokyr.description, canonical: `https://buildforgetools.com${invokyr.path}`, robots: 'index, follow' }
  if (normalized === '/nivalis-nights-profit-calculator') return { kind: 'nivalis', title: NIVALIS_PAGE.title, description: NIVALIS_PAGE.description, canonical: NIVALIS_PAGE.canonical, robots: 'index, follow' }
  if (normalized === '/songs-of-glimmerwick') return glimmerwickPage
  const glimmerwickLaunchPage = GLIMMERWICK_LAUNCH_PAGES.find(page => page.path === normalized)
  if (glimmerwickLaunchPage) return { kind: 'glimmerwick-launch', glimmerwickLaunchPageId: glimmerwickLaunchPage.id, title: glimmerwickLaunchPage.title, description: glimmerwickLaunchPage.description, canonical: `https://buildforgetools.com${glimmerwickLaunchPage.path}`, robots: 'index, follow' }
  const discovery = DISCOVERY_PAGES.find(page => page.path === normalized)
  if (discovery) return { kind: 'discovery', discoveryId: discovery.id, title: discovery.title, description: discovery.description, canonical: `https://buildforgetools.com${discovery.path}`, robots: 'index, follow' }
  const embervillePage = EMBERVILLE_PAGES.find((page) => normalized === `/${page.slug}`)
  if (embervillePage) return {
    kind: 'emberville', embervillePageId: embervillePage.id,
    title: embervillePage.metaTitle, description: embervillePage.description,
    canonical: `https://buildforgetools.com/${embervillePage.slug}`, robots: 'index, follow',
  }
  if (normalized === '/wow-forever-paladin-build-comparator') return { kind: 'paladin-comparison', title: 'WoW Forever Paladin Build Comparator | Ret vs Holy Shock', description: 'Compare Ret and Holy Shock planning examples, Level 10–30 talent order and Twist of Light point gates. Inspect snapshot limits, then edit a route in the calculator.', canonical: 'https://buildforgetools.com/wow-forever-paladin-build-comparator', robots: 'index, follow' }
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
  if (normalized === '/wow-forever-paladin-abilities') return spellbookPage
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
  // Last, so a class page can never shadow a Paladin or Emberville route. The lookup is
  // the requirement gate: a page whose requirements its class does not meet is skipped exactly as
  // if it were not defined, and the path falls through to the Paladin planner below.
  const classPage = publishedClassPage(normalized)
  if (classPage) return {
    kind: classPage.page.kind === 'calculator' ? 'class-calculator' : 'class-document',
    classId: classPage.classDef.id,
    classPageSlug: classPage.page.slug,
    title: classPage.page.title,
    description: classPage.page.description,
    canonical: classPage.page.canonical,
    robots: classPage.page.kind === 'calculator' && new URLSearchParams(search).has('build') ? 'noindex, follow' : classPage.page.robots,
  }
  return plannerPage
}
