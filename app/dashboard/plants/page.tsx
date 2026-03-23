// app/dashboard/plants/page.tsx
"use client"

export const dynamic = "force-dynamic" 

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Plant {
  id:        string
  seedType:  string
  stage:     string
  qrCode:    string
  createdAt: string
  product:   { name: string; slug: string } | null
  growthLogs: { id: string }[]
}

const STAGE_CONFIG: Record<string, {
  emoji: string; color: string; bgGlow: string; glow: string; label: string; xp: number; maxXp: number
}> = {
  SEEDED:  { emoji: "🌱", color: "text-amber-400",   bgGlow: "bg-amber-500/10",   glow: "#f59e0b", label: "Seeded",    xp: 100,  maxXp: 250  },
  SPROUT:  { emoji: "🌿", color: "text-lime-400",    bgGlow: "bg-lime-500/10",    glow: "#a3e635", label: "Sprouting", xp: 250,  maxXp: 600  },
  GROWING: { emoji: "🪴", color: "text-green-400",   bgGlow: "bg-green-500/10",   glow: "#4ade80", label: "Growing",   xp: 600,  maxXp: 1000 },
  MATURE:  { emoji: "🌳", color: "text-emerald-400", bgGlow: "bg-emerald-500/10", glow: "#34d399", label: "Mature",    xp: 1000, maxXp: 1000 },
}

const STAGE_ORDER = ["SEEDED", "SPROUT", "GROWING", "MATURE"]

function getDaysSinceCreated(createdAt: string) {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000)
}

function PlantCard({ plant, index }: { plant: Plant; index: number }) {
  const s = STAGE_CONFIG[plant.stage] ?? STAGE_CONFIG.SEEDED
  const pct = (s.xp / s.maxXp) * 100
  const days = getDaysSinceCreated(plant.createdAt)
  const [barW, setBarW] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), index * 80)
    const t2 = setTimeout(() => setBarW(pct), index * 80 + 500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [index, pct])

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/8 bg-white/3 p-5",
        "transition-all duration-500 hover:border-white/15 hover:-translate-y-0.5",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {/* Glow */}
      <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-15 pointer-events-none"
        style={{ background: s.glow }} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mb-0.5">
            {plant.product?.name ?? "Tin Garden"}
          </p>
          <h3 className="font-['Bebas_Neue',_sans-serif] text-2xl text-white capitalize leading-none">
            {plant.seedType} Plant
          </h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={cn(
            "text-xs font-bold border rounded-full px-2.5 py-0.5",
            s.color, s.bgGlow, "border-current/30"
          )}>
            {s.emoji} {s.label}
          </span>
        </div>
      </div>

      {/* Stage progress bar */}
      <div className="mb-4 space-y-1.5">
        <div className="flex justify-between text-[10px]">
          <span className="text-white/40">XP Progress</span>
          <span className={cn("font-bold", s.color)}>{s.xp} / {s.maxXp} XP</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${barW}%`, background: `linear-gradient(90deg, ${s.glow}80, ${s.glow})` }}
          />
        </div>
      </div>

      {/* Stage dots */}
      <div className="flex items-center gap-1 mb-4">
        {STAGE_ORDER.map((stage) => {
          const idx = STAGE_ORDER.indexOf(stage)
          const cur = STAGE_ORDER.indexOf(plant.stage)
          return (
            <div key={stage} className="flex items-center gap-1 flex-1">
              <div className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                idx < cur  ? "bg-emerald-400" :
                idx === cur ? "ring-2 ring-offset-1 ring-offset-transparent" : "bg-white/15"
              )} style={idx === cur ? { background: s.glow, boxShadow: `0 0 6px ${s.glow}` } : {}} />
              {idx < STAGE_ORDER.length - 1 && (
                <div className={cn("h-px flex-1", idx < cur ? "bg-emerald-400/50" : "bg-white/10")} />
              )}
            </div>
          )
        })}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Days",  value: days },
          { label: "Logs",  value: plant.growthLogs.length },
          { label: "Stage", value: `${STAGE_ORDER.indexOf(plant.stage) + 1}/4` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-white/8 bg-white/3 p-2 text-center">
            <p className="font-['Bebas_Neue',_sans-serif] text-lg text-white leading-none">{stat.value}</p>
            <p className="text-[9px] text-white/30 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/scan/${plant.qrCode}`}
          className="flex-1 rounded-xl border border-emerald-400/30 bg-emerald-400/10 py-2 text-center text-xs font-bold text-emerald-400 hover:bg-emerald-400/20 transition-colors"
        >
          Open Garden →
        </Link>
      </div>
    </div>
  )
}

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/plant")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setPlants(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stageCounts = STAGE_ORDER.reduce((acc, s) => {
    acc[s] = plants.filter((p) => p.stage === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-[#060a06] pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-24 space-y-8">

        {/* Header */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400 mb-1">
              Tin Garden
            </p>
            <h1 className="font-['Bebas_Neue',_sans-serif] text-4xl sm:text-5xl text-white leading-none">
              My Plants
            </h1>
          </div>
          <Link href="/products"
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-sm font-bold text-white transition-colors">
            + New Tin
          </Link>
        </div>

        {/* Stage summary pills */}
        {plants.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {STAGE_ORDER.map((s) => {
              const cfg = STAGE_CONFIG[s]
              const count = stageCounts[s]
              if (!count) return null
              return (
                <div key={s}
                  className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
                    cfg.color, cfg.bgGlow, "border-current/20")}>
                  {cfg.emoji} {count} {cfg.label}
                </div>
              )
            })}
          </div>
        )}

        {/* Plants grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-white/6 bg-white/3 h-64 animate-pulse" />
            ))}
          </div>
        ) : plants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-6xl mb-4">🌱</p>
            <h2 className="font-['Bebas_Neue',_sans-serif] text-3xl text-white mb-2">No Plants Yet</h2>
            <p className="text-sm text-white/40 mb-6 max-w-xs">
              Buy a DK tin, scan the QR code, and plant your growth kit to get started.
            </p>
            <Link href="/products"
              className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3 text-sm font-bold text-white transition-colors">
              Shop Tins →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plants.map((plant, i) => (
              <PlantCard key={plant.id} plant={plant} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
