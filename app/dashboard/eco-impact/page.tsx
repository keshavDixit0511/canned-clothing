// app/dashboard/eco-impact/page.tsx
"use client"

export const dynamic = "force-dynamic" 

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useCountUp, useInView } from "@/hooks"

interface EcoData {
  treesPlanted: number
  orders:       number
  ecoScore:     number
}

const GLOBAL_STATS = {
  totalTins:    2847,
  totalPlants:  2391,
  totalCO2:     50211,
}

function RadialProgress({ value, max, color, size = 120 }: {
  value: number; max: number; color: string; size?: number
}) {
  const R = (size / 2) - 10
  const circumference = 2 * Math.PI * R
  const pct = Math.min(value / max, 1)
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const t = setTimeout(() => setOffset(circumference * (1 - pct)), 400)
    return () => clearTimeout(t)
  }, [pct, circumference])

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={R}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={R}
        fill="none" stroke={color} strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.2,0.64,1)", filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
    </svg>
  )
}

export default function EcoImpactPage() {
  const [data, setData]   = useState<EcoData | null>(null)
  const [loading, setLoading] = useState(true)
  const { ref, inView }   = useInView(0.1)

  useEffect(() => {
    fetch("/api/eco")
      .then((r) => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const active = inView && !!data
  const planted  = useCountUp(data?.treesPlanted ?? 0,              1800, active)
  const co2      = useCountUp((data?.treesPlanted ?? 0) * 21,       2000, active)
  const score    = useCountUp(data?.ecoScore ?? 0,                  2200, active)
  const gTins    = useCountUp(GLOBAL_STATS.totalTins,               2400, inView)
  const gCo2     = useCountUp(GLOBAL_STATS.totalCO2,                2600, inView)

  const personalStats = [
    {
      label:  "Tins Planted",
      value:  planted,
      suffix: "",
      icon:   "🌱",
      color:  "#34d399",
      sub:    "Each tin = 1 plant on Earth",
      max:    10,
    },
    {
      label:  "KG CO₂ Saved",
      value:  co2,
      suffix: " kg",
      icon:   "🌍",
      color:  "#a3e635",
      sub:    `${planted} tins × 21 kg avg`,
      max:    210,
    },
    {
      label:  "Eco Score",
      value:  score,
      suffix: " pts",
      icon:   "⭐",
      color:  "#fbbf24",
      sub:    "Lifetime impact score",
      max:    1000,
    },
  ]

  const milestones = [
    { target: 1,   label: "First Tin",      emoji: "🥇", xp: 100  },
    { target: 3,   label: "Trio Grower",    emoji: "🌿", xp: 300  },
    { target: 5,   label: "Eco Enthusiast", emoji: "♻️",  xp: 500  },
    { target: 10,  label: "Green Pioneer",  emoji: "🌳", xp: 1000 },
    { target: 25,  label: "Eco Champion",   emoji: "🏆", xp: 2500 },
    { target: 50,  label: "Carbon Hero",    emoji: "🌏", xp: 5000 },
  ]

  return (
    <div className="min-h-screen bg-[#060a06] pb-20">
      {/* Ambient */}
      <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 w-[500px] h-[250px] opacity-8"
        style={{ background: "radial-gradient(ellipse, #a3e635, transparent)" }} />

      <div ref={ref} className="mx-auto max-w-5xl px-4 sm:px-6 pt-24 space-y-10">

        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400 mb-1">
            Your Impact
          </p>
          <h1 className="font-['Bebas_Neue',_sans-serif] text-4xl sm:text-5xl text-white leading-none">
            Eco Impact
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Every tin you plant makes a real environmental difference.
          </p>
        </div>

        {/* Personal stats */}
        {loading ? (
          <div className="grid sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-white/6 bg-white/3 h-44 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {personalStats.map((stat, i) => (
              <div key={stat.label}
                className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-6 flex flex-col items-center text-center"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 100%, ${stat.color}, transparent)` }} />

                <div className="relative mb-3">
                  <RadialProgress value={stat.value} max={stat.max} color={stat.color} size={100} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                </div>

                <p className="font-['Bebas_Neue',_sans-serif] text-3xl leading-none mb-0.5"
                  style={{ color: stat.color }}>
                  {stat.value.toLocaleString("en-IN")}{stat.suffix}
                </p>
                <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-[10px] text-white/30">{stat.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Impact equivalents */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-5">
            What Your Impact Equals
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { emoji: "🚗", label: "km not driven",    value: Math.round((data?.treesPlanted ?? 0) * 21 * 5.6) },
              { emoji: "📱", label: "phones charged",   value: Math.round((data?.treesPlanted ?? 0) * 21 * 122) },
              { emoji: "💡", label: "bulb hours saved", value: Math.round((data?.treesPlanted ?? 0) * 21 * 230) },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
                <span className="text-3xl block mb-2">{item.emoji}</span>
                <p className="font-['Bebas_Neue',_sans-serif] text-2xl text-white">
                  {item.value.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-5">
            Milestones
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {milestones.map((m) => {
              const earned = (data?.treesPlanted ?? 0) >= m.target
              return (
                <div key={m.target}
                  className={cn(
                    "rounded-xl border p-3.5 transition-all duration-300",
                    earned
                      ? "border-emerald-400/30 bg-emerald-400/8"
                      : "border-white/6 bg-white/3 opacity-50 grayscale"
                  )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{m.emoji}</span>
                    {earned && <span className="text-[10px] font-bold text-emerald-400">✓ Earned</span>}
                  </div>
                  <p className="text-sm font-bold text-white/80">{m.label}</p>
                  <p className="text-[10px] text-white/35">{m.target} tin{m.target > 1 ? "s" : ""} · +{m.xp} XP</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Global community stats */}
        <div className="rounded-2xl border border-lime-400/20 bg-lime-400/5 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-400 mb-5">
            🌍 Community Impact — Global
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Tins Planted",  value: gTins,  suffix: "",     color: "#34d399" },
              { label: "KG CO₂ Offset", value: gCo2,   suffix: " kg",  color: "#a3e635" },
              { label: "Active Growers",value: 1892,    suffix: "",     color: "#fbbf24" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-['Bebas_Neue',_sans-serif] text-4xl leading-none mb-1"
                  style={{ color: s.color }}>
                  {s.value.toLocaleString("en-IN")}{s.suffix}
                </p>
                <p className="text-xs text-white/40 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}