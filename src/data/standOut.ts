import roster from './standOutRoster.json'

export const stands = roster
export type Stand = typeof stands[number]
export type StoryStage = 'story' | 'override' | 'complete'

const removed = new Set(['tower-of-gray', 'cat-size', 'john-rod', 'west-end-girl'])
const restricted = new Set(['super-fly', 'rolling-stones', 'cinderella', 'burning-down-the-house', 'catch-the-rainbow', 'strength', 'lyin-eyes'])
const evolutions: Record<string, string> = {
  'the-world-alternative-universe': 'Use an Opal Roka while The World is equipped. The attempt can consume your Stand.',
  'star-platinum-the-world': 'Use an Opal Roka while Star Platinum is equipped. The attempt can consume your Stand.',
  'hermit-purple': 'Start Billy’s task as a Standless Jonathan Hamon user. Defeat DIO and use Life-Giving Overdrive on plants 15 times.',
  jojosapiens: 'Complete Major Tom’s Space Oddity quest after unlocking 45 Stands, or qualify through 7,500 accessory sales in the Catalog.',
}
const alternate: Record<string, string> = {
  'king-crimson': 'For the full moveset, the Train Raid on Hard also drops a chip. Its shop lists the full chip for 200 Tokens.',
  'highway-star': 'The Highway Star Raid on Hard also drops its chip. The raid shop lists it for 200 Tokens.',
  'star-platinum': 'The Jotaro boss also drops a Stand Chip.',
  'the-world': 'The DIO boss also drops a Stand Chip.',
}

export function acquisition(stand: Stand, stage: StoryStage) {
  if (removed.has(stand.id)) return { label: 'Removed from the arrow pool', detail: 'This Stand was taken out for rework. Save your arrows for another target.' }
  if (evolutions[stand.id]) return { label: stand.id === 'jojosapiens' || stand.id === 'hermit-purple' ? 'Quest route' : 'Evolution route', detail: evolutions[stand.id] }
  if (stage === 'story' && restricted.has(stand.id)) return { label: 'Blocked by the story pool', detail: 'Finish the storyline or enable the story-Stand setting to include this target in eligible rolls.' }
  const arrows = ['Mysterious']
  if (stand.tier !== 'Rare') arrows.push('Lucky')
  if (['Legendary','Mythical','Pinnacle'].includes(stand.tier)) arrows.push('Bizarre')
  const focus = stand.part === 'Part 9' ? ' A crafted Mysterious Rock specifically awakens Part 9 Stands.' : ['Part 3','Part 5'].includes(stand.part) ? ' The '+stand.part+' focus arrow narrows the pool.' : ''
  return { label: 'Eligible for an arrow roll', detail: 'Eligible arrow types: '+arrows.join(', ')+'.'+focus+(alternate[stand.id] ? ' '+alternate[stand.id] : '') }
}
