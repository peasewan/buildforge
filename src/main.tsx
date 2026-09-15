import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import BetaChangesPage from './BetaChangesPage'
import BuildPage from './BuildPage'
import BuildLandingPage from './BuildLandingPage'
import FeedbackWidget from './FeedbackWidget'
import GuidePage from './GuidePage'
import PaladinBuildsHub from './PaladinBuildsHub'
import ProtectionBuildsHub from './ProtectionBuildsHub'
import ProtectionTalentsPage from './ProtectionTalentsPage'
import { pageForPath } from './lib/routes'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {page.kind === 'guide' ? <GuidePage /> : page.kind === 'build-guide' ? <BuildPage buildId={page.buildId} /> : page.kind === 'build-landing' ? <BuildLandingPage pageId={page.landingPageId!} /> : page.kind === 'build-hub' ? <PaladinBuildsHub /> : page.kind === 'protection-hub' ? <ProtectionBuildsHub /> : page.kind === 'protection-talents' ? <ProtectionTalentsPage /> : page.kind === 'beta-changes' ? <BetaChangesPage /> : <App />}
    <FeedbackWidget />
  </StrictMode>,
)
