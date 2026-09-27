export type VerificationStatus = 'official' | 'client_datamined' | 'client_verified' | 'community_verified' | 'derived_assumption'
export interface SourcedFact<T> { value: T | null; verificationStatus: VerificationStatus | null; sourceIds: string[]; note?: string }
export interface EmbervilleSource { id: string; label: string; url: string; kind: 'official' | 'creator_capture' | 'community_research' | 'client_export'; locator?: string }
export interface EmbervilleClass { id: string; name: SourcedFact<string>; description: SourcedFact<string>; gameId: SourcedFact<string> }
export type EmbervilleWeapon = EmbervilleClass
export interface EmbervilleSkill { id: string; classId: string; name: SourcedFact<string>; type: SourcedFact<'active' | 'passive'>; effect: SourcedFact<string>; inheritance: SourcedFact<boolean> }
export interface EmbervilleMechanic { id: string; description: SourcedFact<string> }
export interface EmbervilleCompatibility { baseClassId: string; skillId: string; allowed: SourcedFact<boolean> }
export interface EmbervilleDataset {
  schemaVersion: 1; dataVersion: string; phase: 'pre_early_access'; reviewedAt: string;
  sources: EmbervilleSource[]; mechanics: EmbervilleMechanic[]; classes: EmbervilleClass[]; weapons: EmbervilleWeapon[]; skills: EmbervilleSkill[];
  rules: { activeSlots: SourcedFact<number>; passiveSlots: SourcedFact<number>; unlockLevel: SourcedFact<number>; compatibility: EmbervilleCompatibility[] }
}
export interface EmbervilleDraft { baseClassId: string | null; weaponId: string | null; learnedClassIds: string[]; activeSkillIds: string[]; passiveSkillIds: string[] }
export interface EmbervilleFieldChange { field: string; before: unknown; after: unknown }
export interface EmbervilleRecordChange<T> { id: string; before: T; after: T; changedFields: string[] }
export interface EmbervilleDiffSection<T> { added: T[]; removed: T[]; changed: EmbervilleRecordChange<T>[] }
export interface EmbervilleDatasetDiff {
  beforeVersion: string; afterVersion: string; metadata: EmbervilleFieldChange[];
  sources: EmbervilleDiffSection<EmbervilleSource>; mechanics: EmbervilleDiffSection<EmbervilleMechanic>;
  classes: EmbervilleDiffSection<EmbervilleClass>; weapons: EmbervilleDiffSection<EmbervilleWeapon>; skills: EmbervilleDiffSection<EmbervilleSkill>;
  rules: { facts: EmbervilleFieldChange[]; compatibility: EmbervilleDiffSection<EmbervilleCompatibility> }
}

const verificationStatuses = new Set<VerificationStatus>(['official', 'client_datamined', 'client_verified', 'community_verified', 'derived_assumption'])

type JsonObject = Record<string, unknown>
const fail = (path: string, message: string): never => { throw new Error(`${path}: ${message}`) }
const objectAt = (input: unknown, path: string, fields: string[]): JsonObject => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fail(path, 'expected an object')
  const result = input as JsonObject
  for (const key of Object.keys(result)) if (!fields.includes(key)) fail(`${path}.${key}`, 'unknown field')
  return result
}
const stringAt = (input: unknown, path: string): string => {
  if (typeof input !== 'string' || !input.trim() || input !== input.trim()) return fail(path, 'expected a non-empty trimmed string')
  return input
}
const arrayAt = (input: unknown, path: string): unknown[] => Array.isArray(input) ? input : fail(path, 'expected an array')
const unique = <T>(records: T[], key: (record: T) => string, path: string) => {
  const ids = new Set<string>()
  for (const record of records) {
    const id = key(record)
    if (ids.has(id)) fail(path, `duplicate identity ${id}`)
    ids.add(id)
  }
  return records
}

