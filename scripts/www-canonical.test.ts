import { expect, it } from 'vitest'
import vercel from '../vercel.json'

it('permanently sends both the www homepage and inner paths to the apex host', () => {
  const hostRedirects = vercel.redirects.filter((rule) =>
    'has' in rule && rule.has?.some((condition) => condition.type === 'host' && condition.value === 'www.buildforgetools.com'),
  )
  expect(hostRedirects).toEqual(expect.arrayContaining([
    expect.objectContaining({ source: '/', destination: 'https://buildforgetools.com/', permanent: true }),
    expect.objectContaining({ source: '/:path*', destination: 'https://buildforgetools.com/:path*', permanent: true }),
  ]))
})
