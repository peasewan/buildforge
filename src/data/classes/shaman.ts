import dataset from '../shaman-beta-1.60.1.70291.json'
import historicalDataset from '../expansion/shaman-1.60.1.69913.json'
import { createReviewedExpansionClass } from '../expansion/reviewedExpansionClass'
import { expansionProfiles } from '../expansion/profiles'
import type { CurrentClassSnapshot } from '../../lib/currentClassClientReconcile'
export const shamanClass = createReviewedExpansionClass(expansionProfiles.find(profile => profile.id === 'shaman')!, dataset as CurrentClassSnapshot, historicalDataset)
