// app/dashboard/eco-impact/page.tsx
"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useCountUp, useInView } from "@/hooks"

interface EcoData {
  treesPlanted: number
  orders: number
  ecoScore: number
}

const GLOBAL_STATS = {
  totalTins: 2847,
  totalPlants: 2391,
  totalCO2: 50211,
}

function RadialProgress({
  value,
  max,
  color,
  size = 120,
}: {
  value: number
  max: number
  color: string
  size?: number
}) {
  const radius = size / 2 - 10
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(value / max, 1)
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const timeout = setTimeout(() => setOffset(circumference * (1 - pct)), 400)
    return () => clearTimeout(timeout)
  }, [pct, circumference])

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.2,0.64,1)",
          filter: `drop-shadow(0 0 6px ${color}80)`,
        }}
      />
    </svg>
  )
}

export default function EcoImpactPage() {
  const [data, setData] = useState<EcoData | null>(null)
  const [loading, setLoading] = useState(true)
  const { ref, inView } = useInView(0.1)

  useEffect(() => {
    fetch("/api/eco")
      .then((response) => (response.ok ? response.json() : null))
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const active = inView && !!data
  const planted = useCountUp(data?.treesPlanted ?? 0, 1800, active)
  const co2 = useCountUp((data?.treesPlanted ?? 0) * 21, 2000, active)
  const score = useCountUp(data?.ecoScore ?? 0, 2200, active)
  const globalTins = useCountUp(GLOBAL_STATS.totalTins, 2400, inView)
  const globalCo2 = useCountUp(GLOBAL_STATS.totalCO2, 2600, inView)

  const personalStats = [
    {
      label: "Tins Planted",
      value: planted,
      suffix: "",
      icon: "🌱",
      color: "#34d399",
      sub: "Each tin = 1 plant on Earth",
      max: 10,
    },
    {
      label: "KG CO2 Saved",
      value: co2,
      suffix: " kg",
      icon: "🌍",
      color: "#a3e635",
      sub: `${planted} tins x 21 kg avg`,
      max: 210,
    },
    {
      label: "Eco Score",
      value: score,
      suffix: " pts",
      icon: "⭐",
      color: "#fbbf24",
      sub: "Lifetime impact score",
      max: 1000,
    },
  ]

  const milestones = [
    { target: 1, label: "First Tin", emoji: "🥇", xp: 100 },
    { target: 3, label: "Trio Member", emoji: "🌿", xp: 300 },
    { target: 5, label: "Eco Enthusiast", emoji: "♻️", xp: 500 },
    { target: 10, label: "Green Pioneer", emoji: "🌳", xp: 1000 },
    { target: 25, label: "Eco Champion", emoji: "🏆", xp: 2500 },
    { target: 50, label: "Carbon Hero", emoji: "🌏", xp: 5000 },
  ]

  return (
    <div className="min-h-screen overflow-x-clip bg-[#060a06] pb-20">
      <div
        className="pointer-events-none absolute top-16 left-1/2 h-[250px] w-[min(500px,100vw)] -translate-x-1/2 opacity-10"
        style={{ background: "radial-gradient(ellipse, #a3e635, transparent)" }}
      />

      <div ref={ref} className="mx-auto max-w-5xl space-y-10 px-4 pt-24 sm:px-6">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em] text-lime-400">Your Impact</p>
          <h1 className="font-['Bebas_Neue',_sans-serif] text-4xl leading-none text-white sm:text-5xl">
            Eco Impact
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Every tin you plant makes a real environmental difference.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-44 rounded-2xl border border-white/6 bg-white/3 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {personalStats.map((stat, index) => (
              <div
                key={stat.label}
                className="relative flex min-w-0 flex-col items-center overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-5 text-center sm:p-6"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-5"
                  style={{ background: `radial-gradient(circle at 50% 100%, ${stat.color}, transparent)` }}
                />

                <div className="relative mb-3">
                  <RadialProgress value={stat.value} max={stat.max} color={stat.color} size={100} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                </div>

                <p
                  className="break-words font-['Bebas_Neue',_sans-serif] text-3xl leading-none"
                  style={{ color: stat.color }}
                >
                  {stat.value.toLocaleString("en-IN")}
                  {stat.suffix}
                </p>
                <p className="mb-1 mt-1 text-[11px] font-bold uppercase tracking-wider text-white/60 sm:text-xs">
                  {stat.label}
                </p>
                <p className="text-[10px] leading-snug text-white/30">{stat.sub}</p>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-white/8 bg-white/3 p-5 sm:p-6">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/30">
            What Your Impact Equals
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { emoji: "🚗", label: "km not driven", value: Math.round((data?.treesPlanted ?? 0) * 21 * 5.6) },
              { emoji: "📱", label: "phones charged", value: Math.round((data?.treesPlanted ?? 0) * 21 * 122) },
              { emoji: "💡", label: "bulb hours saved", value: Math.round((data?.treesPlanted ?? 0) * 21 * 230) },
            ].map((item) => (
              <div key={item.label} className="min-w-0 rounded-xl border border-white/8 bg-white/3 p-4 text-center">
                <span className="mb-2 block text-3xl">{item.emoji}</span>
                <p className="break-words font-['Bebas_Neue',_sans-serif] text-2xl text-white">
                  {item.value.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-white/40">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/3 p-5 sm:p-6">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/30">Milestones</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {milestones.map((milestone) => {
              const earned = (data?.treesPlanted ?? 0) >= milestone.target

              return (
                <div
                  key={milestone.target}
                  className={cn(
                    "rounded-xl border p-3.5 transition-all duration-300 min-w-0",
                    earned ? "border-emerald-400/30 bg-emerald-400/8" : "border-white/6 bg-white/3 opacity-50 grayscale"
                  )}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="shrink-0 text-xl">{milestone.emoji}</span>
                    {earned ? <span className="text-[10px] font-bold text-emerald-400">Earned</span> : null}
                  </div>
                  <p className="text-sm font-bold text-white/80">{milestone.label}</p>
                  <p className="text-[10px] leading-snug text-white/35">
                    {milestone.target} tin{milestone.target > 1 ? "s" : ""} · +{milestone.xp} XP
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-lime-400/20 bg-lime-400/5 p-5 sm:p-6">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-lime-400">🌍 Community Impact</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Tins Planted", value: globalTins, suffix: "", color: "#34d399" },
              { label: "KG CO2 Offset", value: globalCo2, suffix: " kg", color: "#a3e635" },
              { label: "Active Members", value: 1892, suffix: "", color: "#fbbf24" },
            ].map((stat) => (
              <div key={stat.label} className="min-w-0 text-center">
                <p
                  className="break-words font-['Bebas_Neue',_sans-serif] text-4xl leading-none"
                  style={{ color: stat.color }}
                >
                  {stat.value.toLocaleString("en-IN")}
                  {stat.suffix}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
