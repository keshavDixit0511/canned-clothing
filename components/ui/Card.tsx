// components/ui/Card.tsx

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────

type CardVariant = "default" | "elevated" | "flat" | "glow"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  /** Adds a coloured top border accent */
  accent?: "emerald" | "sky" | "amber" | "violet" | "red"
  /** Makes the card clickable with hover lift */
  clickable?: boolean
  noPadding?: boolean
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
}

// ─── Variant styles ────────────────────────────────────────────────────────────

const variants: Record<CardVariant, string> = {
  default:  "border border-white/10 bg-white/5 backdrop-blur-xl",
  elevated: "border border-white/12 bg-white/8 backdrop-blur-xl shadow-xl shadow-black/30",
  flat:     "border border-white/6 bg-white/3",
  glow:     "border border-emerald-400/20 bg-white/5 backdrop-blur-xl shadow-lg shadow-emerald-900/20",
}

const accents: Record<string, string> = {
  emerald: "border-t-emerald-400/60",
  sky:     "border-t-sky-400/60",
  amber:   "border-t-amber-400/60",
  violet:  "border-t-violet-400/60",
  red:     "border-t-red-400/60",
}

// ─── Card ──────────────────────────────────────────────────────────────────────

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant   = "default",
      accent,
      clickable = false,
      noPadding = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl",
          variants[variant],
          accent && cn("border-t-2", accents[accent]),
          clickable && cn(
            "cursor-pointer transition-all duration-200",
            "hover:-translate-y-1 hover:border-white/20 hover:shadow-lg hover:shadow-black/20"
          ),
          !noPadding && "p-5",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"

// ─── Card.Header ──────────────────────────────────────────────────────────────

export function CardHeader({
  title,
  subtitle,
  action,
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn("flex items-start justify-between gap-3 mb-4", className)}
      {...props}
    >
      <div className="min-w-0">
        {title && (
          <h3 className="font-['Syne'] text-base font-bold text-white leading-tight truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="mt-0.5 text-sm text-white/45 leading-snug">{subtitle}</p>
        )}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ─── Card.Section ─────────────────────────────────────────────────────────────

export function CardSection({
  label,
  className,
  children,
  ...props
}: CardSectionProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label && (
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
          {label}
        </p>
      )}
      {children}
    </div>
  )
}

// ─── Card.Divider ─────────────────────────────────────────────────────────────

export function CardDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "-mx-5 my-4 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent",
        className
      )}
    />
  )
}

// ─── Card.Footer ──────────────────────────────────────────────────────────────

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "-mx-5 -mb-5 mt-4 px-5 py-3.5",
        "border-t border-white/6 bg-white/3",
        "flex items-center justify-between gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}