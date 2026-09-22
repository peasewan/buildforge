import { readFileSync, writeFileSync } from 'node:fs'
import { importClientClass, parseClientCsv, type ClientClassInput } from '../src/lib/clientClassImport'
const build = '1.60.1.69913'
const dir = `data/sources/six-classes/${build}`
const table = (name: string) => parseClientCsv(readFileSync(`${dir}/${name}.csv`, 'utf8'))
const tables = { talents: table('Talent'), tabs: table('TalentTab'), spells: table('SpellName') }
for (const [classId, classMask] of Object.entries({ rogue: 8, priest: 16, druid: 1024, warlock: 256, hunter: 4, shaman: 64 })) {
  const crosscheck = JSON.parse(readFileSync(`${dir}/${classId}-db.json`, 'utf8')) as ClientClassInput['crosscheck']
  const result = importClientClass({ classId, classMask, build, ...tables, crosscheck })
  if (!result.ready) throw new Error(`${classId}: ${result.conflicts.join('; ')}`)
  writeFileSync(`src/data/expansion/${classId}-${build}.json`, `${JSON.stringify(result, null, 2)}\n`)
  console.log(`${classId}: ${result.talents.length} primary client records; ${result.conflicts.length} structural conflicts`)
}
