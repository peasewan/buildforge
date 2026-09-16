import type { BuildCardIcon } from '../BuildCard'
import type { ExampleBuildId } from './builds'

export type BuildLandingPageId =
  | 'leveling'
  | 'pvp'
  | 'raid'
  | 'protection-dungeon'
  | 'protection-leveling'
  | 'retribution-pvp'
  | 'holy-pvp'

export type LandingIcon = 'sword' | 'shield' | 'sparkles' | 'heart' | 'users' | 'route'

export type LandingSection =
  | { kind: 'steps'; title: string; intro?: string; items: { title: string; body: string }[] }
  | { kind: 'cards'; title: string; intro?: string; items: { title: string; body: string; icon: LandingIcon; href?: string }[] }
  | { kind: 'bullets'; title: string; intro: string; items: string[] }
  | { kind: 'talent-preview'; title: string; intro: string; buildId: ExampleBuildId }
  | { kind: 'related'; title: string; items: { title: string; body: string; href: string }[] }

export interface BuildLandingPageConfig {
  id: BuildLandingPageId
  slug: string
  title: string
  metaTitle: string
  description: string
  subtitle: string
  eyebrow: string
  icon: BuildCardIcon
  heroImage: string
  heroPosition: string
  summary: { label: string; value: string }[]
  sections: LandingSection[]
  finalCta: { eyebrow: string; title: string; label: string; href: string }
}

