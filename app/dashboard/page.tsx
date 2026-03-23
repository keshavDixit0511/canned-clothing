// app/dashboard/page.tsx
"use client"

export const dynamic = "force-dynamic" 

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useCountUp } from "@/hooks"

interface DashboardData {
  profile:     { name: string; image: string | null }
  eco:         { treesPlanted: number; orders: number; ecoScore: number }
  leaderboard: { points: number; rank: number | null }
  plants:      { id: string; seedType: string; stage: string; createdAt: string }[]
  orders:      { id: string; status: string; totalAmount: number; createdAt: string }[]
}

const STAGE_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {
  SEEDED:  { emoji: "🌱", color: "text-amber-400",   label: "Seeded"   },
  SPROUT:  { emoji: "🌿", color: "text-lime-400",    label: "Sprouting" },
  GROWING: { emoji: "🪴", color: "text-green-400",   label: "Growing"  },
  MATURE:  { emoji: "🌳", color: "text-emerald-400", label: "Mature"   },
}

const ORDER_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PENDING:    { color: "text-amber-400 bg-amber-400/10 border-amber-400/20",    label: "Pending"    },
  PROCESSING: { color: "text-blue-400 bg-blue-400/10 border-blue-400/20",       label: "Processing" },
  SHIPPED:    { color: "text-sky-400 bg-sky-400/10 border-sky-400/20",          label: "Shipped"    },
  DELIVERED:  { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Delivered" },
  CANCELLED:  { color: "text-red-400 bg-red-400/10 border-red-400/20",          label: "Cancelled"  },
}

