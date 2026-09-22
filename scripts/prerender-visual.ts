import { readdir, readFile, writeFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import AppRoute from '../src/AppRoute'

// Run directly after Vite: every shell still contains an empty root / content marker.
// Use the real route components so the first paint already has the final layout and art.
const dist = new URL('../dist/', import.meta.url)
const files = (await readdir(dist, { recursive: true })).filter((file) => file.endsWith('.html'))
for (const file of files) {
  const output = new URL(file, dist)
  const shell = await readFile(output, 'utf8')
  const root = /<div id="root">\s*(?:<!--[\s\S]*?-->\s*)?<\/div>/
  if (!root.test(shell)) throw new Error(`Expected an unrendered root in ${file}`)
  const pathname = file === 'index.html' ? '/' : `/${file.replace(/\/index\.html$/, '')}`
  const html = renderToString(createElement(AppRoute, { pathname }))
  if ((html.match(/<h1[ >]/g) ?? []).length !== 1) throw new Error(`Expected one H1 in ${file}`)
  await writeFile(output, shell.replace(root, () => `<div id="root" data-rendered="visual">${html}</div>`))
}
console.log(`Rendered ${files.length} pages using the browser's visual components.`)
