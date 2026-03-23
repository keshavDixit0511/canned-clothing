// hooks/useMouseDrag.ts
"use client"

import { useCallback, useEffect, useRef } from "react"

/**
 * Tracks mouse drag delta and calls `onDrag(dx, dy)` on every move.
 * Attaches global mousemove / mouseup listeners so dragging outside
 * the element still works (e.g. spinning the 3D tin can).
 *
 * Returns `onMouseDown` to attach to the draggable element.
 *
 * @param onDrag - Callback receiving (dx, dy) pixel deltas per frame
 *
 * @example
 * const { onMouseDown } = useMouseDrag((dx, dy) => {
 *   setRot(r => ({ x: r.x - dy * 0.4, y: r.y + dx * 0.6 }))
 * })
 * <div onMouseDown={onMouseDown} />
 */
export function useMouseDrag(
  onDrag: (dx: number, dy: number) => void
) {
  const dragging = useRef(false)
  const lastPos  = useRef({ x: 0, y: 0 })

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    lastPos.current  = { x: e.clientX, y: e.clientY }
  }, [])

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      lastPos.current = { x: e.clientX, y: e.clientY }
      onDrag(dx, dy)
    }

    const handleUp = () => {
      dragging.current = false
    }

    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup",   handleUp)
    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup",   handleUp)
    }
  }, [onDrag])

  return { onMouseDown }
}