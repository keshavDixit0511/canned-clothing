// components/home/LeaderboardSection.tsx

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useInView } from "@/hooks"

interface LeaderboardEntry {
  rank:        number
  user:        { name: string; image: string | null }
  points:      number
  plantsCount: number
}

const RANK_CONFIG: Record<number, { color: string; bg: string; icon: string }> = {
  1: { color: "#fbbf24", bg: "rgba(251,191,36,0.15)",  icon: "🥇" },
  2: { color: "#9ca3af", bg: "rgba(156,163,175,0.15)", icon: "🥈" },
  3: { color: "#f97316", bg: "rgba(249,115,22,0.12)",  icon: "🥉" },
}

const MOCK_LEADERS: LeaderboardEntry[] = [
  { rank: 1, user: { name: "Arjun Sharma",  image: null }, points: 4820, plantsCount: 7 },
  { rank: 2, user: { name: "Priya Nair",    image: null }, points: 3990, plantsCount: 6 },
  { rank: 3, user: { name: "Dev Malhotra",  image: null }, points: 3450, plantsCount: 5 },
  { rank: 4, user: { name: "Sneha Gupta",   image: null }, points: 2810, plantsCount: 4 },
  { rank: 5, user: { name: "Rohan Iyer",    image: null }, points: 2100, plantsCount: 3 },
]

const POINT_ACTIONS = [
  { action: "Register Tin",  pts: "+100 pts" },
  { action: "Log Growth",    pts: "+25 pts"  },
  { action: "Reach Sprout",  pts: "+50 pts"  },
  { action: "Fully Mature",  pts: "+200 pts" },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

export function LeaderboardSection() {
  const { ref, inView } = useInView(0.15)
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    fetch("/api/leaderboard?limit=5")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setLeaders(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => {})
  }, [])

  const display = leaders.length > 0 ? leaders : MOCK_LEADERS

  return (
    <section className="relative py-28 bg-[#060a06] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

      <div ref={ref} className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: copy + points ── */}
          <div
            style={{
              opacity:    inView ? 1 : 0,
              transform:  inView ? "translateX(0)" : "translateX(-24px)",
              transition: "all 0.8s ease",
            }}
          >
            <p
              className="mb-3 text-xs font-bold tracking-[0.35em] text-amber-400 uppercase"
              style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
            >
              Green Points · Community
            </p>
            <h2
              className="text-white mb-5"
              style={{
                fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
                fontSize:   "clamp(40px, 5vw, 72px)",
                lineHeight: 0.95,
              }}
            >
              Who&apos;s Growing
              <br />
              <span className="text-amber-400">The Most?</span>
            </h2>

            <p
              className="text-sm leading-relaxed text-white/45 mb-8 max-w-sm"
              style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
            >
              Every time you water your plant, log a growth update, or buy a new tin — you earn
              Green Points. Climb the leaderboard. Show the world your garden.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {POINT_ACTIONS.map((item) => (
                <div
                  key={item.action}
                  className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-3.5 py-2.5"
                >
                  <span
                    className="text-xs text-white/50"
                    style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                  >
                    {item.action}
                  </span>
                  <span
                    className="text-xs font-bold text-amber-400"
                    style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                  >
                    {item.pts}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/dashboard/leaderboard"
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-6 py-3 text-sm font-bold text-amber-400 hover:bg-amber-400/20 transition-all duration-200"
              style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
            >
              🏆 View Full Leaderboard
            </Link>
          </div>

          {/* ── Right: leaderboard table ── */}
          <div
            style={{
              opacity:    inView ? 1 : 0,
              transform:  inView ? "translateX(0)" : "translateX(24px)",
              transition: "all 0.8s ease 0.15s",
            }}
          >
            <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">

              {/* Table header */}
              <div className="border-b border-white/8 px-5 py-3.5 flex items-center justify-between">
                <span
                  className="text-xs font-bold text-white/40 uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                >
                  Top Growers
                </span>
                <span
                  className="flex items-center gap-1.5 text-xs text-emerald-400"
                  style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/5">
                {display.map((entry, i) => {
                  const cfg = RANK_CONFIG[entry.rank] ?? {
                    color: "#6b7280",
                    bg:    "transparent",
                    icon:  `${entry.rank}`,
                  }
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/4 transition-colors"
                      style={{
                        opacity:   inView ? 1 : 0,
                        animation: inView ? `fadeUp 0.4s ease ${0.1 + i * 0.08}s both` : "none",
                      }}
                    >
                      {/* Rank badge */}
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {entry.rank <= 3 ? cfg.icon : `#${entry.rank}`}
                      </div>

                      {/* Avatar */}
                      <div
                        className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border text-xs font-bold"
                        style={{
                          borderColor: cfg.color + "30",
                          background:  cfg.color + "12",
                          color:       cfg.color,
                          fontFamily:  "var(--font-dm, 'DM Sans', sans-serif)",
                        }}
                      >
                        {entry.user.image ? (
                          <Image
                            src={entry.user.image}
                            alt={entry.user.name}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        ) : (
                          getInitials(entry.user.name)
                        )}
                      </div>

                      {/* Name + plants */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="truncate text-sm font-semibold text-white/85"
                          style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                        >
                          {entry.user.name}
                        </p>
                        <p
                          className="text-xs text-white/30"
                          style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                        >
                          🌱 {entry.plantsCount} plants grown
                        </p>
                      </div>

                      {/* Points */}
                      <div className="text-right shrink-0">
                        <p
                          className="font-black"
                          style={{
                            color:      cfg.color,
                            fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
                            fontSize:   18,
                          }}
                        >
                          {entry.points.toLocaleString("en-IN")}
                        </p>
                        <p
                          className="text-[10px] text-white/25"
                          style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                        >
                          pts
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
