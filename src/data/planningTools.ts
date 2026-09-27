import { PUBLISHED_CLASSES } from './classes'
import { BETA_SPEC_PATHS } from './betaSpecPaths'
import { BRANCHES, encodeBuild } from '../lib/build'
import { talents, branchNames, BETA_DATA_VERSION } from './talents'
import { classPlannerHref, publishedClassPages, type ClassDefinition } from '../lib/classPage'
import { incrementPlannerTalent, encodePlannerBuild, type PlannerBuild } from '../lib/talentPlanner'
import { progressionForBuild } from '../experiences/buildExperience'

export type ToolRole = 'tank' | 'heal' | 'damage'
export type ToolStyle = 'melee' | 'ranged' | 'any'
export type ToolActivity = 'solo' | 'pvp' | 'dungeon'
export const DUNGEONS = [
  { id: 'hall-of-thanes', name: 'Hall of Thanes', minLevel: 13, maxLevel: 18, supported: true, note: 'A lower-level group route. Start with your party role and the points you can actually spend.' },
  { id: 'ruins-of-lordaeron', name: 'Ruins of Lordaeron', minLevel: 15, maxLevel: 20, supported: true, note: 'Compare group-role routes within the supported Level 20 planning budget.' },
  { id: 'excavation-site', name: 'Excavation Site', minLevel: 24, maxLevel: 29, supported: false, note: 'Not available in this tool: a reviewed higher-level route is required first.' },
] as const
export const DUNGEON_SOURCES = [
  { label: 'Wowhead dungeon overview — reference level ranges', href: 'https://www.wowhead.com/forever/guide/dungeons-overview-locations-details' },
  { label: 'Warcraft Tavern dungeon reference', href: 'https://www.warcrafttavern.com/forever/guides/dungeons/' },
]
export interface ToolRoute {
  id: string; classId: string; className: string; spec: string; specName: string
  role: ToolRole; style: Exclude<ToolStyle, 'any'>; activity: ToolActivity
  title: string; href: string; image?: string; version: string
  steps: Array<{ level: number; allocation: PlannerBuild; talentId: string; rank: number; name: string }>
  calculatorHref: (allocation: PlannerBuild) => string
}
const healerSpecs = new Set(['paladin:holy', 'priest:holy', 'priest:discipline', 'druid:restoration', 'shaman:restoration'])
function roleFor(classId: string, spec: string, intent: string): ToolRole {
  if (spec === 'protection' || (classId === 'druid' && spec === 'feral' && intent === 'tank')) return 'tank'
  return healerSpecs.has(`${classId}:${spec}`) ? 'heal' : 'damage'
}
function styleFor(classId: string, spec: string): Exclude<ToolStyle, 'any'> {
  return ['warrior', 'rogue'].includes(classId) || (classId === 'paladin' && spec !== 'holy') || (classId === 'druid' && spec === 'feral') || (classId === 'shaman' && spec === 'enhancement') ? 'melee' : 'ranged'
}
function activityFor(intent: string): ToolActivity {
  return intent === 'pvp' ? 'pvp' : ['dungeon', 'specDungeon', 'tank', 'healing'].includes(intent) ? 'dungeon' : 'solo'
}
export function buildCatalogue(classes: ClassDefinition[] = PUBLISHED_CLASSES, includePaladin = true): ToolRoute[] {
  const pages = publishedClassPages(classes)
  const paths = new Set(pages.map(({ page }) => `/${page.slug}`))
  const routes: ToolRoute[] = classes.flatMap(def => {
    if (!paths.has(def.plannerPath)) return []
    return def.builds.flatMap(build => {
      if (build.level !== 20 || !paths.has(build.href)) return []
      const progression = progressionForBuild(def, build)
      if (progression.error || progression.steps.length !== 11) return []
      return [{ id: build.id, classId: def.id, className: def.name, spec: build.spec, specName: def.branchNames[build.spec], role: roleFor(def.id,build.spec,build.intent), style: styleFor(def.id,build.spec), activity: activityFor(build.intent), title: build.title, href: build.href, image: def.branchIcons?.[build.spec], version: build.verifiedThroughBuild,
        steps: progression.steps.map(s => ({...s, name: def.talents.find(t => t.id === s.talentId)!.name})),
        calculatorHref: (allocation: PlannerBuild) => `${classPlannerHref(def,encodePlannerBuild(allocation),20)}#class-calculator`,
      }]
    })
  })
  if (includePaladin) {
    // The archived Protection path contains Improved Holy Strike, removed in the Sep 24 notes.
    // Do not carry that known-obsolete route into a newly published recommendation tool.
    for (const branch of ['holy','retribution'] as const) {
      const path = BETA_SPEC_PATHS[branch]
      let allocation: PlannerBuild = {}
      const steps: ToolRoute['steps'] = []
      for (const [id,rank] of Object.entries(path.current.build)) {
        const talent = talents.find(t => t.id === id)
        if (!talent) break
        for (let i=0;i<rank;i++) {
          const next = incrementPlannerTalent(allocation,talent,talents,{branches:BRANCHES,pointCap:11})
          if (next === allocation) break
          allocation = next
          steps.push({level:steps.length+10,allocation,talentId:id,rank:allocation[id],name:talent.name})
        }
      }
      if (steps.length !== 11) continue
      routes.push({id:`paladin-${branch}`,classId:'paladin',className:'Paladin',spec:branch,specName:branchNames[branch],role:branch === 'holy' ? 'heal' : 'damage',style:branch === 'holy' ? 'ranged' : 'melee',activity:branch === 'holy' ? 'dungeon' : 'solo',title:`${branchNames[branch]} Paladin starting route`,href:branch === 'holy' ? '/wow-forever-paladin-build' : '/wow-forever-retribution-paladin-build',image:branch === 'holy' ? '/images/icons/holy-strike.png' : '/images/icons/hammer.png',version:BETA_DATA_VERSION.replace('wow_forever_beta_',''),steps,calculatorHref: allocation => `/build?id=${encodeBuild(allocation)}#calculator`})
    }
  }
  return routes
}
const catalogue = buildCatalogue()
export function snapshotAtLevel(route: ToolRoute, level: number) {
  if (!Number.isInteger(level) || level < 10 || level > 20) return undefined
  return route.steps.find(step => step.level === level)
}
function uniqueSpecs(routes: ToolRoute[]): ToolRoute[] {
  const seen = new Set<string>()
  return routes.filter(route => { const key = `${route.classId}:${route.spec}`; if (seen.has(key)) return false; seen.add(key); return true })
}
export function dungeonMatches(dungeonId: string, role: ToolRole, classId: string, level: number): ToolRoute[] {
  const dungeon = DUNGEONS.find(d => d.id === dungeonId)
  if (!dungeon?.supported || level < dungeon.minLevel || level > dungeon.maxLevel || !Number.isInteger(level)) return []
  return uniqueSpecs(catalogue.filter(r => r.role === role && (classId === 'all' || r.classId === classId) && !!snapshotAtLevel(r,level)).sort((a,b) => Number(b.activity === 'dungeon') - Number(a.activity === 'dungeon')))
}
export interface PickerPreferences { activity: ToolActivity; role: ToolRole; style: ToolStyle }
export function pickSpecs(preferences: PickerPreferences): Array<{ route: ToolRoute; reasons: string[] }> {
  const matches = catalogue.filter(r => r.role === preferences.role && (preferences.style === 'any' || r.style === preferences.style) && (preferences.activity === 'dungeon' || r.activity === preferences.activity))
  return uniqueSpecs(matches.sort((a,b) => Number(b.activity === preferences.activity)-Number(a.activity === preferences.activity) || a.className.localeCompare(b.className) || a.specName.localeCompare(b.specName))).map(route => ({route,reasons:[`${preferences.role === 'heal' ? 'Healing' : preferences.role === 'tank' ? 'Tanking' : 'Damage'} role matches your choice.`, `${route.style === 'melee' ? 'Melee' : 'Ranged / casting'} focus${preferences.style === 'any' ? ' is shown for comparison' : ' matches your preferred style'}.`,route.activity === preferences.activity ? 'A published route covers your selected activity.' : 'A published starting route is available; dungeon suitability still needs party testing.']}))
}
export const TOOL_CLASSES = [...new Map(catalogue.map(r => [r.classId,{id:r.classId,name:r.className}])).values()].sort((a,b)=>a.name.localeCompare(b.name))
