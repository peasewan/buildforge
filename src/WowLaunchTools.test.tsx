import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import LaunchBuildGuide from './LaunchBuildGuide'
import PlanningToolsPage from './PlanningToolsPage'
import { buildActivities, launchAllocation, launchChoices, type LaunchClass } from './data/launchBuilds'
import { raceChoices, raceClasses } from './data/raceChoices'

afterEach(cleanup)
const activities = Object.keys(buildActivities) as Array<keyof typeof buildActivities>
it.each<LaunchClass>(['hunter','mage','paladin'])('opens each %s build with the selected ranks and the correct activity guidance', cls => {
  render(<LaunchBuildGuide id={cls}/>)
  for (const activity of activities) {
    fireEvent.click(screen.getByRole('button',{name:buildActivities[activity]}))
    const allocation = launchAllocation(cls,activity)
    const url = new URL(screen.getByRole('link',{name:/Edit allocated build/}).getAttribute('href')!)
    expect(url.pathname).toBe(`/talents/${cls}/`)
    expect(screen.getByRole('heading',{name:launchChoices[cls][activity].name})).toBeTruthy()
    const encoded = url.hash.slice(1).split('-')
    allocation.trees.forEach((tree,index)=>{
      const nonzero = [...(encoded[index] || '')].map(Number).filter(Boolean)
      expect(nonzero).toEqual(tree.selected.map(([,r])=>r))
      for (const [name,rank,cap] of tree.selected) {
        expect(rank).toBeLessThanOrEqual(Number(cap))
        expect(screen.getByText(String(name))).toBeTruthy()
      }
    })
    expect(allocation.level).toBeLessThanOrEqual(60)
  }
})
it('can compare every eligible class and faction including Skyborne and the single Horde Paladin option',()=>{
  render(<PlanningToolsPage tool="class-picker"/>)
  const compare = within(screen.getByRole('region',{name:'Compare races for your class'}))
  for(const name of raceClasses) {
    fireEvent.change(compare.getByLabelText('Compare class'),{target:{value:name}})
    for(const faction of ['Alliance','Horde']) {
      fireEvent.change(compare.getByLabelText('Race faction'),{target:{value:faction}})
      const options = [...(compare.getByLabelText('First race') as HTMLSelectElement).options].map(o=>o.text)
      expect(options).toEqual(raceChoices.filter(r=>r.classes.includes(name)&&r.faction===faction).map(r=>r.name))
      expect(new Set(compare.getAllByRole('heading',{level:3}).map(h=>h.textContent)).size).toBe(Math.min(2,options.length))
    }
  }
  fireEvent.change(compare.getByLabelText('Compare class'),{target:{value:'Paladin'}})
  expect(compare.getByText(/Undead is the only Horde race/)).toBeTruthy()
  expect(compare.queryByLabelText('Compare with')).toBeNull()
  fireEvent.change(screen.getByLabelText('Activity'),{target:{value:'pvp'}})
  expect(compare.getByText(/Use the break after a fear lands/)).toBeTruthy()
})
