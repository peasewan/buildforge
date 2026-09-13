import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import GuidePage from './GuidePage'
import { pageForPath } from './lib/routes'
import './styles.css'

const page = pageForPath(window.location.pathname)
document.title = page.title
document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', page.description)
document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', page.canonical)
document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', page.title)
document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', page.description)
document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', page.canonical)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {page.kind === 'guide' ? <GuidePage /> : <App />}
  </StrictMode>,
)
