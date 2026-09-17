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
  | { kind: 'copy'; title: string; intro?: string; paragraphs: string[] }
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
  /**
   * Build the primary CTAs load. Only needed when the page names an allocation but
   * renders no talent-preview section — without it the CTA falls back to an empty planner.
   */
  ctaBuildId?: ExampleBuildId
  sections: LandingSection[]
  /** Where the footer CTA goes is derived from the page's build, not configured. */
  finalCta: { eyebrow: string; title: string; label: string }
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
      {
        kind: 'copy',
        title: 'Choose a Leveling Direction',
        intro: 'The class-wide page helps you choose a route before it sends you to a complete specialization example.',
        paragraphs: [
          'BuildForgeTools currently has two concrete leveling references. The Retribution leveling page loads a complete 20/0/31 allocation built around a deep Retribution core with Holy support. The Protection leveling page works toward the site’s 20/31/0 Shield allocation and explains why a player may accept slower kills in exchange for durability and an easier transition into dungeon tanking. Those are distinct end-state plans, not two labels for the same generic advice.',
          'There is no dedicated Holy leveling allocation on the site yet. A player who wants to level through healing or group support should start with an empty calculator, choose the talents that solve the current leveling problem, and save milestone links instead of treating the 31/20/0 Holy healing build as a proven leveling route. The related pages below make the available evidence clear before you commit to one specialization.',
        ],
      },
      {
        kind: 'copy',
        title: 'Turn an End-State Build into a Leveling Plan',
        paragraphs: [
          'A 51-point build shows the destination, while leveling requires an order. Begin with the talents available at the current level and ask what slows progress now: long recovery, fragile pulls, inconsistent damage, or the need to tank group content. Spend toward that immediate need while keeping deeper tree thresholds and prerequisites visible. Reopen the final allocation after each milestone to check whether short-term changes have pushed the route away from the intended specialization.',
          'Keep separate share links around levels 20, 40, and the final 51-point setup. This makes the progression reviewable and avoids rebuilding the plan from memory. WoW Forever beta data can change ranks, tooltips, prerequisites, or coordinates, so confirm important talents in the current client and revisit the Beta tracker before following an older saved route exactly.',
        ],
      },
      {
        kind: 'related',
        title: 'Related Leveling Builds',
        items: [
          { title: 'Protection Paladin Leveling Build', body: 'The durable solo route for players who want to tank later.', href: '/wow-forever-protection-paladin-leveling-build' },
          { title: 'Retribution Paladin Leveling Build', body: 'The damage-focused solo route through the same levels.', href: '/wow-forever-retribution-paladin-leveling-build' },
          { title: 'All Paladin Builds', body: 'Every leveling, PvE, and PvP route in one place.', href: '/wow-forever-paladin-builds' },
        ],
      },
    ],
    finalCta: { eyebrow: 'Ready to customize?', title: 'Shape a leveling path around your Paladin.', label: 'Open WoW Forever Paladin Talent Calculator' },
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
      {
        kind: 'copy',
        title: 'What This PvP Page Can Confirm',
        intro: 'Use the page to compare roles and planning questions, while keeping the current evidence boundary visible.',
        paragraphs: [
          'The current Retribution PvP page starts from the complete 0/20/31 Judgment allocation, and the Holy PvP page starts from the complete 31/20/0 healing allocation. Those underlying builds are real calculator presets on BuildForgeTools. Their PvP interpretations are community planning directions, because the site does not yet have enough verified WoW Forever match data to call either allocation a finished PvP standard.',
          'That distinction prevents a familiar talent name or a complete 51-point total from becoming unsupported competitive advice. Use the specialization pages to inspect which full build is being adapted, then change the ranks for the team size and objective you expect. Confirm important control, defensive, and damage effects in the current client before sharing the result as a recommendation.',
        ],
      },
      {
        kind: 'copy',
        title: 'Compare PvP Roles Before Spending Points',
        paragraphs: [
          'Retribution begins with pressure: reaching a target, creating a short damage window, and surviving the answer after that window closes. Holy begins with support: staying in range of teammates, healing through focused pressure, and protecting itself well enough to continue casting. A hybrid gives up part of a deep specialization to collect selected tools from another tree, so its value depends on a precise team problem rather than the word “flexible.”',
          'Choose the job first, list the tools that job requires, and only then spend toward deeper rows. Make one link for the general plan and separate variants for battleground objectives, small-group fights, or a specific partner composition. Comparing exact URLs is more useful than arguing over a label, especially while beta balance and talent behavior can still change.',
        ],
      },
      {
        kind: 'related',
        title: 'Related PvP Builds',
        items: [
          { title: 'Retribution Paladin PvP Build', body: 'The burst-oriented route built around damage windows.', href: '/wow-forever-retribution-paladin-pvp-build' },
          { title: 'Holy Paladin PvP Build', body: 'The support-oriented route for keeping teammates alive.', href: '/wow-forever-holy-paladin-pvp-build' },
          { title: 'All Paladin Builds', body: 'Every leveling, PvE, and PvP route in one place.', href: '/wow-forever-paladin-builds' },
        ],
      },
    ],
    finalCta: { eyebrow: 'Create your own PvP build', title: 'Test a PvP setup before the next fight.', label: 'Open Talent Calculator' },
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
          { title: 'Holy', body: 'Build around raid healing and the support tools your group expects from a Holy Paladin.', icon: 'heart', href: '/wow-forever-paladin-build' },
          { title: 'Protection', body: 'Explore a main tank or off tank route with defensive talents and group utility.', icon: 'shield', href: '/wow-forever-protection-paladin-dungeon-build' },
          { title: 'Retribution', body: 'Plan a damage support route that keeps pressure and Paladin utility in view.', icon: 'sword', href: '/wow-forever-retribution-paladin-build' },
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
      {
        kind: 'copy',
        title: 'Use Published Builds as Role References',
        intro: 'Three complete examples provide concrete allocations, but their raid use still depends on assignment and current game data.',
        paragraphs: [
          'The Holy 31/20/0 page is the clearest healing reference: it lists every selected rank and explains the healing-oriented allocation. Protection has a complete 20/31/0 Shield build for a defensive group role, while Retribution has a complete 0/20/31 Judgment build for damage with Protection support. Each one opens the exact 51-point setup in the calculator so a raid group can review the same talents instead of discussing only a specialization name.',
          'These examples have not been presented as encounter-tested raid standards. The current dataset mixes confirmed, community-supported, and still-unverified WoW Forever fields. Treat the complete allocations as starting references, check the talents that matter to the assigned fight, and change the supporting branch when the group needs a different form of utility or survivability.',
        ],
      },
      {
        kind: 'copy',
        title: 'Review the Build with Your Raid Group',
        paragraphs: [
          'Start with the assignment: primary healing, tanking, off-tanking, damage, or support. Then review what the encounter actually asks the Paladin to survive or provide. A talent that looks attractive in isolation can be less useful when another player already covers the same support, while a less obvious defensive or utility choice may matter throughout the encounter. The planner records the decision but cannot replace that group context.',
          'Share the URL before raid time and ask reviewers to comment on individual ranks rather than replacing the whole build with a vague label. After a beta update, compare the saved setup with the current tree, confirm changed tooltips in game, and copy a new link if prerequisites or rank limits moved. That workflow keeps a raid build tied to evidence and a specific assignment instead of presenting one static page as permanent advice.',
        ],
      },
      {
        kind: 'related',
        title: 'Related Raid and Group Builds',
        items: [
          { title: 'Holy Healing Build 31/20/0', body: 'The healing allocation a raid healer starts from.', href: '/wow-forever-paladin-build' },
          { title: 'Protection Dungeon Tank Build', body: 'The defensive route for group content.', href: '/wow-forever-protection-paladin-dungeon-build' },
          { title: 'All Paladin Builds', body: 'Every leveling, PvE, and PvP route in one place.', href: '/wow-forever-paladin-builds' },
        ],
      },
    ],
    finalCta: { eyebrow: 'Compare Paladin talent builds', title: 'Plan a raid role your group can review.', label: 'Open Talent Calculator' },
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
          { title: 'Protection Paladin Leveling Build', body: 'The solo route that levels into this tank setup.', href: '/wow-forever-protection-paladin-leveling-build' },
          { title: 'Protection Paladin Builds Hub', body: 'Compare tank builds, Protection talents, and planning paths.', href: '/wow-forever-protection-paladin-builds' },
          { title: 'Retribution DPS Build', body: 'Open the 0/20/31 offensive preview.', href: '/wow-forever-retribution-paladin-build' },
          { title: 'Holy Healing Build', body: 'Review the 31/20/0 healing allocation.', href: '/wow-forever-paladin-build' },
          { title: 'Paladin Leveling Build', body: 'Plan a flexible path from level 10 onward.', href: '/wow-forever-paladin-leveling-build' },
        ],
      },
    ],
    finalCta: { eyebrow: 'Ready to adjust the tank build?', title: 'Load the full 20/31/0 setup in the planner.', label: 'Edit This Build' },
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
    finalCta: { eyebrow: 'Ready to plan the order?', title: 'Map out your Protection leveling points.', label: 'Open Talent Calculator' },
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
        kind: 'copy',
        title: 'What the 0/20/31 PvP Preview Represents',
        intro: 'The tree preview is exact; its use as a PvP setup remains a community interpretation.',
        paragraphs: [
          'The highlighted tree comes from the complete 0/20/31 Retribution Judgment build. It commits 31 points to the Retribution core and uses 20 Protection points for a sturdier supporting branch. The calculator can prove which ranks are selected, that the total reaches 51, and that the allocation follows the current prerequisite model. It cannot prove that the same ranks are optimal against every opponent or in every form of PvP.',
          'Use the preview when you want a concrete build to edit rather than an empty tree. Review the Protection support points as carefully as the deep Retribution talents, because PvP value often comes from what happens between damage windows. If current beta testing changes a tooltip, rank limit, or prerequisite, update the allocation before evaluating how it performs in a match.',
        ],
      },
      {
        kind: 'copy',
        title: 'Adapt Retribution to the Team and Objective',
        paragraphs: [
          'A battleground objective, a small-group fight, and a duel do not ask for the same setup. Write down how the Paladin is expected to reach targets, which teammate provides control, and which defensive tools must remain available after committing to burst. Change only the ranks connected to that problem, then compare the new URL with the original 0/20/31 reference so the tradeoff stays visible.',
          'Keep separate links for a general damage route and any matchup-specific experiment. After playing them, report the exact talent and observed behavior rather than only saying that the whole build felt strong or weak. BuildForgeTools treats these pages as community previews until repeatable in-game evidence supports more specific recommendations.',
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
    finalCta: { eyebrow: 'Test a PvP setup', title: 'Adapt the Retribution allocation to your matchups.', label: 'Open Talent Calculator' },
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
    // This page deliberately renders no tree, so it names the allocation to load instead.
    ctaBuildId: 'holy-healing-31-20-0',
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
        kind: 'copy',
        title: 'How the 31/20/0 Reference Changes in PvP',
        intro: 'The published allocation supplies a concrete healing tree, while PvP changes the questions used to evaluate it.',
        paragraphs: [
          'The 31/20/0 Holy healing build is a complete calculator preset with 31 Holy points and 20 Protection points. Its full page lists every selected rank and explains the healing-oriented structure. On this PvP page it serves as a starting reference, not as evidence that a raid-style allocation has already been validated for arenas or battlegrounds. Positioning, interruption pressure, target access, and personal survival can change the value of a rank even when the underlying talent is unchanged.',
          'Open the preset, identify the Holy talents required for the support role, and then review the Protection points for the kind of pressure the healer expects. If a deeper healing choice prevents access to a defensive or utility tool the team needs, save a second version rather than silently changing the published reference. Exact share links make that comparison possible.',
        ],
      },
      {
        kind: 'copy',
        title: 'Holy PvP Build Review Checklist',
        paragraphs: [
          'Decide whether the Paladin is the primary healer, a secondary support, or part of a hybrid plan. Check how many teammates must stay in range, which opponents can interrupt or control the healer, and what defensive answer remains when pressure switches targets. Those questions define the job of the build more clearly than a general promise of stronger healing.',
          'Before sharing a setup, verify the current client tooltip for every talent that affects survivability, casting reliability, or team utility. Keep one link for the general 31/20/0 reference and separate links for experiments. When a test reveals a conflicting rank, prerequisite, or effect, use the Feedback form to report the talent and the evidence so the data can be reviewed without turning one match result into a site-wide claim.',
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
    finalCta: { eyebrow: 'Plan your support setup', title: 'Start from the healing allocation and adapt it.', label: 'Open Talent Calculator' },
  },
]

export function buildLandingPageById(id: BuildLandingPageId) {
  return BUILD_LANDING_PAGES.find((page) => page.id === id) ?? BUILD_LANDING_PAGES[0]
}
