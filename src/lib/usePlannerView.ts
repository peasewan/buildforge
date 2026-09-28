import { useEffect, useRef, type RefObject } from 'react'
import { track } from './analytics'

/** Count a visible calculator entry once per mount, including React StrictMode replay. */
export function usePlannerView(
  marker: RefObject<Element | null>,
  classId: string,
  level: number,
  pointCap: number,
  treeMarker?: RefObject<Element | null>,
): void {
  const sent = useRef(false)
  useEffect(() => {
    const node = marker.current
    if (!node || sent.current || typeof IntersectionObserver === 'undefined') return
    let active = true
    const observer = new IntersectionObserver((entries) => {
      if (active && !sent.current && entries.some(entry => entry.isIntersecting)) {
        sent.current = true
        track('view_planner', { class: classId, page_path: window.location.pathname, level, point_cap: pointCap })
        observer.disconnect()
      }
    }, { threshold: 0.15 })
    observer.observe(node)
    // A shared URL can target a different tree from the branch holding most points.
    treeMarker?.current?.querySelectorAll('.class-tree > header').forEach(header => observer.observe(header))
    return () => { active = false; observer.disconnect() }
  }, [marker, classId, level, pointCap, treeMarker])
}
