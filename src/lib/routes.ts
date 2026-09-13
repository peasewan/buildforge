export interface PageDefinition {
  kind: 'planner' | 'guide'
  title: string
  description: string
  canonical: string
}

const plannerPage: PageDefinition = {
  kind: 'planner',
  title: 'BuildForgeTools — WoW Forever Paladin Talent Preview',
  description: 'BuildForgeTools is a free WoW Forever Paladin talent preview and build planner — plan, preview, and share Holy, Protection, and Retribution builds.',
  canonical: 'https://buildforgetools.com/paladin',
}

const guidePage: PageDefinition = {
  kind: 'guide',
  title: 'WoW Forever Paladin Talent Guide & Build Planner | BuildForgeTools',
  description: 'Learn how Holy, Protection, and Retribution Paladin talents work in WoW Forever, then plan and share a build with the BuildForgeTools calculator.',
  canonical: 'https://buildforgetools.com/wow-forever-paladin-talents',
}

export function pageForPath(pathname: string): PageDefinition {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  return normalized === '/wow-forever-paladin-talents' ? guidePage : plannerPage
}
