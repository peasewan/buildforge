import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { DISCOVERY_PAGES } from '../src/data/siteDiscovery'
for (const page of DISCOVERY_PAGES) {
  const file = page.path === '/' ? 'index.html' : `${page.path.slice(1)}/index.html`
  if (!process.argv.includes('--check') && page.path !== '/') mkdirSync(page.path.slice(1), { recursive: true })
  const title = page.title.replaceAll('&', '&amp;'), description = page.description.replaceAll('&', '&amp;'), canonical = `https://buildforgetools.com${page.path}`
  const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-DDT58001FZ"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-DDT58001FZ',{page_path:window.location.pathname});</script>
<meta name="theme-color" content="#090b10"/><meta name="robots" content="index, follow"/><meta name="description" content="${description}"/><link rel="canonical" href="${canonical}"/><link rel="icon" type="image/png" href="/favicon.png"/>
<meta property="og:title" content="${title}"/><meta property="og:site_name" content="BuildForgeTools"/><meta property="og:description" content="${description}"/><meta property="og:image" content="https://buildforgetools.com/images/hero/hero-paladin.webp"/><meta property="og:url" content="${canonical}"/><meta property="og:type" content="website"/>
<title>${title}</title></head><body><div id="root"><!-- PAGES_PRERENDER --></div><script type="module" src="/src/main.tsx"></script></body></html>\n`
  if (process.argv.includes('--check')) {
    if (readFileSync(file, 'utf8') !== html) throw new Error(`Discovery shell is stale: ${file}. Run npx tsx scripts/sync-discovery-static-pages.ts`)
  } else writeFileSync(file, html)
}
