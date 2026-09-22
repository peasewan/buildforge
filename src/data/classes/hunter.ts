import dataset from '../expansion/hunter-1.60.1.69913.json'
import { createExpansionClass } from '../expansion/createClass'
import { expansionProfiles } from '../expansion/profiles'
export const hunterClass = createExpansionClass(expansionProfiles.find((profile) => profile.id === 'hunter')!, dataset)