/** Known values require field-specific provenance. Null values never acquire defaults or verification. */
export function parseEmbervilleDataset(input: unknown): EmbervilleDataset {
  const data = objectAt(input, 'dataset', ['schemaVersion', 'dataVersion', 'phase', 'reviewedAt', 'sources', 'mechanics', 'classes', 'weapons', 'skills', 'rules'])
  if (data.schemaVersion !== 1) fail('schemaVersion', 'expected version 1')
  if (data.phase !== 'pre_early_access') fail('phase', 'expected pre_early_access')
  const reviewedAt = stringAt(data.reviewedAt, 'reviewedAt')
  const reviewedDate = new Date(`${reviewedAt}T00:00:00.000Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedAt) || !Number.isFinite(reviewedDate.getTime()) || reviewedDate.toISOString().slice(0, 10) !== reviewedAt) fail('reviewedAt', 'expected a real ISO date (YYYY-MM-DD)')
  const sources = unique(arrayAt(data.sources, 'sources').map((inputSource, index): EmbervilleSource => {
    const path = `sources[${index}]`
    const source = objectAt(inputSource, path, ['id', 'label', 'url', 'kind', 'locator'])
    const url = stringAt(source.url, `${path}.url`)
    try {
      const parsedUrl = new URL(url)
      if (!['http:', 'https:'].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password) fail(`${path}.url`, 'expected a public HTTP(S) source URL')
    } catch { fail(`${path}.url`, 'expected a public HTTP(S) source URL') }
    if (!['official', 'creator_capture', 'community_research', 'client_export'].includes(source.kind as string)) fail(`${path}.kind`, 'expected official, creator_capture, community_research or client_export')
    return {
      id: stringAt(source.id, `${path}.id`), label: stringAt(source.label, `${path}.label`), url,
      kind: source.kind as EmbervilleSource['kind'],
      ...(source.locator === undefined ? {} : { locator: stringAt(source.locator, `${path}.locator`) }),
    }
  }), ({ id }) => id, 'sources')
  const sourceMap = new Map(sources.map(source => [source.id, source]))
  const parseFact = <T>(inputFact: unknown, path: string, accepts: (value: unknown) => value is T, expected: string): SourcedFact<T> => {
    const fact = objectAt(inputFact, path, ['value', 'verificationStatus', 'sourceIds', 'note'])
    const sourceIds = unique(arrayAt(fact.sourceIds, `${path}.sourceIds`).map((id, i) => stringAt(id, `${path}.sourceIds[${i}]`)), id => id, `${path}.sourceIds`)
    for (const id of sourceIds) if (!sourceMap.has(id)) fail(path, `source ${id} does not exist`)
    if (fact.value === null) {
      if (fact.verificationStatus !== null || sourceIds.length) fail(path, 'unknown values must have null verificationStatus and no sourceIds')
    } else {
      if (!accepts(fact.value)) fail(`${path}.value`, `expected ${expected} or null`)
      if (!verificationStatuses.has(fact.verificationStatus as VerificationStatus)) fail(`${path}.verificationStatus`, 'known values require a supported verification status')
      if (!sourceIds.length) fail(path, 'known values require at least one source')
      if (fact.verificationStatus === 'official' && !sourceIds.some(id => sourceMap.get(id)?.kind === 'official')) fail(path, 'official verification requires an official source')
      if ((fact.verificationStatus === 'client_datamined' || fact.verificationStatus === 'client_verified') && !sourceIds.some(id => sourceMap.get(id)?.kind === 'client_export')) fail(path, 'client verification requires a client export source')
    }
    return {
      value: fact.value as T | null, verificationStatus: fact.verificationStatus as VerificationStatus | null, sourceIds,
      ...(fact.note === undefined ? {} : { note: stringAt(fact.note, `${path}.note`) }),
    }
  }
  const isString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0 && value === value.trim()
  const text = (value: unknown, path: string) => parseFact(value, path, isString, 'a non-empty trimmed string')
  const bool = (value: unknown, path: string) => parseFact(value, path, (item): item is boolean => typeof item === 'boolean', 'a boolean')
  const count = (value: unknown, path: string) => parseFact(value, path, (item): item is number => typeof item === 'number' && Number.isSafeInteger(item) && item >= 0, 'a non-negative safe integer')
  const catalog = (inputRecords: unknown, path: string): EmbervilleClass[] => unique(arrayAt(inputRecords, path).map((inputRecord, index) => {
    const location = `${path}[${index}]`
    const record = objectAt(inputRecord, location, ['id', 'name', 'description', 'gameId'])
    return { id: stringAt(record.id, `${location}.id`), name: text(record.name, `${location}.name`), description: text(record.description, `${location}.description`), gameId: text(record.gameId, `${location}.gameId`) }
  }), ({ id }) => id, path)
  const classes = catalog(data.classes, 'classes')
  const weapons = catalog(data.weapons, 'weapons')
  const classIds = new Set(classes.map(({ id }) => id))
  const mechanics = unique(arrayAt(data.mechanics, 'mechanics').map((inputMechanic, index) => {
    const path = `mechanics[${index}]`
    const mechanic = objectAt(inputMechanic, path, ['id', 'description'])
    return { id: stringAt(mechanic.id, `${path}.id`), description: text(mechanic.description, `${path}.description`) }
  }), ({ id }) => id, 'mechanics')
  const skills = unique(arrayAt(data.skills, 'skills').map((inputSkill, index): EmbervilleSkill => {
    const path = `skills[${index}]`
    const skill = objectAt(inputSkill, path, ['id', 'classId', 'name', 'type', 'effect', 'inheritance'])
    const classId = stringAt(skill.classId, `${path}.classId`)
    if (!classIds.has(classId)) fail(path, `class ${classId} does not exist`)
    return {
      id: stringAt(skill.id, `${path}.id`), classId,
      name: text(skill.name, `${path}.name`),
      type: parseFact(skill.type, `${path}.type`, (value): value is 'active' | 'passive' => value === 'active' || value === 'passive', 'active or passive'),
      effect: text(skill.effect, `${path}.effect`), inheritance: bool(skill.inheritance, `${path}.inheritance`),
    }
  }), ({ id }) => id, 'skills')
  const skillIds = new Set(skills.map(({ id }) => id))
  const ruleData = objectAt(data.rules, 'rules', ['activeSlots', 'passiveSlots', 'unlockLevel', 'compatibility'])
  const compatibility = unique(arrayAt(ruleData.compatibility, 'rules.compatibility').map((inputRule, index) => {
    const path = `rules.compatibility[${index}]`
    const rule = objectAt(inputRule, path, ['baseClassId', 'skillId', 'allowed'])
    const baseClassId = stringAt(rule.baseClassId, `${path}.baseClassId`)
    const skillId = stringAt(rule.skillId, `${path}.skillId`)
    if (!classIds.has(baseClassId)) fail(path, `base class ${baseClassId} does not exist`)
    if (!skillIds.has(skillId)) fail(path, `skill ${skillId} does not exist`)
    return { baseClassId, skillId, allowed: bool(rule.allowed, `${path}.allowed`) }
  }), rule => `${rule.baseClassId}:${rule.skillId}`, 'rules.compatibility')
  return {
    schemaVersion: 1, dataVersion: stringAt(data.dataVersion, 'dataVersion'), phase: 'pre_early_access', reviewedAt,
    sources, mechanics, classes, weapons, skills,
    rules: { activeSlots: count(ruleData.activeSlots, 'rules.activeSlots'), passiveSlots: count(ruleData.passiveSlots, 'rules.passiveSlots'), unlockLevel: count(ruleData.unlockLevel, 'rules.unlockLevel'), compatibility },
  }
}

export function queryEmbervilleDataset(data: EmbervilleDataset, search: string): { classes: EmbervilleClass[]; weapons: EmbervilleWeapon[]; skills: EmbervilleSkill[] } {
  const term = search.trim().toLocaleLowerCase('en-US')
  const matches = (values: (string | null)[]) => !term || values.some(value => value?.toLocaleLowerCase('en-US').includes(term))
  const catalogMatch = (record: EmbervilleClass) => matches([record.id, record.name.value, record.description.value, record.gameId.value])
  return {
    classes: data.classes.filter(catalogMatch), weapons: data.weapons.filter(catalogMatch),
    skills: data.skills.filter(record => matches([record.id, record.classId, record.name.value, record.type.value, record.effect.value])),
  }
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`
  return JSON.stringify(value) ?? 'undefined'
}

export function diffEmbervilleDatasets(before: EmbervilleDataset, after: EmbervilleDataset): EmbervilleDatasetDiff {
  const changes = (oldRecord: object, newRecord: object): string[] => {
    const oldFields = oldRecord as Record<string, unknown>
    const newFields = newRecord as Record<string, unknown>
    return [...new Set([...Object.keys(oldFields), ...Object.keys(newFields)])].filter(field => canonical(oldFields[field]) !== canonical(newFields[field]))
  }
  const section = <T extends object>(oldRecords: T[], newRecords: T[], key: (record: T) => string): EmbervilleDiffSection<T> => {
    const oldMap = new Map(oldRecords.map(record => [key(record), record]))
    const newMap = new Map(newRecords.map(record => [key(record), record]))
    return {
      added: newRecords.filter(record => !oldMap.has(key(record))),
      removed: oldRecords.filter(record => !newMap.has(key(record))),
      changed: newRecords.flatMap(record => {
        const previous = oldMap.get(key(record))
        if (!previous) return []
        const changedFields = changes(previous, record)
        return changedFields.length ? [{ id: key(record), before: previous, after: record, changedFields }] : []
      }),
    }
  }
  const facts = (fields: string[], oldRecord: object, newRecord: object): EmbervilleFieldChange[] => fields.filter(field => changes(oldRecord, newRecord).includes(field)).map(field => ({ field, before: (oldRecord as JsonObject)[field], after: (newRecord as JsonObject)[field] }))
  const byId = (record: { id: string }) => record.id
  return {
    beforeVersion: before.dataVersion, afterVersion: after.dataVersion,
    metadata: facts(['schemaVersion', 'dataVersion', 'phase', 'reviewedAt'], before, after),
    sources: section(before.sources, after.sources, byId), mechanics: section(before.mechanics, after.mechanics, byId),
    classes: section(before.classes, after.classes, byId), weapons: section(before.weapons, after.weapons, byId), skills: section(before.skills, after.skills, byId),
    rules: { facts: facts(['activeSlots', 'passiveSlots', 'unlockLevel'], before.rules, after.rules), compatibility: section(before.rules.compatibility, after.rules.compatibility, rule => `${rule.baseClassId}:${rule.skillId}`) },
  }
}

/** Confirmation covers recorded inheritance evidence only, without character-level or class/weapon eligibility checks. */
export function evaluateEmbervilleDraft(data: EmbervilleDataset, draft: EmbervilleDraft): { status: 'confirmed' | 'blocked' | 'needs_verification'; messages: string[] } {
  const blocked: string[] = []
  const gaps: string[] = []
  const requireFact = (fact: SourcedFact<unknown>, label: string) => {
    if (fact.value === null) gaps.push(`${label} is unknown.`)
    else if (fact.verificationStatus === 'derived_assumption') gaps.push(`${label} is a derived assumption and needs verification.`)
  }
  const classMap = new Map(data.classes.map(record => [record.id, record]))
  const weaponMap = new Map(data.weapons.map(record => [record.id, record]))
  const skillMap = new Map(data.skills.map(record => [record.id, record]))
  const base = draft.baseClassId ? classMap.get(draft.baseClassId) : undefined
  if (!draft.baseClassId) gaps.push('Choose a base class before confirming this draft.')
  else if (!base) blocked.push(`Unknown base class ${draft.baseClassId}.`)
  else requireFact(base.name, `Base class ${base.id} name`)
  const weapon = draft.weaponId ? weaponMap.get(draft.weaponId) : undefined
  if (!draft.weaponId) gaps.push('Choose a weapon before confirming this draft.')
  else if (!weapon) blocked.push(`Unknown weapon ${draft.weaponId}.`)
  else requireFact(weapon.name, `Weapon ${weapon.id} name`)
  const learned = new Set(draft.learnedClassIds)
  const checkDuplicates = (ids: string[], label: string) => {
    const seen = new Set<string>()
    for (const id of ids) { if (seen.has(id)) blocked.push(`Duplicate ${label} ${id}.`); seen.add(id) }
  }
  checkDuplicates(draft.learnedClassIds, 'learned class')
  checkDuplicates([...draft.activeSkillIds, ...draft.passiveSkillIds], 'skill')
  for (const id of learned) {
    const record = classMap.get(id)
    if (!record) blocked.push(`Unknown learned class ${id}.`)
    else requireFact(record.name, `Learned class ${id} name`)
  }
  for (const [type, ids, limit] of [
    ['active', draft.activeSkillIds, data.rules.activeSlots],
    ['passive', draft.passiveSkillIds, data.rules.passiveSlots],
  ] as const) {
    requireFact(limit, `${type} slot limit`)
    if (limit.value !== null && ids.length > limit.value) blocked.push(`${type} slot limit is ${limit.value}; ${ids.length} selected.`)
    for (const id of ids) {
      const skill = skillMap.get(id)
      if (!skill) { blocked.push(`Unknown skill ${id}.`); continue }
      requireFact(skill.name, `Skill ${id} name`)
      requireFact(skill.type, `Skill ${id} type`)
      requireFact(skill.effect, `Skill ${id} effect`)
      if (skill.type.value !== null && skill.type.value !== type) blocked.push(`Skill ${id} is ${skill.type.value}, not ${type}.`)
      if (skill.classId !== draft.baseClassId) {
        if (!learned.has(skill.classId)) blocked.push(`Source class ${skill.classId} must be learned for skill ${id}.`)
        requireFact(skill.inheritance, `Skill ${id} inheritance`)
        if (skill.inheritance.value === false) blocked.push(`Skill ${id} cannot be inherited.`)
      }
      if (base) {
        const compatibility = data.rules.compatibility.find(rule => rule.baseClassId === base.id && rule.skillId === id)
        if (!compatibility) gaps.push(`Compatibility of ${base.id} with skill ${id} is unknown.`)
        else {
          requireFact(compatibility.allowed, `Compatibility of ${base.id} with skill ${id}`)
          if (compatibility.allowed.value === false) blocked.push(`Skill ${id} is incompatible with base class ${base.id}.`)
        }
      }
    }
  }
  requireFact(data.rules.unlockLevel, 'Inheritance unlock level')
  if (!draft.activeSkillIds.length && !draft.passiveSkillIds.length) gaps.push('Choose reviewed skills before confirming this draft.')
  if (!blocked.length && !gaps.length) return { status: 'confirmed', messages: ['Recorded inheritance evidence is complete. Character level and class/weapon rules are not checked.'] }
  return { status: blocked.length ? 'blocked' : 'needs_verification', messages: [...new Set([...blocked, ...gaps])] }
}
