import { useRef } from 'react'
import { track } from './analytics'

export function useArrowFirstAdjustment(event: 'stand_out_arrow_used' | 'stand_out_crafting_used') {
  const recorded = useRef(false)
  return (control: string) => {
    if (recorded.current) return
    recorded.current = true
    track(event, { first_control: control })
  }
}
