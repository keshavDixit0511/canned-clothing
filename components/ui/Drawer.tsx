// components/ui/Drawer.tsx

"use client"

import { useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────

type DrawerSide = "right" | "left" | "bottom"

interface DrawerProps {
  open:        boolean
  onClose:     () => void
  children:    React.ReactNode
  side?:       DrawerSide
  title?:      string
  description?: string
  /** Width for left/right drawers */
  width?:      string
  /** Height for bottom drawer */
  height?:     string
  footer?:     React.ReactNode
  className?:  string
}

// ─── Animation classes per side ───────────────────────────────────────────────

const sideStyles: Record<DrawerSide, {
  panel:   string
  enter:   string
  exit:    string
}> = {
  right: {
    panel: "right-0 top-0 bottom-0",
    enter: "animate-[slideInRight_0.3s_cubic-bezier(0.34,1.1,0.64,1)]",
    exit:  "animate-[slideOutRight_0.25s_ease]",
  },
  left: {
    panel: "left-0 top-0 bottom-0",
    enter: "animate-[slideInLeft_0.3s_cubic-bezier(0.34,1.1,0.64,1)]",
    exit:  "animate-[slideOutLeft_0.25s_ease]",
  },
  bottom: {
    panel: "bottom-0 left-0 right-0",
    enter: "animate-[slideInBottom_0.3s_cubic-bezier(0.34,1.1,0.64,1)]",
    exit:  "animate-[slideOutBottom_0.25s_ease]",
  },
}

// ─── Drawer ────────────────────────────────────────────────────────────────────

export function Drawer({
  open,
  onClose,
  children,
  side        = "right",
  title,
  description,
  width       = "w-full sm:w-96",
  height      = "h-[85vh]",
  footer,
  className,
}: DrawerProps) {
  const styles = sideStyles[side]

  // Body scroll lock
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else      document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  // Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          "absolute flex flex-col",
          "border-white/10 bg-[#0a1a10]/98 backdrop-blur-xl",
          "shadow-2xl shadow-black/60",
          styles.panel,
          styles.enter,
          side === "right" || side === "left"
            ? cn(width, "border-l")
            : cn(height, "border-t rounded-t-2xl"),
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
      >
        {/* Header */}
        {(title || true) && (
          <div className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4 shrink-0">
            <div>
              {title && (
                <h2 id="drawer-title" className="font-['Syne'] text-base font-bold text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-xs text-white/40">{description}</p>
              )}
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg shrink-0",
                "border border-white/8 bg-white/5 text-white/40",
                "hover:border-white/20 hover:text-white/80 hover:bg-white/10",
                "transition-all duration-150"
              )}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-white/8 px-5 py-4 shrink-0">
            {footer}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn         { from { opacity: 0; }                         to { opacity: 1; } }
        @keyframes slideInRight   { from { transform: translateX(100%); }        to { transform: translateX(0); } }
        @keyframes slideOutRight  { from { transform: translateX(0); }           to { transform: translateX(100%); } }
        @keyframes slideInLeft    { from { transform: translateX(-100%); }       to { transform: translateX(0); } }
        @keyframes slideOutLeft   { from { transform: translateX(0); }           to { transform: translateX(-100%); } }
        @keyframes slideInBottom  { from { transform: translateY(100%); }        to { transform: translateY(0); } }
        @keyframes slideOutBottom { from { transform: translateY(0); }           to { transform: translateY(100%); } }
      `}</style>
    </div>,
    document.body
  )
}