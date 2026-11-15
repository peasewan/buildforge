import { renderToStaticMarkup } from 'react-dom/server'
import DiscoveryHeader from './DiscoveryHeader'
import SiteFooter from './SiteFooter'

// Fill both slots before delivery, so navigation works without client-side JavaScript.
export function renderAtlasChrome(html: string) {
  if (!html.includes('<!--ATLAS_HEADER-->') || !html.includes('<!--ATLAS_FOOTER-->')) throw new Error('Atlas page is missing its navigation slots')
  return html.replace('<!--ATLAS_HEADER-->', () => renderToStaticMarkup(<DiscoveryHeader />))
    .replace('<!--ATLAS_FOOTER-->', () => renderToStaticMarkup(<SiteFooter discovery />))
}
