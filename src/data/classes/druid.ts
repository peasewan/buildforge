import dataset from '../expansion/druid-1.60.1.69913.json'
import { createExpansionClass } from '../expansion/createClass'
import { expansionProfiles } from '../expansion/profiles'
export const druidClass = createExpansionClass(expansionProfiles.find((profile) => profile.id === 'druid')!, dataset)
