import type { BuildCardIcon } from '../BuildCard'
import type { ExampleBuildId } from './builds'

export type BuildLandingPageId =
  | 'leveling'
  | 'pvp'
  | 'raid'
  | 'protection-dungeon'
  | 'protection-leveling'
  | 'protection-pvp'
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
    eyebrow: 'Community Build Example',
    heroImage: '/images/hero/paladin-leveling.webp',
    heroPosition: '68% center',
    summary: [
      { label: 'Class', value: 'Paladin' },
      { label: 'Role', value: 'Leveling' },
      { label: 'Recommended For', value: 'New Players' },
      { label: 'Talent Points', value: 'Beta example' },
    ],
    sections: [
      {
        kind: 'steps',
        title: 'Recommended Leveling Path',
        intro: 'Use these milestones as a simple framework while you learn the class. The exact order can change as the WoW Forever talent data is verified.',
        items: [
          { title: 'Level 10–20', body: 'Focus on early survivability and efficient solo play. Reliable opening talents make ordinary fights more forgiving and reduce time spent recovering.' },
          { title: 'Level 20–30', body: 'The live Beta currently reaches Level 30. Compare damage, durability, and support as you spend the next points; our 69913 snapshot still needs later tuning review.' },
          { title: 'Beyond Level 30', body: 'Treat deeper 51-point allocations as long-term historical references. Revisit them only when later levels and updated talent data are available.' },
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
        title: 'How to Use This Beta Example',
        intro: 'Open the planner, choose the branch that matches your current playstyle, and spend points in the order they become available. Keep a share link whenever you reach a useful milestone.',
        items: ['Compare Holy, Protection, and Retribution paths.', 'Watch prerequisites before planning deeper talents.', 'Talent details use the imported 69913 snapshot; later official removals are marked separately.'],
      },
      {
        kind: 'copy',
        title: 'Choose a Leveling Direction',
        intro: 'The class-wide page helps you choose a route before it sends you to a complete specialization example.',
        paragraphs: [
          'The Retribution leveling page includes a community Level 10–30 point-by-point timeline alongside a separate historical 51-point allocation. Use the timeline for an exact level snapshot and the next suggested talent. The later example selects Crusade and is withheld from current presets while the reported 70009 removal is reconciled. Protection now has a separate BuildForgeTools editorial Level 20 and Level 30 route based on selected nodes checked in the 70170 client Trait tables. The older Protection route that spent points in removed Improved Holy Strike remains historical; its 51-point Shield example is not a current-level preset.',
          'There is no dedicated Holy leveling allocation on the site yet. A player who wants to level through healing or group support should start with an empty calculator, choose the talents that solve the current leveling problem, and save milestone links instead of treating the 31/20/0 Holy healing build as a proven leveling route. The related pages below make the available evidence clear before you commit to one specialization.',
        ],
      },
      {
        kind: 'copy',
        title: 'Turn an End-State Build into a Leveling Plan',
        paragraphs: [
          'A historical 51-point build can show a possible long-term direction, while live Level 30 leveling requires a shorter order. Begin with the talents available at the current level and ask what slows progress now: long recovery, fragile pulls, inconsistent damage, or the need to tank group content. Spend toward that immediate need while keeping deeper tree thresholds and prerequisites visible. Do not assume the old final allocation is playable or unchanged after later Beta tuning.',
          'Keep separate share links for a Level 20 starting snapshot, a Level 30 Beta experiment, and future level 40 or 51-point planning references. This makes the progression reviewable and avoids rebuilding the plan from memory. WoW Forever beta data can change ranks, tooltips, prerequisites, or coordinates, so confirm important talents in the current client and revisit the Beta tracker before following an older saved route exactly.',
        ],
      },
      {
        kind: 'related',
        title: 'Related Leveling Builds',
        items: [
          { title: 'Protection Paladin Leveling Build', body: 'Editable 0/11/0 and 0/21/0 Beta routes built from source-checked Protection nodes.', href: '/wow-forever-protection-paladin-leveling-build' },
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
      { label: 'Status', value: 'Community Build' },
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
          { title: 'Protection PvP', body: 'A defensive direction for holding objectives, absorbing pressure, and protecting teammates.', icon: 'shield', href: '/wow-forever-protection-paladin-pvp-build' },
        ],
      },
      {
        kind: 'copy',
        title: 'Choose a PvP Role at Level 30',
        intro: 'The live WoW Forever Beta cap is Level 30. Start with a role and a testable question before changing talent points.',
        paragraphs: [
          'Retribution is the pressure choice: can you reach a target, create a damage window, and still have an answer when the opponent turns on you? Holy is the support choice: can you keep an ally in range and complete useful casts under pressure? Protection is the objective choice: can defensive and utility tools help the group hold a position? Those jobs call for different builds even when each player is a Paladin.',
          'The linked 11-point Level 20 starting snapshots are useful for inspecting early talents, but they are not reviewed 21-point Level 30 PvP recommendations. The 51-point examples are historical long-term references and cannot fit the current cap. Blizzard\'s October 1 notes also changed Protection Redoubt and Holy Shield and Retribution Champion of the Light; those official changes still need reconciliation with the older imported calculator data.',
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
          'The Retribution PvP page displays the historical 0/20/31 Judgment tree, but does not load that Crusade-containing allocation while its 70009 identity remains under review. Holy shows a 31/20/0 healing example and Protection a separate 20/31/0 shield example. Their PvP interpretations remain community planning directions; the site does not have enough verified match data to call any allocation a finished PvP standard.',
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
          { title: 'Protection Paladin PvP Build', body: 'The defensive route for objectives and team utility.', href: '/wow-forever-protection-paladin-pvp-build' },
          { title: 'All Paladin Builds', body: 'Every leveling, PvE, and PvP route in one place.', href: '/wow-forever-paladin-builds' },
        ],
      },
    ],
    finalCta: { eyebrow: 'Create your own PvP build', title: 'Test a PvP setup before the next fight.', label: 'Choose a PvP Route' },
  },
  {
    id: 'raid',
    icon: 'raid',
    slug: 'wow-forever-paladin-raid-build',
    title: 'WoW Forever Paladin Raid Build',
    metaTitle: 'WoW Forever Paladin Raid Build | BuildForgeTools',
    description: 'Explore Holy, Protection, and Retribution raid roles. Compare historical 51-point references separately from the live Level 30 Beta planner.',
    subtitle: 'Explore raid-oriented Paladin talent paths for group content.',
    eyebrow: 'Paladin Raid Build',
    heroImage: '/images/hero/paladin-raid.webp',
    heroPosition: '68% center',
    summary: [
      { label: 'Content', value: 'Raid' },
      { label: 'Roles', value: 'Healing · Tank · Damage' },
      { label: 'Focus', value: 'Group Utility' },
      { label: 'Status', value: 'Community Build' },
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
          { title: 'Plan a long-term 51-point reference', body: 'Use the talent tree to check prerequisites and compare the value of supporting branches.' },
          { title: 'Share the setup', body: 'Copy the build URL and send the exact allocation to raid leaders or teammates for discussion.' },
        ],
      },
      {
        kind: 'copy',
        title: 'Use Published Builds as Role References',
        intro: 'Three historical 51-point examples provide planning references, not current Level 30 raid allocations.',
        paragraphs: [
          'The Holy 31/20/0 page lists every selected rank in a healing-oriented historical reference. Protection has a separate 20/31/0 Shield example for a defensive group role. Retribution retains a 0/20/31 Judgment allocation for comparison, but its Crusade ranks are under review after the reported 70009 change. All three exceed the live Level 30 cap, so their current-plan buttons start a blank calculator rather than loading those 51 points.',
          'These examples are not encounter-tested raid standards or currently playable complete Beta builds. The imported 69913 dataset and later official changes are shown separately. Treat the full allocations as historical references, check the talents relevant to your group in the current client, and plan within the level currently available.',
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
    description: 'Inspect a historical 20/31/0 Protection Paladin dungeon tank reference, then start a new build within the live Level 30 Beta cap.',
    subtitle: 'Inspect a historical 20/31/0 tank reference, then plan for the live Level 30 Beta.',
    eyebrow: 'Protection Dungeon Build',
    heroImage: '/images/hero/protection-dungeon.webp',
    heroPosition: '68% center',
    summary: [
      { label: 'Role', value: 'Dungeon Tank' },
      { label: 'Specialization', value: 'Protection' },
      { label: 'Playstyle', value: 'Defensive' },
      { label: 'Status', value: 'Community Build' },
    ],
    sections: [
      {
        kind: 'cards',
        title: 'Why This Tank Build',
        intro: 'This historical 51-point Protection allocation cannot be played under the live Level 30 Beta cap, but it keeps the three jobs of a tank visible.',
        items: [
          { title: 'Survivability', body: 'Increase defensive capability and create a steadier base for dungeon encounters.', icon: 'shield' },
          { title: 'Threat Generation', body: 'Plan talents that help maintain enemy attention while the party deals damage.', icon: 'sword' },
          { title: 'Group Utility', body: 'Keep Paladin support tools available to protect teammates and respond to difficult pulls.', icon: 'sparkles' },
        ],
      },
      {
        kind: 'talent-preview',
        title: 'Protection Beta Talent Tree',
        intro: 'Inspect the selected Protection branch below. These highlighted nodes come from the historical 20/31/0 shield reference; start a blank calculator route to build for the current cap.',
        buildId: 'protection-shield-20-31-0',
      },
      {
        kind: 'bullets',
        title: 'Using the Dungeon Build',
        intro: 'A dungeon tank setup depends on the content, party, and current talent implementation. Use this 51-point page as a historical role reference.',
        items: ['Review defensive talents before deeper utility choices.', 'Open the full build to inspect Holy support points.', 'Talent effects use Beta client build 1.60.1.69913; report conflicts from newer builds.'],
      },
      {
        kind: 'copy',
        title: 'Protection Paladin Tank Build for Dungeons',
        intro: 'The same tank intent appears in searches as Protection Paladin, Prot Paladin, and Pally tank build; the page keeps those variants attached to one useful setup.',
        paragraphs: [
          'A Protection Paladin dungeon build has to do more than survive. It needs a repeatable way to open a pull, hold enemy attention while the party commits damage, and keep an emergency response available when an extra pack joins. The historical 20/31/0 reference illustrates those questions, but its 51 points cannot fit a live Level 30 character.',
          'Dungeon composition and current Beta behavior still decide whether an individual rank is useful. Start a blank current-cap route rather than copying this historical tree. Confirm threat, mitigation, and utility effects in the current client before presenting any experiment as the standard Protection setup for a particular dungeon.',
        ],
      },
      {
        kind: 'related',
        title: 'More Paladin Builds',
        items: [
          { title: 'Protection Paladin Leveling Build', body: 'Current-cap 0/11/0 and 0/21/0 editorial routes, separate from this 51-point tank example.', href: '/wow-forever-protection-paladin-leveling-build' },
          { title: 'Protection Paladin Builds Hub', body: 'Compare tank builds, Protection talents, and planning paths.', href: '/wow-forever-protection-paladin-builds' },
          { title: 'Protection Paladin PvP Build', body: 'Adapt the defensive core for objectives and player combat.', href: '/wow-forever-protection-paladin-pvp-build' },
          { title: 'Retribution DPS Build', body: 'Open the 0/20/31 offensive preview.', href: '/wow-forever-retribution-paladin-build' },
          { title: 'Holy Healing Build', body: 'Review the 31/20/0 healing allocation.', href: '/wow-forever-paladin-build' },
          { title: 'Paladin Leveling Build', body: 'Plan a flexible path from level 10 onward.', href: '/wow-forever-paladin-leveling-build' },
        ],
      },
    ],
    finalCta: { eyebrow: 'Ready to plan a current tank build?', title: 'Start a new Level 30 Protection route.', label: 'Open Blank Calculator' },
  },
  {
    id: 'protection-leveling',
    icon: 'protection',
    slug: 'wow-forever-protection-paladin-leveling-build',
    title: 'WoW Forever Protection Paladin Leveling Build',
    metaTitle: 'WoW Forever Protection Paladin Leveling Build | BuildForgeTools',
    description: 'Plan a WoW Forever Protection Paladin leveling build with source-checked 11-point Level 20 and 21-point Level 30 Beta routes, then edit either setup.',
    subtitle: 'Follow an editable Protection route through the current Level 30 Beta cap.',
    eyebrow: 'Protection Beta Leveling Build',
    heroImage: '/images/hero/paladin-leveling.webp',
    heroPosition: '68% center',
    summary: [
      { label: 'Role', value: 'Leveling / Tank' },
      { label: 'Specialization', value: 'Protection' },
      { label: 'Playstyle', value: 'Defensive' },
      { label: 'Status', value: 'Editorial route · node checked' },
    ],
    sections: [
      {
        kind: 'cards',
        title: 'What This Protection Route Tests',
        intro: 'The new 0/11/0 and 0/21/0 allocations use Protection nodes checked in the 70170 Beta Trait tables. The order is editorial and is not an in-game performance ranking.',
        items: [
          { title: 'Early Defense', body: 'Toughness and Redoubt fill the first ten points. Blizzard changed Redoubt to 4/8/12/16/20% on October 1, so the older 69913 tooltip may differ.', icon: 'shield' },
          { title: 'Level 20 Milestone', body: 'Precision receives the eleventh point. The 0/11/0 route can be loaded and edited at the standard Level 20 budget.', icon: 'route' },
          { title: 'Level 30 Extension', body: 'Complete Precision, Anticipation, and Improved Righteous Fury for an editorial 0/21/0 tank-oriented path.', icon: 'sparkles' },
        ],
      },
      {
        kind: 'copy',
        title: 'Client Facts and Editorial Choices',
        paragraphs: [
          'The selected nodes have the same IDs, rank caps, positions, and absence of required predecessor links in Paladin TraitTree 1100 from client build 1.60.1.70170. ForeverDiff reports that build 1.60.1.70205 has identical client table records. Those checks cover this five-node route only; the site-wide calculator still imports the 52-node 69913 snapshot and has not been promoted to a newer complete dataset.',
          'The 11-point and 21-point allocations assume ordinary one-point-per-level progression from Level 10. Legacy: Talented can change when a player receives points, so use your own available budget when loading a link. This route is a planning example, not Blizzard advice or proof of tanking speed, survival, or dungeon suitability.',
        ],
      },
      {
        kind: 'steps',
        title: 'Level 10–30 Protection Point Order',
        intro: 'Follow the source-checked nodes in sequence, then adjust the route to your game and group. The allocation is editable at both milestones.',
        items: [
          { title: 'Levels 10–19', body: 'Spend 5/5 Toughness and 5/5 Redoubt. The selected positions are first-row Protection nodes in the 70170 Trait tables.' },
          { title: 'Level 20', body: 'Add Precision 1/3 to reach 0/11/0. This is a standard-progression milestone without Legacy: Talented.' },
          { title: 'Levels 21–30', body: 'Finish Precision 3/3, add Anticipation 5/5, then Improved Righteous Fury 3/3 to reach 0/21/0.' },
        ],
      },
      {
        kind: 'related',
        title: 'Related Protection Builds',
        items: [
          { title: 'Protection Dungeon Tank Build', body: 'A separate historical 51-point group-content example; compare it with the current-cap route here.', href: '/wow-forever-protection-paladin-dungeon-build' },
          { title: 'Protection Paladin Builds Hub', body: 'Compare every Protection route and talent page.', href: '/wow-forever-protection-paladin-builds' },
          { title: 'Paladin Leveling Build', body: 'The class-wide leveling path when you have not picked a specialization.', href: '/wow-forever-paladin-leveling-build' },
        ],
      },
    ],
    finalCta: { eyebrow: 'Ready to adjust?', title: 'Edit the reviewed-node Protection route in the calculator.', label: 'Load Level 20 Route' },
  },
  {
    id: 'protection-pvp',
    icon: 'protection',
    slug: 'wow-forever-protection-paladin-pvp-build',
    title: 'WoW Forever Protection Paladin PvP Build',
    metaTitle: 'WoW Forever Protection Paladin PvP Build | BuildForgeTools',
    description: 'Plan a defensive WoW Forever Protection Paladin PvP build for objectives, survivability, and team utility, then edit the 20/31/0 reference setup.',
    subtitle: 'A defensive Protection Paladin setup for objectives and team utility in WoW Forever PvP.',
    eyebrow: 'Protection PvP Build',
    heroImage: '/images/hero/paladin-pvp.webp',
    heroPosition: '68% center',
    summary: [
      { label: 'Playstyle', value: 'PvP' },
      { label: 'Specialization', value: 'Protection' },
      { label: 'Strengths', value: 'Survival · Control · Utility' },
      { label: 'Status', value: 'Community Build' },
    ],
    sections: [
      {
        kind: 'cards',
        title: 'Protection PvP Priorities',
        intro: 'Protection approaches player combat through durability and control rather than the burst pressure of Retribution or the healing focus of Holy.',
        items: [
          { title: 'Hold Objectives', body: 'Use survivability and disruption to remain useful when opponents focus the Paladin.', icon: 'shield' },
          { title: 'Control Pressure', body: 'Plan interrupts, stuns, and positioning tools around the moments an opponent commits.', icon: 'route' },
          { title: 'Protect Teammates', body: 'Keep Paladin utility available for allies instead of spending every choice on personal defense.', icon: 'sparkles' },
        ],
      },
      {
        kind: 'talent-preview',
        title: 'Protection Beta Talent Tree',
        intro: 'The 20/31/0 shield allocation below is a historical 51-point defensive reference. It exceeds the live Level 30 cap; start a blank current-cap route for PvP.',
        buildId: 'protection-shield-20-31-0',
      },
      {
        kind: 'copy',
        title: 'What the 20/31/0 PvP Reference Represents',
        intro: 'The selected ranks are exact; their competitive interpretation remains an editable community hypothesis.',
        paragraphs: [
          'The historical reference commits 31 points to Protection and uses 20 Holy points as support. BuildForgeTools can show its 69913-era selected ranks and total point count, but the 51-point allocation exceeds the live Level 30 cap and later official tuning remains under review. It is a record of defensive goals, not a reproducible current PvP starter.',
          'The allocation has not been proven as an optimal arena or battleground build. A defensive tree can still fail if it lacks the control, mobility, or team utility required by a specific objective. Use the preview to identify the fixed Protection core, then save separate links for each experiment instead of silently changing the reference.',
        ],
      },
      {
        kind: 'copy',
        title: 'Adapt Protection to the PvP Objective',
        paragraphs: [
          'Flag defense, node control, small-group fights, and open battleground pressure ask different things from a Protection Paladin. Decide whether the build must hold ground, peel for a teammate, interrupt a healer, or simply survive focused damage. Review the Holy support points after choosing that job, because utility that matters in one role may do little in another.',
          'Start a new share link for a route that fits the live cap and record which talent changed the outcome in actual play. Match evidence should remain separate from client facts: the older data records a tooltip or prerequisite at import time, while repeated play is needed before calling a rank competitively strong. Report conflicts through the feedback form so the tree and the editorial recommendation can be reviewed independently.',
        ],
      },
      {
        kind: 'related',
        title: 'Related Protection and PvP Builds',
        items: [
          { title: 'Paladin PvP Build', body: 'Compare Protection with the Holy and Retribution PvP roles.', href: '/wow-forever-paladin-pvp-build' },
          { title: 'Protection Paladin Builds Hub', body: 'Browse dungeon, leveling, talent, and PvP routes.', href: '/wow-forever-protection-paladin-builds' },
          { title: 'Protection Dungeon Tank Build', body: 'Use the same defensive core for group PvE.', href: '/wow-forever-protection-paladin-dungeon-build' },
          { title: 'Retribution Paladin PvP Build', body: 'Compare the offensive PvP alternative.', href: '/wow-forever-retribution-paladin-pvp-build' },
          { title: 'Holy Paladin PvP Build', body: 'Compare the support and healing alternative.', href: '/wow-forever-holy-paladin-pvp-build' },
        ],
      },
    ],
    finalCta: { eyebrow: 'Test a defensive PvP setup', title: 'Start a Level 30 route for your objective.', label: 'Open Blank Calculator' },
  },
  {
    id: 'retribution-pvp',
    icon: 'retribution',
    slug: 'wow-forever-retribution-paladin-pvp-build',
    title: 'WoW Forever Retribution Paladin PvP Build',
    metaTitle: 'WoW Forever Retribution Paladin PvP Build | BuildForgeTools',
    description: 'Plan a WoW Forever Retribution Paladin PvP build around burst windows and utility. Compare a historical 0/20/31 allocation, then start a new route.',
    subtitle: 'A burst-oriented Retribution setup for WoW Forever PvP combat.',
    eyebrow: 'Retribution PvP Build',
    heroImage: '/images/hero/paladin-pvp.webp',
    heroPosition: '68% center',
    summary: [
      { label: 'Playstyle', value: 'PvP' },
      { label: 'Specialization', value: 'Retribution' },
      { label: 'Strengths', value: 'Burst · Utility · Pressure' },
      { label: 'Status', value: 'Historical 69913 Preview' },
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
        title: 'Retribution Beta Talent Tree',
        intro: 'The 0/20/31 tree below is a historical 69913 preview. Its Crusade ranks are under review against a reported 70009 removal, so start a new calculator route instead of loading this exact allocation.',
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
        intro: 'The tree preview records 69913; its current availability and PvP value remain unverified.',
        paragraphs: [
          'The highlighted tree records the complete 69913-era 0/20/31 Retribution Judgment allocation. It committed 31 points to Retribution and used 20 Protection points for a sturdier secondary branch. The calculator can verify those historical ranks against the imported tree, but the Crusade identity conflict means it cannot certify the same 51 points as current. Nor does the snapshot prove PvP effectiveness against any opponent.',
          'Use this preview to inspect the old tradeoffs, then start a blank planner for present Beta testing. Review Protection support points as carefully as deep Retribution talents, and check each selected rank against the latest client before sharing a new allocation.',
        ],
      },
      {
        kind: 'copy',
        title: 'Adapt Retribution to the Team and Objective',
        paragraphs: [
          'A battleground objective, a small-group fight, and a duel do not ask for the same setup. Write down how the Paladin is expected to reach targets, which teammate provides control, and which defensive tools must remain available after committing to burst. Build a new legal route around those needs; the older 0/20/31 record remains available for historical comparison.',
          'Keep separate links for a general damage route and any matchup-specific experiment. After playing them, report the exact talent and observed behavior rather than only saying that the whole build felt strong or weak. BuildForgeTools treats these pages as community build examples until repeatable in-game evidence supports more specific recommendations.',
        ],
      },
      {
        kind: 'related',
        title: 'Related PvP and Retribution Builds',
        items: [
          { title: 'Paladin PvP Build', body: 'The class-wide PvP overview covering every specialization.', href: '/wow-forever-paladin-pvp-build' },
          { title: 'Protection Paladin PvP Build', body: 'The defensive alternative for objectives and team utility.', href: '/wow-forever-protection-paladin-pvp-build' },
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
    description: 'Plan Holy Paladin PvP for the live Level 30 Beta. Inspect the historical 31/20/0 healing reference, then start a blank current-cap route.',
    subtitle: 'A support-oriented Holy Paladin setup for WoW Forever PvP.',
    eyebrow: 'Holy PvP Build',
    heroImage: '/images/hero/hero-paladin.webp',
    heroPosition: '68% center',
    // This page renders no tree; the historical allocation identifies its reference page, not a loadable current preset.
    ctaBuildId: 'holy-healing-31-20-0',
    summary: [
      { label: 'Playstyle', value: 'PvP' },
      { label: 'Specialization', value: 'Holy' },
      { label: 'Focus', value: 'Support & Survivability' },
      { label: 'Status', value: 'Community Build' },
    ],
    sections: [
      {
        kind: 'cards',
        title: 'Support Focus',
        intro: 'A Holy Paladin in PvP is usually keeping someone else alive under pressure, so the priorities differ from a raid healing setup even though the tree is similar.',
        items: [
          { title: 'Keeping Teammates Up', body: 'Healing throughput matters less than reaching the right target through crowd control and pressure.', icon: 'heart' },
          { title: 'Staying Alive Yourself', body: 'A support build that dies first helps nobody. The historical Protection support points show one future direction, not a current-cap allocation.', icon: 'shield' },
          { title: 'Positioning', body: 'Where you stand decides whether you can heal through an enemy push or get separated from your group.', icon: 'route' },
        ],
      },
      {
        kind: 'bullets',
        title: 'Planning a Holy PvP Setup',
        intro: 'This page describes a direction rather than a verified PvP allocation. The 31/20/0 healing build is a historical 51-point reference and cannot fit the current Level 30 cap.',
        items: [
          'Treat the 31/20/0 healing allocation as a historical reference, not a current PvP starter.',
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
          'The 31/20/0 Holy healing build records a historical 51-point allocation with 31 Holy and 20 Protection points. Its full page lists every selected rank and explains the healing-oriented structure, but those points exceed the live Level 30 cap and its 69913 tree predates later official tuning. Positioning, interruption pressure, target access, and personal survival can change the value of a rank even when the older talent name is unchanged.',
          'Start a blank current-cap planner route, identify the Holy talents required for the support role, and then review which early Protection tools are actually available. Save a separate share link for each experiment instead of silently treating the published 51-point reference as a playable preset.',
        ],
      },
      {
        kind: 'copy',
        title: 'Holy PvP Build Review Checklist',
        paragraphs: [
          'Decide whether the Paladin is the primary healer, a secondary support, or part of a hybrid plan. Check how many teammates must stay in range, which opponents can interrupt or control the healer, and what defensive answer remains when pressure switches targets. Those questions define the job of the build more clearly than a general promise of stronger healing.',
          'Before sharing a setup, verify the current client tooltip for every talent that affects survivability, casting reliability, or team utility. Keep the 31/20/0 page as a historical reference and create separate links for current experiments. When a test reveals a conflicting rank, prerequisite, or effect, use the Feedback form to report the talent and the evidence so the data can be reviewed without turning one match result into a site-wide claim.',
        ],
      },
      {
        kind: 'related',
        title: 'Related Holy and PvP Builds',
        items: [
          { title: 'Holy Healing Build 31/20/0', body: 'The full healing allocation this setup starts from.', href: '/wow-forever-paladin-build' },
          { title: 'Paladin PvP Build', body: 'The class-wide PvP overview covering every specialization.', href: '/wow-forever-paladin-pvp-build' },
          { title: 'Protection Paladin PvP Build', body: 'The defensive alternative for objectives and team utility.', href: '/wow-forever-protection-paladin-pvp-build' },
          { title: 'Retribution Paladin PvP Build', body: 'The damage-oriented alternative for PvP.', href: '/wow-forever-retribution-paladin-pvp-build' },
        ],
      },
    ],
    finalCta: { eyebrow: 'Plan your support setup', title: 'Start a new Level 30 Holy PvP route.', label: 'Open Talent Calculator' },
  },
]

export function buildLandingPageById(id: BuildLandingPageId) {
  return BUILD_LANDING_PAGES.find((page) => page.id === id) ?? BUILD_LANDING_PAGES[0]
}
