import PaladinBuildComparator from './PaladinBuildComparator'
import BetaPatchNotice from './BetaPatchNotice'
import PlanningToolsPage from './PlanningToolsPage'
import SiteDiscoveryPage from './SiteDiscoveryPage'
import GlimmerwickPage from './GlimmerwickPage'
import GlimmerwickFirstDaysPage from './GlimmerwickFirstDaysPage'
import GlimmerwickSpellcastingPage from './GlimmerwickSpellcastingPage'
import GlimmerwickWellPage from './GlimmerwickWellPage'
import NivalisPage from './NivalisPage'
import App from './App'
import BetaChangesPage from './BetaChangesPage'
import BuildPage from './BuildPage'
import BuildLandingPage from './BuildLandingPage'
import FeedbackWidget from './FeedbackWidget'
import GuidePage from './GuidePage'
import PaladinBuildsHub from './PaladinBuildsHub'
import SpecBuildsHub from './SpecBuildsHub'
import SpecTalentsPage from './SpecTalentsPage'
import TrustPage from './TrustPage'
import ClassCalculatorPage from './ClassCalculatorPage'
import ClassDocumentPage from './ClassDocumentPage'
import EmbervillePage from './EmbervillePage'
import SpellbookPage from './SpellbookPage'
import { publishedClassPage } from './lib/classStaticPages'
import { pageForPath } from './lib/routes'

function routeElement(pathname: string) {
  const route = pageForPath(pathname)
  if (route.discoveryId === 'dungeon-finder' || route.discoveryId === 'class-picker') return <PlanningToolsPage tool={route.discoveryId} />
  if (route.kind === 'discovery') return <SiteDiscoveryPage pageId={route.discoveryId!} />
  if (route.kind === 'glimmerwick') return <GlimmerwickPage />
  if (route.kind === 'glimmerwick-launch') {
    if (route.glimmerwickLaunchPageId === 'first-days') return <GlimmerwickFirstDaysPage />
    if (route.glimmerwickLaunchPageId === 'spellcasting') return <GlimmerwickSpellcastingPage />
    return <GlimmerwickWellPage />
  }
  if (route.kind === 'nivalis') return <NivalisPage />
  const classPage = publishedClassPage(pathname)
  if (route.kind === 'class-calculator' && classPage) return <ClassCalculatorPage classDef={classPage.classDef} />
  if (route.kind === 'class-document' && classPage) return <ClassDocumentPage classDef={classPage.classDef} page={classPage.page} />
  if (route.kind === 'emberville') return <EmbervillePage pageId={route.embervillePageId!} />
  if (route.kind === 'paladin-comparison') return <PaladinBuildComparator />
  if (route.kind === 'guide') return <GuidePage />
  if (route.kind === 'build-guide') return <BuildPage buildId={route.buildId} />
  if (route.kind === 'build-landing') return <BuildLandingPage pageId={route.landingPageId!} />
  if (route.kind === 'build-hub') return <PaladinBuildsHub />
  if (route.kind === 'spec-hub') return <SpecBuildsHub spec={route.spec!} />
  if (route.kind === 'spec-talents') return <SpecTalentsPage spec={route.spec!} />
  if (route.kind === 'spellbook') return <SpellbookPage />
  if (route.kind === 'beta-changes') return <BetaChangesPage />
  if (route.kind === 'trust') return <TrustPage pageId={route.trustPageId!} />
  return <App />
}


/** Shared by the build-time renderer and the browser: one visual layout. */
export default function AppRoute({ pathname }: { pathname: string }) {
  const route = pageForPath(pathname)
  const classPage = publishedClassPage(pathname)
  const classId = classPage?.classDef.id ?? (pathname === '/paladin' || pathname === '/build' || pathname.includes('paladin') ? 'paladin' : undefined)
  return <>{classId && <BetaPatchNotice classId={classId} />}{routeElement(pathname)}<FeedbackWidget inline={route.kind === 'glimmerwick-launch'} /></>
}