function StatCard({
  emoji, label, value, sub, color, href, delay,
}: {
  emoji: string; label: string; value: string | number
  sub?: string; color: string; href?: string; delay: number
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  const inner = (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-5",
        "transition-all duration-500 group",
        href && "hover:border-white/15 hover:-translate-y-0.5 cursor-pointer",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 0% 0%, ${color}12 0%, transparent 60%)` }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-2">{label}</p>
          <p className="font-['Bebas_Neue',_sans-serif] text-4xl font-bold leading-none"
            style={{ color }}>{value}</p>
          {sub && <p className="mt-1 text-xs text-white/35">{sub}</p>}
        </div>
        <span className="text-3xl">{emoji}</span>
      </div>
    </div>
  )

  return href ? <Link href={href}>{inner}</Link> : inner
}

export default function DashboardPage() {
  const [data, setData]     = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening")
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const [profileRes, ecoRes, lbRes, plantsRes, ordersRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/eco"),
          fetch("/api/leaderboard/me"),
          fetch("/api/plant"),
          fetch("/api/orders"),
        ])
        const [profile, eco, lb, plants, orders] = await Promise.all([
          profileRes.ok ? profileRes.json() : { name: "Grower", image: null },
          ecoRes.ok     ? ecoRes.json()     : { treesPlanted: 0, orders: 0, ecoScore: 0 },
          lbRes.ok      ? lbRes.json()      : { points: 0, rank: null },
          plantsRes.ok  ? plantsRes.json()  : [],
          ordersRes.ok  ? ordersRes.json()  : [],
        ])
        setData({ profile, eco, leaderboard: lb, plants: Array.isArray(plants) ? plants.slice(0, 3) : [], orders: Array.isArray(orders) ? orders.slice(0, 3) : [] })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const co2 = useCountUp((data?.eco.treesPlanted ?? 0) * 21, 1800, !!data)
  const pts = useCountUp(data?.leaderboard.points ?? 0, 1600, !!data)

  const quickLinks = [
    { href: "/dashboard/plants",      emoji: "🌱", label: "My Plants",    desc: "Track your tins" },
    { href: "/dashboard/eco-impact",  emoji: "🌍", label: "Eco Impact",   desc: "Your CO₂ saved"  },
    { href: "/dashboard/leaderboard", emoji: "🏆", label: "Leaderboard",  desc: "See your rank"   },
    { href: "/products",              emoji: "📦", label: "Shop",         desc: "Get a new tin"   },
    { href: "/dashboard/profile",     emoji: "👤", label: "Profile",      desc: "Edit your info"  },
    { href: "/orders",                emoji: "🛍️", label: "Orders",       desc: "Order history"   },
  ]

  if (loading) return (
    <div className="min-h-screen bg-[#060a06] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
        <p className="text-sm text-white/30">Loading dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#060a06] pb-20">
      {/* Top glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-10"
        style={{ background: "radial-gradient(ellipse, #34d399, transparent)" }} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-24 space-y-8">

        {/* ── Greeting ── */}
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
            {greeting}
          </p>
          <h1 className="font-['Bebas_Neue',_sans-serif] text-4xl sm:text-5xl text-white leading-none">
            {data?.profile.name ?? "Grower"} 👋
          </h1>
          <p className="text-sm text-white/40">Here&apos;s how your garden is doing today.</p>
        </div>

        {/* ── Stat grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard emoji="🌱" label="Tins Planted"  value={data?.eco.treesPlanted ?? 0}
            sub="Total registered"     color="#34d399" href="/dashboard/plants"  delay={0} />
          <StatCard emoji="🌍" label="KG CO₂ Saved" value={`${co2} kg`}
            sub="Environmental impact"  color="#a3e635" href="/dashboard/eco-impact" delay={80} />
          <StatCard emoji="⭐" label="Green Points"  value={pts.toLocaleString("en-IN")}
            sub={data?.leaderboard.rank ? `Rank #${data.leaderboard.rank}` : "Unranked"}
            color="#fbbf24" href="/dashboard/leaderboard" delay={160} />
          <StatCard emoji="📦" label="Orders"        value={data?.eco.orders ?? 0}
            sub="Total purchases"       color="#9ca3af" href="/orders" delay={240} />
        </div>

        {/* ── Recent plants + Orders row ── */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Plants */}
          <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-3.5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Recent Plants</p>
              <Link href="/dashboard/plants" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                View all →
              </Link>
            </div>
            {!data?.plants.length ? (
              <div className="px-5 py-8 text-center">
                <p className="text-3xl mb-2">🌱</p>
                <p className="text-sm text-white/35">No plants yet. Scan your first tin!</p>
                <Link href="/products"
                  className="mt-3 inline-block rounded-xl bg-emerald-500/20 border border-emerald-400/30 px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                  Shop Tins →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {data.plants.map((plant) => {
                  const s = STAGE_CONFIG[plant.stage] ?? STAGE_CONFIG.SEEDED
                  return (
                    <Link key={plant.id} href="/dashboard/plants"
                      className="flex items-center gap-3 px-5 py-3 hover:bg-white/4 transition-colors">
                      <span className="text-2xl">{s.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white/85 capitalize truncate">
                          {plant.seedType} Plant
                        </p>
                        <p className="text-xs text-white/30">
                          {new Date(plant.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <span className={cn("text-xs font-bold", s.color)}>{s.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-3.5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Recent Orders</p>
              <Link href="/orders" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                View all →
              </Link>
            </div>
            {!data?.orders.length ? (
              <div className="px-5 py-8 text-center">
                <p className="text-3xl mb-2">📦</p>
                <p className="text-sm text-white/35">No orders yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {data.orders.map((order) => {
                  const s = ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.PENDING
                  return (
                    <div key={order.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white/80 truncate">
                          Order #{order.id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-white/30">
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-white">
                          ₹{order.totalAmount.toLocaleString("en-IN")}
                        </p>
                        <span className={cn("text-[10px] font-bold border rounded-full px-2 py-0.5", s.color)}>
                          {s.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick links grid ── */}
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/30">Quick Access</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-white/8 bg-white/3 p-4 hover:border-white/15 hover:bg-white/6 transition-all duration-200 hover:-translate-y-0.5">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                  {link.emoji}
                </span>
                <div className="text-center">
                  <p className="text-xs font-bold text-white/80">{link.label}</p>
                  <p className="text-[10px] text-white/30">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
