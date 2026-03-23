// components/ui/Modal.tsx

"use client"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

// ─── Types ─────────────────────────────────────────────────────────────────────

type ModalSize = "sm" | "md" | "lg" | "xl" | "full"

interface ModalProps {
  open:             boolean
  onClose:          () => void
  title?:           string
  description?:     string
  children:         React.ReactNode
  size?:            ModalSize
  /** Hide the default close (×) button */
  hideClose?:       boolean
  /** Prevent closing by clicking backdrop */
  persistent?:      boolean
  footer?:          React.ReactNode
  className?:       string
}

interface ConfirmModalProps {
  open:         boolean
  onClose:      () => void
  onConfirm:    () => void | Promise<void>
  title:        string
  description?: string
  confirmLabel?: string
  cancelLabel?:  string
  variant?:     "danger" | "primary"
  loading?:     boolean
}

// ─── Size map ──────────────────────────────────────────────────────────────────

const sizes: Record<ModalSize, string> = {
  sm:   "max-w-sm",
  md:   "max-w-md",
  lg:   "max-w-lg",
  xl:   "max-w-2xl",
  full: "max-w-full mx-4",
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size       = "md",
  hideClose  = false,
  persistent = false,
  footer,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !persistent) onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, persistent, onClose])

  if (!open) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (!persistent && e.target === overlayRef.current) onClose()
  }

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-black/60 backdrop-blur-sm",
        "animate-[fadeIn_0.2s_ease]"
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className={cn(
          "relative w-full rounded-2xl",
          "border border-white/10 bg-[#0a1a10]/95 backdrop-blur-xl",
          "shadow-2xl shadow-black/60",
          "animate-[slideUp_0.25s_cubic-bezier(0.34,1.56,0.64,1)]",
          sizes[size],
          className
        )}
      >
        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-3 border-b border-white/8 px-5 py-4">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="font-['Syne'] text-base font-bold text-white"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-sm text-white/45">{description}</p>
              )}
            </div>

            {!hideClose && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                  "border border-white/8 bg-white/5 text-white/40",
                  "hover:border-white/20 hover:text-white/80 hover:bg-white/10",
                  "transition-all duration-150"
                )}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-5 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-white/8 px-5 py-3.5 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>,
    document.body
  )
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

/**
 * Pre-built confirm/delete dialog.
 *
 * @example
 * <ConfirmModal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   onConfirm={handleDelete}
 *   title="Delete plant?"
 *   description="This can't be undone."
 *   variant="danger"
 *   confirmLabel="Yes, delete"
 * />
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel  = "Cancel",
  variant      = "primary",
  loading      = false,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            size="sm"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {/* Empty — title + description in header is enough for confirm dialogs */}
      <div />
    </Modal>
  )
}