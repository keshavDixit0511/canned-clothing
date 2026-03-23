// components/home/EcoCounterSection.tsx

"use client"

import { useEffect, useState } from "react"
import { useInView, useCountUp } from "@/hooks"

interface EcoStats {
  treesPlanted: number
  orders:       number
  ecoScore:     number
}

export function EcoCounterSection() {
  const { ref, inView } = useInView(0.2)
  const [eco, setEco]   = useState<EcoStats | null>(null)

  useEffect(() => {
    fetch("/api/eco")
      .then((r) => (r.ok ? r.json() : null))
      .then(setEco)
      .catch(() => {})
  }, [])

  const active   = inView && !!eco
  const planted  = useCountUp(eco?.treesPlanted ?? 0,               2200, active)
  const orders   = useCountUp(eco?.orders       ?? 0,               1800, active)
  const score    = useCountUp(eco?.ecoScore     ?? 0,               2500, active)
  const co2      = useCountUp(eco ? eco.treesPlanted * 21 : 0,      2000, active)

  const stats = [
    { label: "Tins Planted",   value: planted, suffix: "",     icon: "🌱", color: "#34d399" },
    { label: "Orders Shipped", value: orders,  suffix: "+",    icon: "📦", color: "#9ca3af" },
    { label: "Green Points",   value: score,   suffix: " pts", icon: "⭐", color: "#fbbf24" },
    { label: "KG CO₂ Offset",  value: co2,     suffix: " kg",  icon: "🌍", color: "#a3e635" },
  ]

  return (
    <section
      className="relative py-28 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #060a06 0%, #04080a 50%, #060a06 100%)",
      }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(52,211,153,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/25 to-transparent" />

      <div ref={ref} className="mx-auto max-w-7xl px-6">

        {/* Heading */}
        <div
          className="mb-16 text-center"
          style={{
            opacity:    inView ? 1 : 0,
            transform:  inView ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.7s ease",
          }}
        >
          <p
            className="mb-3 text-xs font-bold tracking-[0.35em] text-emerald-400 uppercase"
            style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
          >
            Global Impact — Live
          </p>
          <h2
            className="text-white"
            style={{
              fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
              fontSize:   "clamp(40px, 5vw, 72px)",
              lineHeight: 0.95,
            }}
          >
            Every Tin. Every Plant.
            <br />
            <span className="text-emerald-400">Every Drop Counts.</span>
          </h2>
          <p
            className="mt-4 max-w-lg mx-auto text-sm text-white/40"
            style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
          >
            Real numbers from real growers. This is what happens when a community decides
            packaging shouldn&apos;t be waste.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-6 text-center group hover:border-white/15 transition-all duration-300"
              style={{
                opacity:    inView ? 1 : 0,
                transform:  inView ? "translateY(0)" : "translateY(28px)",
                transition: `all 0.7s ease ${i * 0.1}s`,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 50% 100%, ${s.color}12 0%, transparent 65%)`,
                }}
              />

              <span className="text-3xl block mb-3">{s.icon}</span>

              <div
                className="font-black leading-none mb-1"
                style={{
                  fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
                  fontSize:   46,
                  color:      s.color,
                  textShadow: `0 0 24px ${s.color}50`,
                }}
              >
                {s.value.toLocaleString("en-IN")}{s.suffix}
              </div>

              <p
                className="text-xs text-white/35 uppercase tracking-wider font-semibold"
                style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
