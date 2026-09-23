import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppRoute from './AppRoute'
import { pageForPath } from './lib/routes'
import './emberville.css'
import './styles.css'
import './experiences/experience.css'
import './experiences/role-surfaces.css'
import './experiences/class-signature.css'
import './experiences/legacy-experience.css'

const page = pageForPath(window.location.pathname, window.location.search)
const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]') ?? document.head.appendChild(document.createElement('meta'))
robots.setAttribute('name', 'robots')
robots.setAttribute('content', page.robots)
document.title = page.title
document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', page.description)
document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', page.canonical)
document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', page.title)
document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', page.description)
document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', page.canonical)

const root = document.getElementById('root')!
const app = <StrictMode><AppRoute pathname={window.location.pathname} /></StrictMode>
// Keep the existing client mount so saved allocations and share parameters restore normally.
// The build-time HTML now uses this same component tree instead of a separate text-only page.
createRoot(root).render(app)

import './site-discovery.css'
