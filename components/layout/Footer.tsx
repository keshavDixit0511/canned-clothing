// components/layout/Footer.tsx

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────

interface EcoStats {
  treesPlanted: number
  orders: number
  ecoScore: number
}

// ─── Animated counter ─────────────────────────────────────────────────────────

function Count({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === 0) return
    const duration = 1800
    const start    = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(eased * value))
      if (progress < 1) requestAnimationFrame(tick)
      else setDisplay(value)
    }

    requestAnimationFrame(tick)
  }, [value])

  return (
    <span>
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  )
}

// ─── Newsletter ────────────────────────────────────────────────────────────────

function Newsletter() {
  const [email, setEmail]     = useState("")
  const [status, setStatus]   = useState<"idle" | "loading" | "done" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus("loading")
    // Simulate — wire up to your email service (SendGrid, etc.)
    await new Promise((r) => setTimeout(r, 900))
    setStatus("done")
    setEmail("")
  }

  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-white/80">Stay in the loop</p>
      <p className="mb-3 text-xs text-white/35 leading-relaxed">
        Plant updates, eco tips & exclusive drops.
      </p>

      {status === "done" ? (
        <p className="text-sm text-emerald-400 flex items-center gap-2">
          <span>✓</span> You&apos;re subscribed!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className={cn(
              "flex-1 min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2",
              "text-sm text-white/80 placeholder:text-white/25",
              "focus:outline-none focus:border-emerald-400/40 transition-colors"
            )}
          />
          <button
            type="submit"
            disabled={status === "loading" || !email.trim()}
            className={cn(
              "rounded-xl border border-emerald-400/30 bg-emerald-400/15 px-3 py-2",
              "text-sm font-semibold text-emerald-400 shrink-0",
              "hover:bg-emerald-400/25 hover:border-emerald-400/50 transition-all duration-200",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {status === "loading" ? "..." : "Subscribe"}
          </button>
        </form>
      )}
    </div>
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────────

export function Footer() {
  const [eco, setEco] = useState<EcoStats | null>(null)

  useEffect(() => {
    fetch("/api/eco")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setEco(data) })
      .catch(() => {})
  }, [])

  const linkGroups = [
    {
      title: "Shop",
      links: [
        { label: "All Products",  href: "/products" },
        { label: "New Arrivals",  href: "/products?sort=newest" },
        { label: "Cart",          href: "/cart" },
        { label: "Checkout",      href: "/checkout" },
      ],
    },
    {
      title: "Garden",
      links: [
        { label: "My Plants",     href: "/dashboard/plants" },
        { label: "Eco Impact",    href: "/dashboard/eco-impact" },
        { label: "Leaderboard",   href: "/dashboard/leaderboard" },
        { label: "Dashboard",     href: "/dashboard" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Orders",        href: "/orders" },
        { label: "Profile",       href: "/dashboard/profile" },
        { label: "Sign In",       href: "/login" },
        { label: "Register",      href: "/register" },
      ],
    },
  ]

  const socials = [
    {
      label: "Instagram",
      href: "https://instagram.com",
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      label: "Twitter / X",
      href: "https://twitter.com",
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "YouTube",
      href: "https://youtube.com",
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ]

  return (
    <footer className="border-t border-white/8 bg-[#050d0a]">

      {/* ── Eco Impact Banner ── */}
      {eco && (
        <div className="border-b border-white/5 bg-emerald-950/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5">
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {[
                { emoji: "🌱", label: "Trees Planted",  value: eco.treesPlanted, suffix: "" },
                { emoji: "📦", label: "Orders Placed",  value: eco.orders,        suffix: "" },
                { emoji: "⭐", label: "Eco Score",      value: eco.ecoScore,      suffix: " pts" },
              ].map(({ emoji, label, value, suffix }) => (
                <div key={label} className="flex items-center gap-3 text-center">
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="font-['Syne'] text-xl font-black text-white">
                      <Count value={value} suffix={suffix} />
                    </p>
                    <p className="text-[11px] font-medium uppercase tracking-widest text-white/35">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main footer grid ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">

          {/* Brand col */}
          <div className="lg:col-span-2 space-y-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="h-9 w-9 rounded-xl border border-emerald-400/30 bg-emerald-400/10 flex items-center justify-center group-hover:border-emerald-400/60 transition-all duration-300">
                <span className="text-lg">🥫</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-['Syne'] text-base font-black text-white">Canned</span>
                <span className="font-['Syne'] text-[10px] font-bold tracking-[0.2em] text-emerald-400 uppercase">Clothing</span>
              </div>
            </Link>

            {/* Tagline */}
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Wear it. Plant it. Grow it.{" "}
              <span className="text-white/60">
                Every tin you buy becomes a garden.
                Every plant you grow changes the world.
              </span>
            </p>

            {/* Socials */}
            <div className="flex items-center gap-2 pt-1">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    "border border-white/10 bg-white/5 text-white/40",
                    "hover:border-white/25 hover:text-white/80 hover:bg-white/10",
                    "transition-all duration-200"
                  )}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="pt-2">
              <Newsletter />
            </div>
          </div>

          {/* Link groups */}
          {linkGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                {group.title}
              </p>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/45 hover:text-white/80 transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} Canned Clothing. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms",   href: "/terms" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-white/25 hover:text-white/50 transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <span className="text-xs text-white/15">
              Built with 🌱 for the planet
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
