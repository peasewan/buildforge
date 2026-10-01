export const GLIMMERWICK_LAUNCH_PAGES = [
  {
    id: 'first-days',
    path: '/songs-of-glimmerwick-first-days',
    title: 'Songs of Glimmerwick First Days Checklist | BuildForgeTools',
    description: 'Track the five Back to School supplies and your first campus steps in Songs of Glimmerwick. A source-linked, editable opening-day checklist.',
    surface: 'glimmerwick-first-days',
  },
  {
    id: 'spellcasting',
    path: '/songs-of-glimmerwick-spellcasting',
    title: 'Songs of Glimmerwick Spellcasting & Song of Tilling | BuildForgeTools',
    description: 'Learn how Song of Tilling, the songbook, and practice stars relate to casting in Songs of Glimmerwick, using developer-confirmed sources.',
    surface: 'glimmerwick-spellcasting',
  },
  {
    id: 'garden-well',
    path: '/songs-of-glimmerwick-garden-well',
    title: 'Songs of Glimmerwick Garden Well Sell Planner | BuildForgeTools',
    description: 'Plan what to keep and sell through the Songs of Glimmerwick garden well. Enter your observed inventory prices and estimate proceeds locally.',
    surface: 'glimmerwick-well',
  },
] as const

export type GlimmerwickLaunchPageId = typeof GLIMMERWICK_LAUNCH_PAGES[number]['id']
