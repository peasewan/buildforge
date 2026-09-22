import { shamanClass } from './shaman'
import { hunterClass } from './hunter'
import { warlockClass } from './warlock'
import { druidClass } from './druid'
import { priestClass } from './priest'
import { rogueClass } from './rogue'
import type { ClassDefinition } from '../../lib/classPage'
import { mageClass } from './mage'
import { warriorClass } from './warrior'

/**
 * Every class whose URLs may ship. A page inside a published class still has to meet its own
 * `publishRequirements` before it gets a route, so adding a class here does not publish the pages
 * that class cannot back yet.
 */
export const PUBLISHED_CLASSES: ClassDefinition[] = [mageClass, warriorClass, rogueClass, priestClass, druidClass, warlockClass, hunterClass, shamanClass]
