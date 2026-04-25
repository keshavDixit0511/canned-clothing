// app/dashboard/leaderboard/page.tsx
"use client"

export const dynamic = "force-dynamic" 

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LeaderboardEntry {
  rank:        number
  user:        { name: string; image: string | null }
  points:      number
  plantsCount: number
}

interface Me {
  points: number
  rank:   number | null
}

const RANK_CONFIG: Record<number, { color: string; bg: string; icon: string }> = {
  1: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  icon: "🥇" },
  2: { color: "#9ca3af", bg: "rgba(156,163,175,0.12)", icon: "🥈" },
  3: { color: "#f97316", bg: "rgba(249,115,22,0.10)",  icon: "🥉" },
}

const POINT_ACTIONS = [
  { action: "Register Tin",  pts: "+100" },
  { action: "Log Growth",    pts: "+25"  },
  { action: "Reach Sprout",  pts: "+50"  },
  { action: "Reach Growing", pts: "+75"  },
  { action: "Reach Mature",  pts: "+200" },
  { action: "Daily Visit",   pts: "+10"  },
]

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([])
  const [me, setMe]           = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState<"all" | "how">("all")

  useEffect(() => {
    Promise.all([
      fetch("/api/leaderboard?limit=50").then((r) => r.ok ? r.json() : []),
      fetch("/api/leaderboard/me").then((r) => r.ok ? r.json() : null),
    ]).then(([lb, myStats]) => {
      setLeaders(Array.isArray(lb) ? lb : [])
      setMe(myStats)
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#060a06] pb-20">
      {/* Ambient */}
      <div className="pointer-events-none absolute top-16 right-0 w-96 h-96 opacity-5"
        style={{ background: "radial-gradient(circle, #fbbf24, transparent)" }} />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-24 space-y-8">

        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400 mb-1">
            Green Points
          </p>
          <h1 className="font-['Bebas_Neue',_sans-serif] text-4xl sm:text-5xl text-white leading-none">
            Leaderboard
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Earn points for every action. Climb the ranks. Grow more.
          </p>
        </div>

        {/* My rank card */}
        {me && (
          <div className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
            <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-amber-400/15 blur-xl pointer-events-none" />
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/15 text-2xl font-black text-amber-400"
                style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: 22 }}>
                {me.rank ? `#${me.rank}` : "—"}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400/70 mb-0.5">Your Rank</p>
                <p className="font-['Bebas_Neue',_sans-serif] text-3xl text-white leading-none">
                  {me.points.toLocaleString("en-IN")} pts
                </p>
              </div>
              {me.rank && me.rank > 1 && (
                <div className="text-right">
                  <p className="text-xs text-white/30">Points to next rank</p>
                  <p className="text-sm font-bold text-amber-400">
                    {leaders[me.rank - 2]
                      ? `+${(leaders[me.rank - 2].points - me.points).toLocaleString("en-IN")}`
                      : "—"
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1 w-fit">
          {(["all", "how"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                "rounded-lg px-5 py-2 text-xs font-bold transition-all duration-200",
                tab === t
                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                  : "text-white/35 hover:text-white/60"
              )}>
              {t === "all" ? "🏆 Rankings" : "⭐ How to Earn"}
            </button>
          ))}
        </div>

        {tab === "all" ? (
          <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 border-b border-white/8 px-5 py-3">
              <span className="col-span-1 text-[10px] font-bold uppercase tracking-wider text-white/30">#</span>
              <span className="col-span-5 text-[10px] font-bold uppercase tracking-wider text-white/30">Member</span>
              <span className="col-span-3 text-[10px] font-bold uppercase tracking-wider text-white/30 text-right">Plants</span>
              <span className="col-span-3 text-[10px] font-bold uppercase tracking-wider text-white/30 text-right">Points</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
              </div>
            ) : leaders.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-3xl mb-2">🏆</p>
                <p className="text-sm text-white/35">No growers yet. Be the first!</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {leaders.map((entry, i) => {
                  const cfg = RANK_CONFIG[entry.rank]
                  const isMe = entry.rank === me?.rank
                  return (
                    <div
                      key={i}
                      className={cn(
                        "grid grid-cols-12 items-center px-5 py-3 transition-colors",
                        isMe ? "bg-amber-400/8" : "hover:bg-white/4"
                      )}
                      style={{
                        opacity: 0,
                        animation: `fadeUp 0.35s ease ${i * 0.04}s both`,
                      }}
                    >
                      {/* Rank */}
                      <div className="col-span-1">
                        {cfg ? (
                          <span className="text-lg">{cfg.icon}</span>
                        ) : (
                          <span className="text-xs font-bold text-white/30">#{entry.rank}</span>
                        )}
                      </div>

                      {/* User */}
                      <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                        <div
                          className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border text-[10px] font-bold"
                          style={{
                            borderColor: cfg ? cfg.color + "40" : "rgba(255,255,255,0.1)",
                            background:  cfg ? cfg.color + "15" : "rgba(255,255,255,0.05)",
                            color:       cfg ? cfg.color : "rgba(255,255,255,0.5)",
                          }}
                        >
                          {entry.user.image
                            ? <Image src={entry.user.image} alt={entry.user.name} fill sizes="32px" className="object-cover" />
                            : getInitials(entry.user.name)
                          }
                        </div>
                        <p className={cn("text-sm font-semibold truncate", isMe ? "text-amber-300" : "text-white/80")}>
                          {entry.user.name} {isMe && "(You)"}
                        </p>
                      </div>

                      {/* Plants */}
                      <div className="col-span-3 text-right">
                        <span className="text-sm text-white/50">🌱 {entry.plantsCount}</span>
                      </div>

                      {/* Points */}
                      <div className="col-span-3 text-right">
                        <span
                          className="text-sm font-black"
                          style={{
                            color: cfg ? cfg.color : "rgba(255,255,255,0.7)",
                            fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
                            fontSize: 17,
                          }}
                        >
                          {entry.points.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-4">
              How to Earn Green Points
            </p>
            {POINT_ACTIONS.map((item) => (
              <div key={item.action}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">⭐</span>
                  <span className="text-sm text-white/70">{item.action}</span>
                </div>
                <span className="text-sm font-bold text-amber-400">{item.pts} pts</span>
              </div>
            ))}
            <p className="text-xs text-white/25 pt-2 text-center">
              Points are awarded automatically as you grow your plants and engage with the platform.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
