/** The only hosts allowed to load Google Analytics or send its events. */
export const PRODUCTION_ANALYTICS_HOSTS = ['buildforgetools.com', 'www.buildforgetools.com'] as const

export function isProductionAnalyticsHost(hostname: string): boolean {
  return PRODUCTION_ANALYTICS_HOSTS.some((host) => host === hostname)
}

const MEASUREMENT_ID = 'G-DDT58001FZ'
const LEGACY_TAG = /(?:<!-- Google tag \(gtag\.js\) -->\s*)?<script\s+async\s+src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-DDT58001FZ"><\/script>\s*<script>([\s\S]*?)<\/script>/g

/** Vite runs this before its own HTML processing for every entry, including generated class shells. */
export function transformAnalyticsHtml(html: string, context?: { path: string }): string {
  let replacements = 0
  const transformed = html.replace(LEGACY_TAG, (_match, legacyInline: string) => {
    if (!new RegExp(`gtag\\('config',\\s*'${MEASUREMENT_ID}'`).test(legacyInline)) {
      throw new Error('Google tag has an unexpected inline configuration')
    }
    replacements += 1
    // Google requires the policy linked from its consent message to be readable without consent tags.
    if (context && /^\/privacy(?:\/index\.html|\/)?$/.test(context.path)) return ''
    return `<script>${analyticsBootstrapSource()}</script>`
  })
  if (replacements !== 1) throw new Error(`Expected one Google tag in HTML entry; found ${replacements}`)
  return transformed
}

/** Synchronous first-paint bootstrap: non-production hosts never insert the Google script. */
export function analyticsBootstrapSource(): string {
  return `(function () {
  if (!${JSON.stringify(PRODUCTION_ANALYTICS_HOSTS)}.includes(window.location.hostname)) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    region: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IE', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'CH'],
    wait_for_update: 500
  });
  window.gtag('js', new Date());
  window.gtag('config', '${MEASUREMENT_ID}', { page_path: window.location.pathname });
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}';
  document.head.appendChild(script);
})();`
}
