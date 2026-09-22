import dataset from '../expansion/shaman-1.60.1.69913.json'
import { createExpansionClass } from '../expansion/createClass'
import { expansionProfiles } from '../expansion/profiles'
export const shamanClass = createExpansionClass(expansionProfiles.find((profile) => profile.id === 'shaman')!, dataset)
