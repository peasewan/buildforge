import { useRef } from 'react'
import { track } from './analytics'

export function useFirstToolAdjustment(event: 'stand_out_arrow_used' | 'stand_out_crafting_used' | 'stand_out_picker_used' | 'blox_superhuman_used') {
  const recorded = useRef(false)
  return (control: string) => {
    if (recorded.current) return
    recorded.current = true
    track(event, { first_control: control })
  }
}
