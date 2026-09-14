export type BuildLandingPageId = 'leveling' | 'pvp' | 'raid' | 'protection-dungeon'

export type LandingIcon = 'sword' | 'shield' | 'sparkles' | 'heart' | 'users' | 'route'

export type LandingSection =
  | { kind: 'steps'; title: string; intro?: string; items: { title: string; body: string }[] }
  | { kind: 'cards'; title: string; intro?: string; items: { title: string; body: string; icon: LandingIcon }[] }
  | { kind: 'bullets'; title: string; intro: string; items: string[] }
  | { kind: 'talent-preview'; title: string; intro: string }
  | { kind: 'related'; title: string; items: { title: string; body: string; href: string }[] }

export interface BuildLandingPageConfig {
  id: BuildLandingPageId
  slug: string
  title: string
  metaTitle: string
  description: string
  subtitle: string
  eyebrow: string
  heroImage: string
  heroPosition: string
  summary: { label: string; value: string }[]
  sections: LandingSection[]
  finalCta: { eyebrow: string; title: string; label: string; href: string }
}

export const BUILD_LANDING_PAGES: BuildLandingPageConfig[] = [
  {
    id: 'leveling',
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
    finalCta: { eyebrow: 'Ready to customize?', title: 'Shape a leveling path around your Paladin.', label: 'Open WoW Forever Paladin Talent Calculator', href: '/paladin' },
  },
  {
    id: 'pvp',
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
          { title: 'Retribution PvP', body: 'An offensive direction for players who want direct pressure while keeping familiar Paladin utility.', icon: 'sword' },
          { title: 'Holy PvP', body: 'A support direction focused on healing, positioning, and helping teammates survive focused attacks.', icon: 'heart' },
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
    finalCta: { eyebrow: 'Create your own PvP build', title: 'Test a PvP setup before the next fight.', label: 'Open Talent Calculator', href: '/paladin' },
  },
  {
    id: 'raid',
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
    finalCta: { eyebrow: 'Compare Paladin talent builds', title: 'Plan a raid role your group can review.', label: 'Open Talent Calculator', href: '/paladin' },
  },
  {
    id: 'protection-dungeon',
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
    finalCta: { eyebrow: 'Ready to adjust the tank build?', title: 'Load the full 20/31/0 setup in the planner.', label: 'Edit This Build', href: '/paladin' },
  },
]

export function buildLandingPageById(id: BuildLandingPageId) {
  return BUILD_LANDING_PAGES.find((page) => page.id === id) ?? BUILD_LANDING_PAGES[0]
}
