import dataset from '../priest-beta-1.60.1.70291.json'
import historicalDataset from '../expansion/priest-1.60.1.69913.json'
import { createReviewedExpansionClass } from '../expansion/reviewedExpansionClass'
import { expansionProfiles } from '../expansion/profiles'
import type { CurrentClassSnapshot } from '../../lib/currentClassClientReconcile'
export const priestClass = createReviewedExpansionClass(expansionProfiles.find(profile => profile.id === 'priest')!, dataset as CurrentClassSnapshot, historicalDataset)
