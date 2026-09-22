import dataset from '../expansion/priest-1.60.1.69913.json'
import { createExpansionClass } from '../expansion/createClass'
import { expansionProfiles } from '../expansion/profiles'
export const priestClass = createExpansionClass(expansionProfiles.find((profile) => profile.id === 'priest')!, dataset)
