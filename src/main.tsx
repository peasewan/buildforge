import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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
import { pageForPath, type PageDefinition } from './lib/routes'
import './styles.css'

const page = pageForPath(window.location.pathname)
const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]') ?? document.head.appendChild(document.createElement('meta'))
robots.setAttribute('name', 'robots')
robots.setAttribute('content', page.robots)
document.title = page.title
document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', page.description)
document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', page.canonical)
document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', page.title)
document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', page.description)
document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', page.canonical)

/**
 * The class pages read their `ClassDefinition` and page record from the same gated lookup the
 * router used, so the component can never render a page the gate withheld.
 */
function routeElement(route: PageDefinition) {
  const classPage = publishedClassPage(window.location.pathname)
  if (route.kind === 'class-calculator' && classPage) return <ClassCalculatorPage classDef={classPage.classDef} />
  if (route.kind === 'class-document' && classPage) return <ClassDocumentPage classDef={classPage.classDef} page={classPage.page} />
  if (route.kind === 'emberville') return <EmbervillePage pageId={route.embervillePageId!} />
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {routeElement(page)}
    <FeedbackWidget />
  </StrictMode>,
)
