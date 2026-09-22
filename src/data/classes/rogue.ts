import dataset from '../expansion/rogue-1.60.1.69913.json'
import { createExpansionClass } from '../expansion/createClass'
import { expansionProfiles } from '../expansion/profiles'
export const rogueClass = createExpansionClass(expansionProfiles.find((profile) => profile.id === 'rogue')!, dataset)