export const BUILD_LANDING_PAGES: BuildLandingPageConfig[] = [
  {
    id: 'leveling',
    icon: 'leveling',
    slug: 'wow-forever-paladin-leveling-build',
    title: 'WoW Forever Paladin Leveling Build',
    metaTitle: 'WoW Forever Paladin Leveling Build | BuildForgeTools',
    description: 'Explore a beginner-friendly WoW Forever Paladin leveling build, follow a flexible talent path from level 10 onward, and customize it in the talent calculator.',
    subtitle: 'A beginner-friendly talent path for leveling Paladins in WoW Forever.',
    eyebrow: 'Community Preview Build',
    heroImage: '/images/hero/paladin-leveling.webp',
    heroPosition: '68% center',
    summary: [
      { label: 'Class', value: 'Paladin' },
      { label: 'Role', value: 'Leveling' },
      { label: 'Recommended For', value: 'New Players' },
      { label: 'Talent Points', value: 'Preview' },
    ],
    sections: [
      {
        kind: 'steps',
        title: 'Recommended Leveling Path',
        intro: 'Use these milestones as a simple framework while you learn the class. The exact order can change as the WoW Forever talent data is verified.',
        items: [
          { title: 'Level 10–20', body: 'Focus on early survivability and efficient solo play. Reliable opening talents make ordinary fights more forgiving and reduce time spent recovering.' },
          { title: 'Level 20–40', body: 'Unlock core talents and improve combat consistency. This is a useful point to decide whether you prefer damage, durability, or extra support.' },
          { title: 'Level 40+', body: 'Complete your preferred specialization, then use remaining points to add utility from another tree. Check the calculator before committing the final ranks.' },
        ],
      },
      {
        kind: 'cards',
        title: 'Why This Build',
        intro: 'A leveling build should feel dependable across quests, travel, and repeated solo encounters rather than depend on one narrow situation.',
        items: [
          { title: 'Faster Solo Progress', body: 'Spend talents that support steady damage and a smoother leveling experience.', icon: 'sword' },
          { title: 'Better Survivability', body: 'Defensive choices can reduce downtime between fights and leave more room for mistakes.', icon: 'shield' },
          { title: 'Easy to Customize', body: 'Adjust every choice with the Paladin Talent Calculator and share the result.', icon: 'sparkles' },
        ],
      },
      {
        kind: 'bullets',
        title: 'How to Use This Leveling Preview',
        intro: 'Open the planner, choose the branch that matches your current playstyle, and spend points in the order they become available. Keep a share link whenever you reach a useful milestone.',
        items: ['Compare Holy, Protection, and Retribution paths.', 'Watch prerequisites before planning deeper talents.', 'Treat all talent details as community preview data until verified in game.'],
      },
    ],
    finalCta: { eyebrow: 'Ready to customize?', title: 'Shape a leveling path around your Paladin.', label: 'Open WoW Forever Paladin Talent Calculator', href: '/paladin#calculator' },
  },
  {
    id: 'pvp',
    icon: 'pvp',
    slug: 'wow-forever-paladin-pvp-build',
    title: 'WoW Forever Paladin PvP Build',
    metaTitle: 'WoW Forever Paladin PvP Build | BuildForgeTools',
    description: 'Plan a flexible WoW Forever Paladin PvP build for pressure, utility, and survivability, then compare Retribution, Holy, and hybrid talent variants.',
    subtitle: 'Plan a PvP-focused Paladin build with flexible talent choices.',
    eyebrow: 'Paladin PvP Build',
    heroImage: '/images/hero/paladin-pvp.webp',
    heroPosition: '68% center',
    summary: [
      { label: 'Playstyle', value: 'PvP' },
      { label: 'Strengths', value: 'Burst · Utility · Survival' },
      { label: 'Difficulty', value: 'Intermediate' },
      { label: 'Status', value: 'Community Preview' },
    ],
    sections: [
      {
        kind: 'cards',
        title: 'PvP Build Goals',
        intro: 'A useful PvP setup balances pressure with the defensive and support tools that give Paladins room to respond.',
        items: [
          { title: 'Pressure Opponents', body: 'Choose talents that improve offensive pressure and help turn short openings into meaningful damage.', icon: 'sword' },
          { title: 'Survive Enemy Bursts', body: 'Plan defensive tools and utility so the build has answers when an opponent commits cooldowns.', icon: 'shield' },
          { title: 'Adapt Your Setup', body: 'Different matchups, team sizes, and objectives may reward different talent choices.', icon: 'sparkles' },
        ],
      },
      {
        kind: 'cards',
        title: 'Popular PvP Variants',
        intro: 'Start with the role you want to perform, then adjust the supporting talents around your group and opponents.',
        items: [
          { title: 'Retribution PvP', body: 'An offensive direction for players who want direct pressure while keeping familiar Paladin utility.', icon: 'sword', href: '/wow-forever-retribution-paladin-pvp-build' },
          { title: 'Holy PvP', body: 'A support direction focused on healing, positioning, and helping teammates survive focused attacks.', icon: 'heart', href: '/wow-forever-holy-paladin-pvp-build' },
          { title: 'Hybrid PvP', body: 'A flexible route that trades a deep specialization for selected tools across more than one tree.', icon: 'route' },
        ],
      },
      {
        kind: 'bullets',
        title: 'Plan Around the Match',
        intro: 'There is no single preview allocation that covers every PvP situation. Use the calculator to keep several versions and compare their tradeoffs.',
        items: ['Choose a clear offensive or support role.', 'Reserve enough points for the utility you expect to use.', 'Verify current talent behavior in game before treating a setup as final.'],
      },
    ],
    finalCta: { eyebrow: 'Create your own PvP build', title: 'Test a PvP setup before the next fight.', label: 'Open Talent Calculator', href: '/paladin#calculator' },
  },
  {
    id: 'raid',
    icon: 'raid',
    slug: 'wow-forever-paladin-raid-build',
    title: 'WoW Forever Paladin Raid Build',
    metaTitle: 'WoW Forever Paladin Raid Build | BuildForgeTools',
    description: 'Explore WoW Forever Paladin raid build roles for Holy healing, Protection tanking, and Retribution support, then plan all 51 talent points.',
    subtitle: 'Explore raid-oriented Paladin talent paths for group content.',
    eyebrow: 'Paladin Raid Build',
    heroImage: '/images/hero/paladin-raid.webp',
    heroPosition: '68% center',
    summary: [
      { label: 'Content', value: 'Raid' },
      { label: 'Roles', value: 'Healing · Tank · Damage' },
      { label: 'Focus', value: 'Group Utility' },
      { label: 'Status', value: 'Community Preview' },
    ],
    sections: [
      {
        kind: 'bullets',
        title: 'Raid Build Philosophy',
        intro: 'A raid Paladin build usually focuses on dependable contribution across a full encounter. The role comes first, while supporting talents help the wider group.',
        items: ['Strong utility for the assigned raid role.', 'Reliable performance across repeated encounters.', 'Group support that complements the raid composition.', 'Consistent contribution rather than a narrow one-fight trick.'],
      },
      {
        kind: 'cards',
        title: 'Choose Your Raid Role',
        intro: 'Pick the specialization that matches your assignment, then use the planner to compare complete and hybrid talent paths.',
        items: [
          { title: 'Holy', body: 'Build around raid healing and the support tools your group expects from a Holy Paladin.', icon: 'heart' },
          { title: 'Protection', body: 'Explore a main tank or off tank route with defensive talents and group utility.', icon: 'shield' },
          { title: 'Retribution', body: 'Plan a damage support route that keeps pressure and Paladin utility in view.', icon: 'sword' },
        ],
      },
      {
        kind: 'steps',
        title: 'Prepare a Raid Build',
        intro: 'BuildForge turns an idea into a link your group can review before raid time.',
        items: [
          { title: 'Choose the assignment', body: 'Start with healing, tanking, or damage support so every talent choice has a clear purpose.' },
          { title: 'Spend all 51 points', body: 'Use the talent tree to check prerequisites and compare the value of supporting branches.' },
          { title: 'Share the setup', body: 'Copy the build URL and send the exact allocation to raid leaders or teammates for discussion.' },
        ],
      },
    ],
    finalCta: { eyebrow: 'Compare Paladin talent builds', title: 'Plan a raid role your group can review.', label: 'Open Talent Calculator', href: '/paladin#calculator' },
  },
  {
    id: 'protection-dungeon',
    icon: 'protection',
    slug: 'wow-forever-protection-paladin-dungeon-build',
    title: 'WoW Forever Protection Paladin Dungeon Tank Build',
    metaTitle: 'WoW Forever Protection Paladin Dungeon Tank Build | BuildForgeTools',
    description: 'Preview a defensive WoW Forever Protection Paladin dungeon tank build, inspect the Protection talent tree, and edit the 20/31/0 setup.',
    subtitle: 'A defensive Protection Paladin build designed for dungeon tanking.',
    eyebrow: 'Protection Dungeon Build',
    heroImage: '/images/hero/protection-dungeon.webp',
    heroPosition: '68% center',
    summary: [
      { label: 'Role', value: 'Dungeon Tank' },
      { label: 'Specialization', value: 'Protection' },
      { label: 'Playstyle', value: 'Defensive' },
      { label: 'Status', value: 'Community Preview' },
    ],
    sections: [
      {
        kind: 'cards',
        title: 'Why This Tank Build',
        intro: 'This dungeon preview starts from the site’s 20/31/0 Protection example and keeps the three jobs of a tank visible.',
        items: [
          { title: 'Survivability', body: 'Increase defensive capability and create a steadier base for dungeon encounters.', icon: 'shield' },
          { title: 'Threat Generation', body: 'Plan talents that help maintain enemy attention while the party deals damage.', icon: 'sword' },
          { title: 'Group Utility', body: 'Keep Paladin support tools available to protect teammates and respond to difficult pulls.', icon: 'sparkles' },
        ],
      },
      {
        kind: 'talent-preview',
        title: 'Protection Talent Preview',
        intro: 'Inspect the selected Protection branch below. The highlighted nodes come from the community-preview 20/31/0 shield build; open it in the calculator to change ranks or share your version.',
        buildId: 'protection-shield-20-31-0',
      },
      {
        kind: 'bullets',
        title: 'Using the Dungeon Build',
        intro: 'A dungeon tank setup depends on the content, party, and current talent implementation. Use this page as a planning starting point.',
        items: ['Review defensive talents before deeper utility choices.', 'Open the full build to inspect Holy support points.', 'Confirm community-preview talent effects against the current game client.'],
      },
      {
        kind: 'related',
        title: 'More Paladin Builds',
        items: [
          { title: 'Protection Paladin Builds Hub', body: 'Compare tank builds, Protection talents, and planning paths.', href: '/wow-forever-protection-paladin-builds' },
          { title: 'Retribution DPS Build', body: 'Open the 0/20/31 offensive preview.', href: '/wow-forever-retribution-paladin-build' },
          { title: 'Holy Healing Build', body: 'Review the 31/20/0 healing allocation.', href: '/wow-forever-paladin-build' },
          { title: 'Paladin Leveling Build', body: 'Plan a flexible path from level 10 onward.', href: '/wow-forever-paladin-leveling-build' },
        ],
      },
    ],
    finalCta: { eyebrow: 'Ready to adjust the tank build?', title: 'Load the full 20/31/0 setup in the planner.', label: 'Edit This Build', href: '/paladin#calculator' },
  },
  {
    id: 'protection-leveling',
    icon: 'protection',
    slug: 'wow-forever-protection-paladin-leveling-build',
    title: 'WoW Forever Protection Paladin Leveling Build',
    metaTitle: 'WoW Forever Protection Paladin Leveling Build | BuildForgeTools',
    description: 'Level a WoW Forever Protection Paladin with a durable solo setup. Follow the talent path, cut downtime between fights, and carry it into dungeon tanking.',
    subtitle: 'A durable solo leveling path for Protection Paladins in WoW Forever.',
    eyebrow: 'Protection Leveling Build',
    heroImage: '/images/hero/paladin-leveling.webp',
    heroPosition: '68% center',
    summary: [
      { label: 'Role', value: 'Leveling' },
      { label: 'Specialization', value: 'Protection' },
      { label: 'Playstyle', value: 'Solo Survivability' },
      { label: 'Status', value: 'Community Preview' },
    ],
    sections: [
      {
        kind: 'cards',
        title: 'Why Level as Protection',
        intro: 'Protection trades a little kill speed for fights you can walk away from, which matters more while questing alone than it does in a prepared group.',
        items: [
          { title: 'Fewer Deaths While Questing', body: 'Defensive talents widen the margin for mistakes when a pull goes wrong or an extra patrol joins in.', icon: 'shield' },
          { title: 'Less Downtime Between Fights', body: 'Survivability talents reduce the time spent recovering, so more of a session goes into actual progress.', icon: 'heart' },
          { title: 'A Direct Route Into Dungeons', body: 'Points spent levelling stay useful for tanking, so the setup carries over instead of being replaced.', icon: 'shield' },
        ],
      },
      {
        kind: 'talent-preview',
        title: 'Protection Talent Preview',
        intro: 'The 20/31/0 community-preview allocation below is the target these levels build toward. Open it in the calculator to change ranks, or plan your own order of spending.',
        buildId: 'protection-shield-20-31-0',
      },
      {
        kind: 'steps',
        title: 'Leveling Path',
        intro: 'This is a suggested order of emphasis, not a fixed schedule. Talent availability and your own questing pace decide the exact points.',
        items: [
          { title: 'Early Levels', body: 'Start with the defensive and durability talents that make ordinary questing fights forgiving, so a bad pull is survivable rather than fatal.' },
          { title: 'Mid Levels', body: 'Move into the core Protection talents that carry the build into group content, and keep an eye on prerequisites before planning deeper nodes.' },
          { title: 'Transition to Dungeons', body: 'Once the tanking core is in place, compare against the dedicated dungeon tank setup and adjust the supporting points for group play.' },
        ],
      },
      {
        kind: 'related',
        title: 'Related Protection Builds',
        items: [
          { title: 'Protection Dungeon Tank Build', body: 'The group-content setup these levels lead into.', href: '/wow-forever-protection-paladin-dungeon-build' },
          { title: 'Protection Paladin Builds Hub', body: 'Compare every Protection route and talent page.', href: '/wow-forever-protection-paladin-builds' },
          { title: 'Paladin Leveling Build', body: 'The class-wide leveling path when you have not picked a specialization.', href: '/wow-forever-paladin-leveling-build' },
        ],
      },
    ],
    finalCta: { eyebrow: 'Ready to plan the order?', title: 'Map out your Protection leveling points.', label: 'Open Talent Calculator', href: '/paladin#calculator' },
  },
  {
    id: 'retribution-pvp',
    icon: 'retribution',
    slug: 'wow-forever-retribution-paladin-pvp-build',
    title: 'WoW Forever Retribution Paladin PvP Build',
    metaTitle: 'WoW Forever Retribution Paladin PvP Build | BuildForgeTools',
    description: 'Plan a WoW Forever Retribution Paladin PvP build around burst windows and utility. Inspect the 0/20/31 allocation and adjust it for your matchups.',
    subtitle: 'A burst-oriented Retribution setup for WoW Forever PvP combat.',
    eyebrow: 'Retribution PvP Build',
    heroImage: '/images/hero/paladin-pvp.webp',
    heroPosition: '68% center',
    summary: [
      { label: 'Playstyle', value: 'PvP' },
      { label: 'Specialization', value: 'Retribution' },
      { label: 'Strengths', value: 'Burst · Utility · Pressure' },
      { label: 'Status', value: 'Community Preview' },
    ],
    sections: [
      {
        kind: 'cards',
        title: 'PvP Strengths',
        intro: 'A Retribution PvP setup leans on short windows of pressure and the Paladin tools that keep you alive between them.',
        items: [
          { title: 'Burst Windows', body: 'Retribution talents concentrate damage into short openings, which suits opponents who will not stand still for long.', icon: 'sword' },
          { title: 'Defensive Cooldowns', body: 'The 20 points outside Retribution keep Paladin defensive and support tools reachable when a fight turns against you.', icon: 'shield' },
          { title: 'Utility For Your Team', body: 'Blessings, cleanses, and support tools are often as decisive in battlegrounds as raw damage.', icon: 'sparkles' },
        ],
      },
      {
        kind: 'talent-preview',
        title: 'Retribution Talent Preview',
        intro: 'The 0/20/31 community-preview allocation below is the starting point. PvP rewards adaptation, so open it in the calculator and keep several versions.',
        buildId: 'retribution-judgment-0-20-31',
      },
      {
        kind: 'cards',
        title: 'Playstyle',
        intro: 'Three phases to plan around in most engagements.',
        items: [
          { title: 'Engage', body: 'Close the distance and commit only when your damage cooldowns are actually available.', icon: 'sword' },
          { title: 'Burst', body: 'Spend your window on the target your group is already pressuring rather than starting a separate fight.', icon: 'sparkles' },
          { title: 'Survive', body: 'Keep a defensive tool for the moment your burst ends, because that is when opponents will answer.', icon: 'shield' },
        ],
      },
      {
        kind: 'related',
        title: 'Related PvP and Retribution Builds',
        items: [
          { title: 'Paladin PvP Build', body: 'The class-wide PvP overview covering every specialization.', href: '/wow-forever-paladin-pvp-build' },
          { title: 'Holy Paladin PvP Build', body: 'The support-oriented alternative for PvP.', href: '/wow-forever-holy-paladin-pvp-build' },
          { title: 'Retribution Leveling Build', body: 'The PvE route for the same specialization.', href: '/wow-forever-retribution-paladin-leveling-build' },
        ],
      },
    ],
    finalCta: { eyebrow: 'Test a PvP setup', title: 'Adapt the Retribution allocation to your matchups.', label: 'Open Talent Calculator', href: '/paladin#calculator' },
  },
  {
    id: 'holy-pvp',
    icon: 'holy',
    slug: 'wow-forever-holy-paladin-pvp-build',
    title: 'WoW Forever Holy Paladin PvP Build',
    metaTitle: 'WoW Forever Holy Paladin PvP Build | BuildForgeTools',
    description: 'Plan a support-oriented WoW Forever Holy Paladin PvP setup. Start from the 31/20/0 healing allocation and adjust it for arena and battleground play.',
    subtitle: 'A support-oriented Holy Paladin setup for WoW Forever PvP.',
    eyebrow: 'Holy PvP Build',
    heroImage: '/images/hero/hero-paladin.webp',
    heroPosition: '68% center',
    summary: [
      { label: 'Playstyle', value: 'PvP' },
      { label: 'Specialization', value: 'Holy' },
      { label: 'Focus', value: 'Support & Survivability' },
      { label: 'Status', value: 'Community Preview' },
    ],
    sections: [
      {
        kind: 'cards',
        title: 'Support Focus',
        intro: 'A Holy Paladin in PvP is usually keeping someone else alive under pressure, so the priorities differ from a raid healing setup even though the tree is similar.',
        items: [
          { title: 'Keeping Teammates Up', body: 'Healing throughput matters less than reaching the right target through crowd control and pressure.', icon: 'heart' },
          { title: 'Staying Alive Yourself', body: 'A support build that dies first helps nobody. The Protection points in the allocation support personal survivability.', icon: 'shield' },
          { title: 'Positioning', body: 'Where you stand decides whether you can heal through an enemy push or get separated from your group.', icon: 'route' },
        ],
      },
      {
        kind: 'bullets',
        title: 'Planning a Holy PvP Setup',
        intro: 'This page describes a direction rather than a verified PvP allocation. The 31/20/0 healing build is a starting reference point, and the community-preview talent data has not been confirmed for PvP balance in WoW Forever yet.',
        items: [
          'Treat the 31/20/0 healing allocation as a starting point, not a finished PvP build.',
          'Decide early whether you are the primary healer or a support hybrid, because it changes how many points you can spare.',
          'Keep several calculator versions for different team sizes and objectives.',
          'Confirm talent behaviour in the current game client before committing.',
        ],
      },
      {
        kind: 'related',
        title: 'Related Holy and PvP Builds',
        items: [
          { title: 'Holy Healing Build 31/20/0', body: 'The full healing allocation this setup starts from.', href: '/wow-forever-paladin-build' },
          { title: 'Paladin PvP Build', body: 'The class-wide PvP overview covering every specialization.', href: '/wow-forever-paladin-pvp-build' },
          { title: 'Retribution Paladin PvP Build', body: 'The damage-oriented alternative for PvP.', href: '/wow-forever-retribution-paladin-pvp-build' },
        ],
      },
    ],
    finalCta: { eyebrow: 'Plan your support setup', title: 'Start from the healing allocation and adapt it.', label: 'Open Talent Calculator', href: '/paladin#calculator' },
  },
]

export function buildLandingPageById(id: BuildLandingPageId) {
  return BUILD_LANDING_PAGES.find((page) => page.id === id) ?? BUILD_LANDING_PAGES[0]
}
