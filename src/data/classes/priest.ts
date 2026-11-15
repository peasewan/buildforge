import dataset from '../priest-beta-1.60.1.70291.json'
import historicalDataset from '../expansion/priest-1.60.1.69913.json'
import { createReviewedExpansionClass } from '../expansion/reviewedExpansionClass'
import { expansionProfiles } from '../expansion/profiles'
import type { CurrentClassSnapshot } from '../../lib/currentClassClientReconcile'
export const priestClass = createReviewedExpansionClass(expansionProfiles.find(profile => profile.id === 'priest')!, dataset as CurrentClassSnapshot, historicalDataset)

export const priestLevelingComparisonSlug = 'wow-forever-shadow-vs-discipline-priest-leveling'
const levelingComparison = priestClass.pages.find(page => page.slug === priestLevelingComparisonSlug)!
levelingComparison.description = 'For mostly solo questing, level 40 is a good time to try Shadowform. Mind Flay opens as early as 20. Discipline suits wand-heavy pulls and regular dungeon healing.'
levelingComparison.updatedAt = '2026-11-15'
