/** No substitute exists for these discontinued screens. Preserve an honest HTTP status. */
export default function handler(req: { method?: string }, res: { statusCode: number; setHeader(name: string, value: string): void; end(body?: string): void }) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET, HEAD')
    res.end()
    return
  }
  res.statusCode = 410
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('X-Robots-Tag', 'noindex, follow')
  res.setHeader('Cache-Control', 'public, max-age=300')
  res.end(req.method === 'HEAD' ? undefined : '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page retired | BuildForgeTools</title></head><body style="background:#090b10;color:#eee5d2;font:18px/1.7 system-ui;margin:10vh auto;padding:24px;max-width:680px"><h1>This page has been retired</h1><p>We have removed this outdated or incomplete resource. It no longer has a maintained replacement.</p><p><a style="color:#ffe8a3" href="/">Browse BuildForgeTools</a> · <a style="color:#ffe8a3" href="/wow-forever-classes">WoW class tools</a></p></body></html>')
}
