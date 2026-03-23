"use client"

// components/ui/Loader.tsx

import { cn } from "@/lib/utils"

// ─── Spinner ───────────────────────────────────────────────────────────────────

type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl"

interface SpinnerProps {
  size?:      SpinnerSize
  color?:     "emerald" | "white" | "amber" | "sky"
  className?: string
}

const spinnerSizes: Record<SpinnerSize, string> = {
  xs: "h-3 w-3 border-[1.5px]",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
  xl: "h-12 w-12 border-[3px]",
}

const spinnerColors: Record<string, string> = {
  emerald: "border-emerald-400/20 border-t-emerald-400",
  white:   "border-white/20 border-t-white",
  amber:   "border-amber-400/20 border-t-amber-400",
  sky:     "border-sky-400/20 border-t-sky-400",
}

export function Spinner({
  size = "md",
  color = "emerald",
  className,
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "rounded-full animate-spin shrink-0",
        spinnerSizes[size],
        spinnerColors[color],
        className
      )}
    />
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string
  /** Animate with shimmer effect */
  shimmer?: boolean
}

export function Skeleton({ className, shimmer = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white/6",
        shimmer && "relative overflow-hidden",
        className
      )}
    >
      {shimmer && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      )}
      <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}

// ─── Skeleton presets ─────────────────────────────────────────────────────────

/** Card-shaped skeleton for product/plant cards */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-white/8 bg-white/5 p-5 space-y-3", className)}>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  )
}

/** Row-shaped skeleton for lists */
export function RowSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3", className)}>
      <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full shrink-0" />
    </div>
  )
}

/** Stats skeleton for dashboard cards */
export function StatSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-white/8 bg-white/5 p-5 space-y-3", className)}>
      <Skeleton className="h-9 w-9 rounded-xl" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

// ─── Page Loader ──────────────────────────────────────────────────────────────

interface PageLoaderProps {
  message?: string
}

/**
 * Full-screen loader for page-level transitions.
 */
export function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050d0a]">
      {/* Pulsing rings */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
        <div
          className="absolute inset-3 rounded-full bg-emerald-500/10 animate-ping"
          style={{ animationDelay: "0.3s" }}
        />
        <div className="relative h-16 w-16 rounded-full border border-emerald-400/20 bg-emerald-400/8 flex items-center justify-center">
          <span className="text-3xl">🌱</span>
        </div>
      </div>

      <Spinner size="lg" />

      <p className="mt-4 text-sm font-medium text-white/40">{message}</p>

      {/* Animated dots */}
      <div className="mt-3 flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1 w-1 rounded-full bg-emerald-400/40 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Inline Loader ────────────────────────────────────────────────────────────

/**
 * Inline centered loader for section-level loading states.
 */
export function SectionLoader({
  message,
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 gap-3", className)}>
      <Spinner size="lg" />
      {message && (
        <p className="text-sm text-white/35">{message}</p>
      )}
    </div>
  )
}