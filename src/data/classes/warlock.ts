import dataset from '../expansion/warlock-1.60.1.69913.json'
import { createExpansionClass } from '../expansion/createClass'
import { expansionProfiles } from '../expansion/profiles'
export const warlockClass = createExpansionClass(expansionProfiles.find((profile) => profile.id === 'warlock')!, dataset)
