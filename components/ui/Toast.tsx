// components/ui/Toast.tsx

"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id:       string
  type:     ToastType
  title:    string
  message?: string
  duration?: number
}

interface ToastContextValue {
  toast: (options: Omit<Toast, "id">) => void
  success: (title: string, message?: string) => void
  error:   (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info:    (title: string, message?: string) => void
}

// ─── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>")
  return ctx
}

// ─── Config ────────────────────────────────────────────────────────────────────

const typeConfig: Record<ToastType, {
  icon: React.ReactNode; border: string; glow: string; iconBg: string
}> = {
  success: {
    icon:   <span className="text-base">✓</span>,
    border: "border-emerald-400/25",
    glow:   "shadow-emerald-900/30",
    iconBg: "bg-emerald-400/15 text-emerald-400",
  },
  error: {
    icon:   <span className="text-base">✕</span>,
    border: "border-red-400/25",
    glow:   "shadow-red-900/30",
    iconBg: "bg-red-400/15 text-red-400",
  },
  warning: {
    icon:   <span className="text-base">⚠</span>,
    border: "border-amber-400/25",
    glow:   "shadow-amber-900/30",
    iconBg: "bg-amber-400/15 text-amber-400",
  },
  info: {
    icon:   <span className="text-base">ℹ</span>,
    border: "border-sky-400/25",
    glow:   "shadow-sky-900/30",
    iconBg: "bg-sky-400/15 text-sky-400",
  },
}

// ─── Single Toast ─────────────────────────────────────────────────────────────

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast
  onRemove: (id: string) => void
}) {
  const [exiting, setExiting] = useState(false)
  const cfg = typeConfig[toast.type]

  const handleRemove = useCallback(() => {
    setExiting(true)
    setTimeout(() => onRemove(toast.id), 300)
  }, [toast.id, onRemove])

  // Auto-dismiss
  useEffect(() => {
    const t = setTimeout(handleRemove, toast.duration ?? 4000)
    return () => clearTimeout(t)
  }, [handleRemove, toast.duration])

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4",
        "bg-[#0a1a10]/95 backdrop-blur-xl",
        "shadow-xl", cfg.glow, cfg.border,
        "transition-all duration-300",
        exiting
          ? "opacity-0 translate-x-4 scale-95"
          : "opacity-100 translate-x-0 scale-100 animate-[slideInRight_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-bold",
        cfg.iconBg
      )}>
        {cfg.icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-semibold text-white/90 leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs text-white/45 leading-snug">{toast.message}</p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={handleRemove}
        className="shrink-0 text-white/25 hover:text-white/60 transition-colors mt-0.5"
        aria-label="Dismiss"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <style jsx>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(16px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)    scale(1); }
        }
      `}</style>
    </div>
  )
}

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * Wrap your root layout with this provider:
 *
 *   // app/layout.tsx
 *   <ToastProvider>
 *     {children}
 *   </ToastProvider>
 *
 * Then anywhere in your app:
 *   const { success, error } = useToast()
 *   success("Plant registered!", "Your tin is now active.")
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((options: Omit<Toast, "id">) => {
    // UUIDs keep toast ids stable without relying on render-time randomness.
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { ...options, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const ctx: ToastContextValue = {
    toast:   addToast,
    success: (title, message) => addToast({ type: "success", title, message }),
    error:   (title, message) => addToast({ type: "error",   title, message }),
    warning: (title, message) => addToast({ type: "warning", title, message }),
    info:    (title, message) => addToast({ type: "info",    title, message }),
  }

  const portalTarget = typeof document === "undefined" ? null : document.body

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {portalTarget &&
        createPortal(
          <div
            aria-live="polite"
            aria-label="Notifications"
            className="fixed bottom-6 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]"
          >
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onRemove={removeToast} />
            ))}
          </div>,
          portalTarget
        )}
    </ToastContext.Provider>
  )
}
