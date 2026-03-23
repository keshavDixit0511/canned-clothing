// components/ui/Button.tsx

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "eco"
type Size    = "xs" | "sm" | "md" | "lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant
  size?:      Size
  loading?:   boolean
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

// ─── Variant styles ────────────────────────────────────────────────────────────

const variants: Record<Variant, string> = {
  primary: cn(
    "bg-emerald-500 text-white border-transparent",
    "hover:bg-emerald-400 hover:-translate-y-0.5",
    "hover:shadow-lg hover:shadow-emerald-500/25",
    "active:translate-y-0 active:shadow-none",
    "disabled:bg-emerald-500/40"
  ),
  secondary: cn(
    "bg-white/8 text-white/80 border-white/10",
    "hover:bg-white/14 hover:text-white hover:border-white/20",
    "active:bg-white/10",
    "disabled:bg-white/5 disabled:text-white/25"
  ),
  outline: cn(
    "bg-transparent text-emerald-400 border-emerald-400/35",
    "hover:bg-emerald-400/10 hover:border-emerald-400/60",
    "active:bg-emerald-400/15",
    "disabled:text-emerald-400/30 disabled:border-emerald-400/15"
  ),
  ghost: cn(
    "bg-transparent text-white/50 border-transparent",
    "hover:bg-white/6 hover:text-white/80",
    "active:bg-white/10",
    "disabled:text-white/20"
  ),
  danger: cn(
    "bg-red-500/15 text-red-400 border-red-400/25",
    "hover:bg-red-500/25 hover:border-red-400/50",
    "active:bg-red-500/30",
    "disabled:text-red-400/30 disabled:border-red-400/10"
  ),
  eco: cn(
    "bg-gradient-to-r from-emerald-600 to-green-500 text-white border-transparent",
    "hover:from-emerald-500 hover:to-green-400 hover:-translate-y-0.5",
    "hover:shadow-lg hover:shadow-emerald-600/30",
    "active:translate-y-0",
    "disabled:opacity-40"
  ),
}

const sizes: Record<Size, string> = {
  xs: "h-7  px-2.5 text-xs  gap-1.5 rounded-lg",
  sm: "h-8  px-3   text-sm  gap-1.5 rounded-lg",
  md: "h-10 px-4   text-sm  gap-2   rounded-xl",
  lg: "h-12 px-6   text-base gap-2   rounded-xl",
}

// ─── Spinner ───────────────────────────────────────────────────────────────────

function Spinner({ size }: { size: Size }) {
  const dim = size === "xs" || size === "sm" ? "h-3 w-3" : "h-4 w-4"
  return (
    <svg
      className={cn(dim, "animate-spin shrink-0")}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ─── Button ────────────────────────────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = "primary",
      size      = "md",
      loading   = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base
          "relative inline-flex items-center justify-center font-semibold",
          "border transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent",
          "disabled:cursor-not-allowed disabled:pointer-events-none",
          // Variant + size
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner size={size} />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}

        {children && (
          <span className={cn(loading && "opacity-0")}>{children}</span>
        )}

        {!loading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = "Button"