// hooks/useCountUp.ts
"use client"

import { useEffect, useState } from "react"

/**
 * Animates a number from 0 → target over `duration` ms.
 * Only starts when `active` is true — pair with useInView so
 * the animation triggers on scroll into view.
 *
 * Uses an ease-out-quart curve for a natural deceleration feel.
 *
 * @param target    - The number to count up to
 * @param duration  - Animation duration in ms (default 2000)
 * @param active    - Set true to start the animation (default false)
 *
 * @example
 * const { ref, inView } = useInView()
 * const count = useCountUp(1500, 2000, inView)
 * <span>{count}</span>
 */
export function useCountUp(
  target:   number,
  duration: number  = 2000,
  active:   boolean = false
) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active || target === 0) return

    let start: number | null = null

    const tick = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 4) // ease-out-quart
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
      else setCount(target)
    }

    requestAnimationFrame(tick)
  }, [target, duration, active])

  return count
}