// components/ui/Badge.tsx

import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────

type BadgeVariant =
  | "emerald" | "sky" | "amber" | "violet" | "red" | "gray"
  | "outline-emerald" | "outline-amber" | "outline-red"

type BadgeSize = "sm" | "md"

interface BadgeProps {
  children:   React.ReactNode
  variant?:   BadgeVariant
  size?:      BadgeSize
  dot?:       boolean
  className?: string
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const variants: Record<BadgeVariant, string> = {
  emerald:         "bg-emerald-400/15 text-emerald-400 border-emerald-400/25",
  sky:             "bg-sky-400/15     text-sky-400     border-sky-400/25",
  amber:           "bg-amber-400/15   text-amber-400   border-amber-400/25",
  violet:          "bg-violet-400/15  text-violet-400  border-violet-400/25",
  red:             "bg-red-400/15     text-red-400     border-red-400/25",
  gray:            "bg-white/8        text-white/50    border-white/10",
  "outline-emerald": "bg-transparent text-emerald-400 border-emerald-400/40",
  "outline-amber":   "bg-transparent text-amber-400   border-amber-400/40",
  "outline-red":     "bg-transparent text-red-400     border-red-400/40",
}

const dotColors: Record<BadgeVariant, string> = {
  emerald:           "bg-emerald-400",
  sky:               "bg-sky-400",
  amber:             "bg-amber-400",
  violet:            "bg-violet-400",
  red:               "bg-red-400",
  gray:              "bg-white/40",
  "outline-emerald": "bg-emerald-400",
  "outline-amber":   "bg-amber-400",
  "outline-red":     "bg-red-400",
}

const sizes: Record<BadgeSize, string> = {
  sm: "px-2   py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1   text-xs     gap-1.5",
}

// ─── Badge ─────────────────────────────────────────────────────────────────────

export function Badge({
  children,
  variant   = "gray",
  size      = "sm",
  dot       = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            dotColors[variant]
          )}
        />
      )}
      {children}
    </span>
  )
}

// ─── Preset Badges ────────────────────────────────────────────────────────────

/** Order status badge — auto-picks colour from status string */
export function OrderStatusBadge({
  status,
}: {
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED"
}) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    PENDING:   { variant: "amber",   label: "Pending" },
    PAID:      { variant: "sky",     label: "Paid" },
    SHIPPED:   { variant: "violet",  label: "Shipped" },
    DELIVERED: { variant: "emerald", label: "Delivered" },
    CANCELLED: { variant: "red",     label: "Cancelled" },
  }
  const cfg = map[status] ?? { variant: "gray", label: status }
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
}

/** Plant stage badge — auto-picks colour from stage string */
export function PlantStageBadge({
  stage,
}: {
  stage: "SEEDED" | "SPROUT" | "GROWING" | "MATURE"
}) {
  const map: Record<string, { variant: BadgeVariant; emoji: string; label: string }> = {
    SEEDED:  { variant: "amber",   emoji: "🌱", label: "Seeded" },
    SPROUT:  { variant: "emerald", emoji: "🌿", label: "Sprouting" },
    GROWING: { variant: "emerald", emoji: "🪴", label: "Growing" },
    MATURE:  { variant: "emerald", emoji: "🌳", label: "Mature" },
  }
  const cfg = map[stage] ?? { variant: "gray", emoji: "🌱", label: stage }
  return (
    <Badge variant={cfg.variant} size="sm">
      {cfg.emoji} {cfg.label}
    </Badge>
  )
}

/** Payment status badge */
export function PaymentStatusBadge({
  status,
}: {
  status: "PENDING" | "SUCCESS" | "FAILED"
}) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    PENDING: { variant: "amber",   label: "Pending" },
    SUCCESS: { variant: "emerald", label: "Paid" },
    FAILED:  { variant: "red",     label: "Failed" },
  }
  const cfg = map[status] ?? { variant: "gray", label: status }
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
}