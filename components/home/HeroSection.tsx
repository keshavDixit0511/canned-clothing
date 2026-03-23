// components/home/HeroSection.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FloatingParticles } from "./FloatingParticles"
import ThreeDTin from "../visual/ThreeDTin"

// Three.js must NOT run on the server — dynamic import with ssr: false
const WORDS = ["Performance.", "Sustainability.", "Growth."]

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [wordIdx, setWordIdx] = useState(0)
  const [fade,    setFade]    = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % WORDS.length)
        setFade(true)
      }, 350)
    }, 2600)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#080c08]">

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px",
        }}
      />

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px]"
          style={{ background: "radial-gradient(ellipse, rgba(52,211,153,0.04) 0%, transparent 70%)" }} />
      </div>

      <FloatingParticles />

      {/* Diagonal grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 60px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 w-full pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Text ── */}
          <div className="space-y-8">

            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2.5 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-4 py-1.5"
              style={{
                opacity:    mounted ? 1 : 0,
                transform:  mounted ? "translateY(0)" : "translateY(12px)",
                transition: "all 0.6s ease 0.1s",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span
                className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase"
                style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
              >
                Industrial Zen · DK Collection
              </span>
            </div>

            {/* Headline */}
            <div
              style={{
                opacity:    mounted ? 1 : 0,
                transform:  mounted ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.7s ease 0.2s",
              }}
            >
              <h1
                className="text-white leading-[0.9] tracking-[-0.01em]"
                style={{
                  fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
                  fontSize:   "clamp(56px, 8vw, 110px)",
                }}
              >
                WEAR IT.
                <br />
                PLANT IT.
                <br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{
                    background: "linear-gradient(135deg, #34d399 0%, #6ee7b7 50%, #a7f3d0 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  GROW IT.
                </span>
              </h1>
            </div>

            {/* Animated word */}
            <div
              className="flex items-center gap-3"
              style={{
                opacity:    mounted ? 1 : 0,
                transform:  mounted ? "translateY(0)" : "translateY(16px)",
                transition: "all 0.7s ease 0.35s",
              }}
            >
              <div className="h-px w-8 bg-emerald-400/40" />
              <span
                className="text-lg font-medium"
                style={{
                  fontFamily: "var(--font-dm, 'DM Sans', sans-serif)",
                  color:      fade ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0)",
                  transition: "color 0.3s ease",
                }}
              >
                {WORDS[wordIdx]}
              </span>
            </div>

            {/* Body copy */}
            <p
              className="max-w-md text-base leading-relaxed"
              style={{
                fontFamily: "var(--font-dm, 'DM Sans', sans-serif)",
                color:      "rgba(255,255,255,0.45)",
                opacity:    mounted ? 1 : 0,
                transform:  mounted ? "translateY(0)" : "translateY(14px)",
                transition: "all 0.7s ease 0.45s",
              }}
            >
              Premium bamboo-spandex performance wear delivered in a brushed aluminum tin.
              Unbox your shirt. Plant the growth kit inside. Track your plant&apos;s journey online.{" "}
              <span className="text-white/65">
                Zero plastic. Zero waste. One tin — infinite purpose.
              </span>
            </p>

            {/* CTAs */}
            <div
              className="flex flex-wrap gap-3"
              style={{
                opacity:    mounted ? 1 : 0,
                transform:  mounted ? "translateY(0)" : "translateY(12px)",
                transition: "all 0.7s ease 0.55s",
              }}
            >
              <Link
                href="/products"
                className="group relative overflow-hidden rounded-2xl px-7 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #059669, #34d399)",
                  boxShadow:  "0 4px 24px rgba(52,211,153,0.3)",
                  fontFamily: "var(--font-dm, 'DM Sans', sans-serif)",
                }}
              >
                <span className="relative z-10">Shop The Seeded Shirt</span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(135deg, #10b981, #6ee7b7)" }}
                />
              </Link>

              <Link
                href="/dashboard/plants"
                className="rounded-2xl border border-white/12 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white/70 backdrop-blur-sm hover:border-white/25 hover:text-white transition-all duration-200"
                style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
              >
                View Plant Portal →
              </Link>
            </div>

            {/* Trust bar */}
            <div
              className="flex flex-wrap items-center gap-5 pt-2"
              style={{
                opacity:    mounted ? 1 : 0,
                transition: "opacity 0.7s ease 0.7s",
              }}
            >
              {[
                { icon: "🌿", text: "Bamboo-Spandex Fabric" },
                { icon: "♻️",  text: "Zero Plastic Packaging" },
                { icon: "🇮🇳", text: "Made in India" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-1.5">
                  <span className="text-sm">{item.icon}</span>
                  <span
                    className="text-xs text-white/35"
                    style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3D Scene ── */}
          <div
            className="flex items-center justify-center"
            style={{
              opacity:    mounted ? 1 : 0,
              transform:  mounted ? "translateX(0) scale(1)" : "translateX(40px) scale(0.95)",
              transition: "all 0.9s cubic-bezier(0.34,1.1,0.64,1) 0.3s",
            }}
          >
            {/* <TinScene className="w-full h-[560px]" /> */}
            <ThreeDTin className="w-full h-[560px]" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span
            className="text-[10px] tracking-[0.3em] text-white uppercase"
            style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
          >
            Scroll
          </span>
          <div className="h-8 w-px bg-gradient-to-b from-white/40 to-transparent animate-bounce" />
        </div>
      </div>
    </section>
  )
}
