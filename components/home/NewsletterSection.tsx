// components/home/NewsletterSection.tsx

"use client"

import { useState } from "react"
import { useInView } from "@/hooks"

export function NewsletterSection() {
  const { ref, inView } = useInView(0.2)
  const [email,  setEmail]  = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus("loading")
    // Wire up to your email service (SendGrid, Resend, etc.)
    await new Promise((r) => setTimeout(r, 800))
    setStatus("done")
  }

  return (
    <section className="relative py-28 overflow-hidden bg-[#060a06]">

      {/* Giant DK watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ opacity: 0.025 }}
      >
        <span
          style={{
            fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
            fontSize:   "clamp(200px, 35vw, 500px)",
            color:      "#34d399",
            lineHeight: 1,
          }}
        >
          DK
        </span>
      </div>

      <div ref={ref} className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <div
          style={{
            opacity:    inView ? 1 : 0,
            transform:  inView ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.8s ease",
          }}
        >
          <p
            className="mb-4 text-xs font-bold tracking-[0.35em] text-emerald-400 uppercase"
            style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
          >
            Join The Movement
          </p>

          <h2
            className="mb-4 text-white"
            style={{
              fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
              fontSize:   "clamp(40px, 6vw, 80px)",
              lineHeight: 0.92,
            }}
          >
            Get Early Access
            <br />
            <span className="text-emerald-400">to New Drops.</span>
          </h2>

          <p
            className="mb-8 text-sm text-white/40 leading-relaxed"
            style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
          >
            New seed varieties. Limited edition tins. Community challenges.
            Join the DK inner circle — no spam, just growth.
          </p>

          {status === "done" ? (
            <div className="inline-flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-8 py-4">
              <span className="text-2xl">🌱</span>
              <div className="text-left">
                <p
                  className="font-bold text-emerald-400"
                  style={{
                    fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
                    fontSize:   18,
                  }}
                >
                  You&apos;re in.
                </p>
                <p
                  className="text-xs text-white/45"
                  style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                >
                  Welcome to the DK community.
                </p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-2xl border border-white/12 bg-white/6 px-4 py-3.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-emerald-400/40 transition-colors backdrop-blur-sm"
                style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
              />
              <button
                type="submit"
                disabled={status === "loading" || !email.trim()}
                className="shrink-0 rounded-2xl px-7 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #059669, #34d399)",
                  boxShadow:  "0 4px 20px rgba(52,211,153,0.3)",
                  fontFamily: "var(--font-dm, 'DM Sans', sans-serif)",
                }}
              >
                {status === "loading" ? "Planting..." : "Join the Circle"}
              </button>
            </form>
          )}

          <p
            className="mt-4 text-xs text-white/20"
            style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
          >
            No spam. Unsubscribe any time. Your data stays with us.
          </p>
        </div>
      </div>
    </section>
  )
}
