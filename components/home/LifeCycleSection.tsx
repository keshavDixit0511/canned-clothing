// components/home/LifeCycleSection.tsx

"use client"

import { useState } from "react"
import { useInView } from "@/hooks"

const STEPS = [
  {
    number: "01",
    icon:   "📦",
    title:  "UNBOX",
    sub:    "The Aluminum Tin",
    desc:   "Your shirt arrives sealed inside a brushed aluminum cylinder — embossed with the DK monogram. Pull the tab. No plastic. No waste. Just pure industrial craft.",
    detail: "Inside: performance shirt (rolled wrinkle-free) + soil pod + premium seeds.",
    color:  "#9ca3af",
    glow:   "rgba(156,163,175,0.25)",
  },
  {
    number: "02",
    icon:   "👕",
    title:  "WEAR",
    sub:    "The Seeded Shirt",
    desc:   "Ultra-lightweight bamboo-spandex. Moisture-wicking, anti-odor, zero-wrinkle. Engineered for the gym, the boardroom, and everywhere in between.",
    detail: "Proprietary fabric: 70% bamboo viscose, 30% spandex. 145 GSM.",
    color:  "#34d399",
    glow:   "rgba(52,211,153,0.25)",
  },
  {
    number: "03",
    icon:   "🌱",
    title:  "PLANT",
    sub:    "The Growth Kit",
    desc:   "Fill the tin with the included soil pod. Drop in your seeds. Scan the QR code to register your plant on the DK portal. Your tin lives on — on your desk, your windowsill.",
    detail: "Choose: Basil, Mint, Lavender, or Succulent seeds.",
    color:  "#a3e635",
    glow:   "rgba(163,230,53,0.25)",
  },
]

export function LifeCycleSection() {
  const { ref, inView } = useInView(0.15)
  const [active, setActive] = useState<number | null>(null)

  return (
    <section className="relative py-28 bg-[#060a06] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

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
            The Life Cycle
          </p>
          <h2
            className="text-white"
            style={{
              fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
              fontSize:   "clamp(42px, 6vw, 80px)",
              lineHeight: 0.95,
            }}
          >
            One Tin.
            <br />
            <span className="text-emerald-400">Three Lives.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-1">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="relative group cursor-default"
              style={{
                opacity:    inView ? 1 : 0,
                transform:  inView ? "translateY(0)" : "translateY(32px)",
                transition: `all 0.7s ease ${0.15 + i * 0.15}s`,
              }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <div
                className="relative overflow-hidden rounded-2xl border p-7 transition-all duration-500 h-full"
                style={{
                  borderColor: active === i ? `${step.color}40` : "rgba(255,255,255,0.07)",
                  background:  active === i
                    ? `radial-gradient(ellipse at 20% 0%, ${step.glow} 0%, rgba(8,12,8,0.98) 60%)`
                    : "rgba(255,255,255,0.025)",
                  boxShadow:  active === i ? `0 0 40px ${step.glow}` : "none",
                  transform:  active === i ? "translateY(-4px)" : "translateY(0)",
                }}
              >
                {/* Ghost number */}
                <div
                  className="absolute top-4 right-5 leading-none pointer-events-none"
                  style={{
                    fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
                    fontSize:   72,
                    color:      step.color,
                    opacity:    0.08,
                  }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl transition-all duration-300"
                  style={{
                    borderColor: active === i ? `${step.color}50` : "rgba(255,255,255,0.1)",
                    background:  active === i ? `${step.color}15` : "rgba(255,255,255,0.04)",
                    boxShadow:   active === i ? `0 0 20px ${step.glow}` : "none",
                  }}
                >
                  {step.icon}
                </div>

                {/* Label */}
                <p
                  className="mb-0.5 text-[10px] font-bold tracking-[0.3em] uppercase"
                  style={{ color: step.color, fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                >
                  Step {step.number} — {step.sub}
                </p>

                <h3
                  className="mb-3 text-white"
                  style={{
                    fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
                    fontSize:   36,
                    letterSpacing: "0.02em",
                  }}
                >
                  {step.title}
                </h3>

                <p
                  className="text-sm leading-relaxed text-white/50 mb-4"
                  style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                >
                  {step.desc}
                </p>

                <p
                  className="text-xs border-l-2 pl-3 py-0.5 leading-relaxed transition-all duration-300"
                  style={{
                    color:       active === i ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)",
                    borderColor: step.color + "60",
                    fontFamily:  "var(--font-dm, 'DM Sans', sans-serif)",
                  }}
                >
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
