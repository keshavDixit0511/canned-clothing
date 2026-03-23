"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/error-message"

// ─── Types ─────────────────────────────────────────────────────────────────────
// Matches GET /api/eco → { treesPlanted, orders, ecoScore }
interface EcoApiResponse {
  treesPlanted: number
  orders: number
  ecoScore: number
}

// Matches GET /api/plant → Plant[]  (with product included)
interface PlantProduct {
  id: string
  name: string
  slug: string
  seedType: string
}

interface Plant {
  id: string
  seedType: string
  qrCode: string
  stage: "SEEDED" | "SPROUT" | "GROWING" | "MATURE"
  createdAt: string
  product: PlantProduct | null
}

interface ImpactStatsProps {
  className?: string
}

// ─── Stage config ──────────────────────────────────────────────────────────────

const STAGE_CONFIG = {
  SEEDED:  { label: "Seeded",  color: "text-amber-400",   bg: "bg-amber-400/15",   border: "border-amber-400/30",   emoji: "🌱", order: 0 },
  SPROUT:  { label: "Sprout",  color: "text-lime-400",    bg: "bg-lime-400/15",    border: "border-lime-400/30",    emoji: "🌿", order: 1 },
  GROWING: { label: "Growing", color: "text-green-400",   bg: "bg-green-400/15",   border: "border-green-400/30",   emoji: "🪴", order: 2 },
  MATURE:  { label: "Mature",  color: "text-emerald-400", bg: "bg-emerald-400/15", border: "border-emerald-400/30", emoji: "🌳", order: 3 },
} as const

// ─── Progress Ring ─────────────────────────────────────────────────────────────

function ProgressRing({
  value, max, size = 76, stroke = 6, trackColor = "rgba(255,255,255,0.07)",
  fillColor, label, centerValue, centerUnit,
}: {
  value: number; max: number; size?: number; stroke?: number
  trackColor?: string; fillColor: string
  label: string; centerValue: string; centerUnit?: string
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const [dashOffset, setDashOffset] = useState(circumference)

  useEffect(() => {
    const t = setTimeout(() => {
      const ratio = max > 0 ? Math.min(value / max, 1) : 0
      setDashOffset(circumference * (1 - ratio))
    }, 150)
    return () => clearTimeout(t)
  }, [value, max, circumference])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={trackColor} strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={fillColor} strokeWidth={stroke}
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(0.34,1.56,0.64,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-['Syne'] text-xl font-bold text-white leading-none">
            {centerValue}
          </span>
          {centerUnit && (
            <span className="text-[9px] text-white/35 mt-0.5">{centerUnit}</span>
          )}
        </div>
      </div>
      <span className="text-xs text-white/50 text-center">{label}</span>
    </div>
  )
}

// ─── Plant Stage Pill ─────────────────────────────────────────────────────────

function StagePill({ stage }: { stage: Plant["stage"] }) {
  const c = STAGE_CONFIG[stage]
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
      c.color, c.bg, c.border
    )}>
      {c.emoji} {c.label}
    </span>
  )
}

// ─── ImpactStats ───────────────────────────────────────────────────────────────

export function ImpactStats({ className }: ImpactStatsProps) {
  const [eco, setEco] = useState<EcoApiResponse | null>(null)
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const [ecoRes, plantsRes] = await Promise.all([
          fetch("/api/eco"),
          fetch("/api/plant"),
        ])
        if (!ecoRes.ok || !plantsRes.ok) throw new Error("Failed to load stats")
        const [ecoData, plantsData] = await Promise.all([
          ecoRes.json(),
          plantsRes.json(),
        ])
        setEco(ecoData)
        setPlants(plantsData)
      } catch (error: unknown) {
        setError(getErrorMessage(error, "Could not load impact stats"))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Derived stats from plants array
  const maturePlants = plants.filter((p) => p.stage === "MATURE").length
  const stageBreakdown = Object.keys(STAGE_CONFIG).map((s) => ({
    stage: s as Plant["stage"],
    count: plants.filter((p) => p.stage === s).length,
  }))

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2].map((i) => (
          <div key={i}
            className="h-44 animate-pulse rounded-2xl border border-white/10 bg-white/5"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400", className)}>
        {error}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>

      {/* ── Stats Overview ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Overview
        </p>

        <div className="flex flex-wrap items-center gap-8">
          {/* Rings */}
          <ProgressRing
            value={plants.length}
            max={Math.max(plants.length + 3, 5)}
            fillColor="#34d399"
            label="Total Plants"
            centerValue={String(plants.length)}
            centerUnit="plants"
          />
          <ProgressRing
            value={maturePlants}
            max={Math.max(plants.length, 1)}
            fillColor="#38bdf8"
            label="Fully Mature"
            centerValue={String(maturePlants)}
            centerUnit="mature"
          />

          {/* Divider */}
          <div className="hidden h-16 w-px bg-white/10 sm:block" />

          {/* Score + orders */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[11px] text-white/40 mb-0.5">Eco Score</p>
              <p className="font-['Syne'] text-3xl font-bold text-violet-400 leading-none">
                {(eco?.ecoScore ?? 0).toLocaleString("en-IN")}
                <span className="ml-1.5 text-xs font-normal text-white/30">pts</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] text-white/40 mb-0.5">Orders</p>
              <p className="font-['Syne'] text-2xl font-bold text-sky-400 leading-none">
                {eco?.orders ?? 0}
                <span className="ml-1.5 text-xs font-normal text-white/30">placed</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stage Breakdown ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          Plants by Stage
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stageBreakdown.map(({ stage, count }) => {
            const c = STAGE_CONFIG[stage]
            return (
              <div
                key={stage}
                className={cn(
                  "flex flex-col gap-1.5 rounded-xl border p-3 transition-all duration-300",
                  count > 0 ? cn(c.bg, c.border) : "border-white/8 bg-white/3"
                )}
              >
                <span className="text-xl">{c.emoji}</span>
                <span className={cn("font-['Syne'] text-2xl font-bold", count > 0 ? c.color : "text-white/20")}>
                  {count}
                </span>
                <span className="text-[11px] text-white/40">{c.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Recent Plants List ── */}
      {plants.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            Recent Plants
          </p>

          <ul className="space-y-2.5">
            {plants.slice(0, 5).map((plant, idx) => (
              <li
                key={plant.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl",
                  "border border-white/8 bg-white/3 px-3 py-2.5",
                  "opacity-0 translate-y-1",
                  "animate-[fadeUp_0.35s_ease_forwards]"
                )}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white/80">
                    {plant.product?.name ?? plant.seedType}
                  </p>
                  <p className="text-[11px] text-white/30 mt-0.5">
                    {new Date(plant.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <StagePill stage={plant.stage} />
              </li>
            ))}
          </ul>

          {plants.length > 5 && (
            <p className="mt-3 text-center text-xs text-white/30">
              +{plants.length - 5} more plants in your garden
            </p>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
