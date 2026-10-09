import dataset from '../rogue-beta-1.60.1.70291.json'
import historicalDataset from '../expansion/rogue-1.60.1.69913.json'
import { createReviewedExpansionClass } from '../expansion/reviewedExpansionClass'
import { expansionProfiles } from '../expansion/profiles'
import type { CurrentClassSnapshot } from '../../lib/currentClassClientReconcile'
export const rogueClass = createReviewedExpansionClass(expansionProfiles.find(profile => profile.id === 'rogue')!, dataset as CurrentClassSnapshot, historicalDataset)
