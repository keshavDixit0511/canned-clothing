// hooks/useInView.ts
"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Fires once when the element enters the viewport.
 * Disconnects the observer after first trigger (fire-once).
 * Used for scroll-triggered animations across all sections.
 *
 * @param threshold  - 0–1, how much of the element must be visible (default 0.2)
 *
 * @example
 * const { ref, inView } = useInView(0.15)
 * <div ref={ref} style={{ opacity: inView ? 1 : 0 }} />
 */
export function useInView(threshold = 0.2) {
  const ref             = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}