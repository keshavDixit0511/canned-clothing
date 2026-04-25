// app/dashboard/page.tsx
"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useCountUp } from "@/hooks"
import { getOrderStatusMeta } from "@/lib/order-status"
import { getDisplayName } from "@/lib/profile"

interface DashboardData {
  profile: {
    name: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    image: string | null
    onboardingCompleted?: boolean
  }
  eco: { treesPlanted: number; orders: number; ecoScore: number }
  leaderboard: { points: number; rank: number | null }
  plants: { id: string; seedType: string; stage: string; createdAt: string }[]
  orders: { id: string; status: string; totalAmount: number; createdAt: string }[]
}

const STAGE_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {
  SEEDED: { emoji: "🌱", color: "text-amber-400", label: "Seeded" },
  SPROUT: { emoji: "🌿", color: "text-lime-400", label: "Sprouting" },
  GROWING: { emoji: "🪴", color: "text-green-400", label: "Growing" },
  MATURE: { emoji: "🌳", color: "text-emerald-400", label: "Mature" },
}

function StatCard({
  emoji,
  label,
  value,
  sub,
  color,
  href,
  delay,
}: {
  emoji: string
  label: string
  value: string | number
  sub?: string
  color: string
  href?: string
  delay: number
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timeout)
  }, [delay])

  const inner = (
    <div
      className={cn(
        "group relative min-w-0 overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-4 sm:p-5",
        "transition-all duration-500",
        href && "cursor-pointer hover:-translate-y-0.5 hover:border-white/15",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(ellipse at 0% 0%, ${color}12 0%, transparent 60%)` }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30 sm:text-xs sm:tracking-[0.2em]">
            {label}
          </p>
          <p
            className="truncate font-['Bebas_Neue',_sans-serif] text-[2rem] leading-none sm:text-4xl"
            style={{ color }}
          >
            {value}
          </p>
          {sub ? <p className="mt-1 text-[11px] leading-snug text-white/35 sm:text-xs">{sub}</p> : null}
        </div>
        <span className="shrink-0 text-2xl sm:text-3xl">{emoji}</span>
      </div>
    </div>
  )

  return href ? <Link href={href}>{inner}</Link> : inner
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    const hour = new Date().getHours()
    setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening")
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const [profileRes, ecoRes, lbRes, plantsRes, ordersRes] = await Promise.all([
          fetch("/api/profile", { credentials: "include", cache: "no-store" }),
          fetch("/api/eco", { credentials: "include", cache: "no-store" }),
          fetch("/api/leaderboard/me", { credentials: "include", cache: "no-store" }),
          fetch("/api/plant", { credentials: "include", cache: "no-store" }),
          fetch("/api/orders", { credentials: "include", cache: "no-store" }),
        ])

        const [profile, eco, leaderboard, plants, orders] = await Promise.all([
          profileRes.ok ? profileRes.json() : { name: null, firstName: null, lastName: null, email: null, image: null },
          ecoRes.ok ? ecoRes.json() : { treesPlanted: 0, orders: 0, ecoScore: 0 },
          lbRes.ok ? lbRes.json() : { points: 0, rank: null },
          plantsRes.ok ? plantsRes.json() : [],
          ordersRes.ok ? ordersRes.json() : [],
        ])

        setData({
          profile,
          eco,
          leaderboard,
          plants: Array.isArray(plants) ? plants.slice(0, 3) : [],
          orders: Array.isArray(orders) ? orders.slice(0, 3) : [],
        })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const co2 = useCountUp((data?.eco.treesPlanted ?? 0) * 21, 1800, !!data)
  const points = useCountUp(data?.leaderboard.points ?? 0, 1600, !!data)

  const quickLinks = [
    { href: "/dashboard/plants", emoji: "🌱", label: "My Plants", desc: "Track your tins" },
    { href: "/dashboard/eco-impact", emoji: "🌍", label: "Eco Impact", desc: "Your CO2 saved" },
    { href: "/dashboard/leaderboard", emoji: "🏆", label: "Leaderboard", desc: "See your rank" },
    { href: "/products", emoji: "📦", label: "Shop", desc: "Get a new tin" },
    { href: "/dashboard/profile", emoji: "👤", label: "Profile", desc: "Edit your info" },
    { href: "/orders", emoji: "🛍️", label: "Orders", desc: "Order history" },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060a06]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
          <p className="text-sm text-white/30">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-[#060a06] pb-20">
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-[300px] w-[min(600px,100vw)] -translate-x-1/2 opacity-10"
        style={{ background: "radial-gradient(ellipse, #34d399, transparent)" }}
      />

      <div className="mx-auto max-w-6xl space-y-8 px-4 pt-24 sm:px-6">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">{greeting}</p>
          <h1 className="font-['Bebas_Neue',_sans-serif] text-4xl leading-none text-white sm:text-5xl">
            {getDisplayName({
              name: data?.profile.name ?? null,
              firstName: data?.profile.firstName ?? null,
              lastName: data?.profile.lastName ?? null,
              email: data?.profile.email ?? null,
            })} 👋
          </h1>
          <p className="text-sm text-white/40">Here&apos;s how your garden is doing today.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            emoji="🌱"
            label="Tins Planted"
            value={data?.eco.treesPlanted ?? 0}
            sub="Total registered"
            color="#34d399"
            href="/dashboard/plants"
            delay={0}
          />
          <StatCard
            emoji="🌍"
            label="KG CO2 Saved"
            value={`${co2} kg`}
            sub="Environmental impact"
            color="#a3e635"
            href="/dashboard/eco-impact"
            delay={80}
          />
          <StatCard
            emoji="⭐"
            label="Green Points"
            value={points.toLocaleString("en-IN")}
            sub={data?.leaderboard.rank ? `Rank #${data.leaderboard.rank}` : "Unranked"}
            color="#fbbf24"
            href="/dashboard/leaderboard"
            delay={160}
          />
          <StatCard
            emoji="📦"
            label="Orders"
            value={data?.eco.orders ?? 0}
            sub="Total purchases"
            color="#9ca3af"
            href="/orders"
            delay={240}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-white/8 bg-white/3">
            <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3.5 sm:px-5">
              <p className="min-w-0 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 sm:text-xs sm:tracking-[0.2em]">
                Recent Plants
              </p>
              <Link
                href="/dashboard/plants"
                className="shrink-0 text-xs text-emerald-400 transition-colors hover:text-emerald-300"
              >
                View all →
              </Link>
            </div>

            {!data?.plants.length ? (
              <div className="px-4 py-8 text-center sm:px-5">
                <p className="mb-2 text-3xl">🌱</p>
                <p className="text-sm text-white/35">No plants yet. Scan your first tin!</p>
                <Link
                  href="/products"
                  className="mt-3 inline-block rounded-xl border border-emerald-400/30 bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500/30"
                >
                  Shop Tins →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {data.plants.map((plant) => {
                  const stage = STAGE_CONFIG[plant.stage] ?? STAGE_CONFIG.SEEDED

                  return (
                    <Link
                      key={plant.id}
                      href="/dashboard/plants"
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/4 sm:px-5"
                    >
                      <span className="shrink-0 text-2xl">{stage.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold capitalize text-white/85">
                          {plant.seedType} Plant
                        </p>
                        <p className="text-xs text-white/30">
                          {new Date(plant.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <span className={cn("shrink-0 text-right text-[11px] font-bold", stage.color)}>
                        {stage.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="min-w-0 overflow-hidden rounded-2xl border border-white/8 bg-white/3">
            <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3.5 sm:px-5">
              <p className="min-w-0 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 sm:text-xs sm:tracking-[0.2em]">
                Recent Orders
              </p>
              <Link
                href="/orders"
                className="shrink-0 text-xs text-emerald-400 transition-colors hover:text-emerald-300"
              >
                View all →
              </Link>
            </div>

            {!data?.orders.length ? (
              <div className="px-4 py-8 text-center sm:px-5">
                <p className="mb-2 text-3xl">📦</p>
                <p className="text-sm text-white/35">No orders yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {data.orders.map((order) => {
                  const status = getOrderStatusMeta(order.status)

                  return (
                    <div key={order.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white/80">
                          Order #{order.id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-white/30">
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="whitespace-nowrap text-sm font-bold text-white">
                          Rs.{order.totalAmount.toLocaleString("en-IN")}
                        </p>
                        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold", status.color)}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/30">Quick Access</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-white/8 bg-white/3 p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/6"
              >
                <span className="text-2xl transition-transform duration-200 group-hover:scale-110">
                  {link.emoji}
                </span>
                <div className="min-w-0 text-center">
                  <p className="truncate text-xs font-bold text-white/80">{link.label}</p>
                  <p className="text-[10px] leading-snug text-white/30">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
