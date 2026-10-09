import dataset from '../druid-beta-1.60.1.70291.json'
import historicalDataset from '../expansion/druid-1.60.1.69913.json'
import { createReviewedExpansionClass } from '../expansion/reviewedExpansionClass'
import { expansionProfiles } from '../expansion/profiles'
import type { CurrentClassSnapshot } from '../../lib/currentClassClientReconcile'
export const druidClass = createReviewedExpansionClass(expansionProfiles.find(profile => profile.id === 'druid')!, dataset as CurrentClassSnapshot, historicalDataset)
