// components/product/SizeSelector.tsx
// NOTE: Your schema has no "sizes" field on Product.
// This component is repurposed as an ActivitySelector
// showing the product's activity type (e.g. Gym, Daily, Work).
// If you don't need it, you can delete this file safely.
"use client"

import { cn } from "@/lib/utils"

interface ActivitySelectorProps {
  activity:  string
  className?: string
}

const ACTIVITY_CONFIG: Record<string, { emoji: string; label: string; desc: string }> = {
  gym:        { emoji: "💪", label: "Gym",         desc: "High-intensity performance"    },
  daily:      { emoji: "🌿", label: "Daily Wear",  desc: "All-day comfort & style"       },
  work:       { emoji: "💼", label: "Work",         desc: "Sharp, wrinkle-free look"      },
  outdoor:    { emoji: "🏕️", label: "Outdoor",     desc: "Breathable for the elements"   },
  yoga:       { emoji: "🧘", label: "Yoga",         desc: "Stretch-friendly fabric"       },
}

const FALLBACK = { emoji: "👕", label: "Versatile", desc: "For any occasion" }

export function SizeSelector({ activity, className }: ActivitySelectorProps) {
  const config = ACTIVITY_CONFIG[activity?.toLowerCase()] ?? FALLBACK

  return (
    <div className={cn("rounded-xl border border-white/8 bg-white/3 p-4 flex items-center gap-3", className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl">
        {config.emoji}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-white/30 mb-0.5">
          Best For
        </p>
        <p className="text-sm font-semibold text-white/80">{config.label}</p>
        <p className="text-xs text-white/40">{config.desc}</p>
      </div>
    </div>
  )
}

export default SizeSelector