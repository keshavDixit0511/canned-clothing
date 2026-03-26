// app/scan/[code]/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { formatDate, timeAgo } from "@/lib/utils"
import { getPlantStageProgress } from "@/lib/helpers"
import { parseApiResponse, errorFromUnknown } from "@/lib/api-client"
import { API, ROUTES } from "@/lib/constants"
import type { GrowthLog, Plant, PlantStage, QRScanResponse } from "@/types/plant"

export const dynamic = "force-dynamic"

// ─── Types ─────────────────────────────────────────────────────────────────────

type PageState =
  | { status: "loading" }
  | { status: "unclaimed"; qrCode: string }
  | { status: "public"; plant: PublicPlant }
  | { status: "register"; qrCode: string }
  | { status: "claimed" }
  | { status: "loaded"; plant: Plant; isOwner: boolean }
  | { status: "error"; message: string }

type PublicPlant = {
  id: string
  seedType: string
  stage: PlantStage
  createdAt: string
  product: {
    id: string
    name: string
    slug: string
    seedType: string
  } | null
}

function toDateTimeLocalValue(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, "0")

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const STAGE_ORDER: PlantStage[] = ["SEEDED", "SPROUT", "GROWING", "MATURE"]

const STAGE_CONFIG: Record<PlantStage, {
  label: string; emoji: string; xp: number; maxXp: number
  color: string; glow: string; bgGlow: string; quest: string
}> = {
  SEEDED:  {
    label: "Seeded",  emoji: "🌱", xp: 100,  maxXp: 250,
    color: "text-amber-400",   glow: "#f59e0b", bgGlow: "bg-amber-500/20",
    quest: "Keep soil moist for 5 days to unlock SPROUT stage",
  },
  SPROUT:  {
    label: "Sprouting", emoji: "🌿", xp: 250, maxXp: 600,
    color: "text-lime-400",    glow: "#a3e635", bgGlow: "bg-lime-500/20",
    quest: "Move to sunlight and thin to one seedling to continue growing",
  },
  GROWING: {
    label: "Growing",  emoji: "🪴", xp: 600,  maxXp: 1000,
    color: "text-green-400",   glow: "#4ade80", bgGlow: "bg-green-500/20",
    quest: "Water deeply every 2 days — full sun unlocks MATURE stage",
  },
  MATURE:  {
    label: "Mature 🏆", emoji: "🌳", xp: 1000, maxXp: 1000,
    color: "text-emerald-400", glow: "#34d399", bgGlow: "bg-emerald-500/20",
    quest: "Your plant has reached full potential. You're an eco champion!",
  },
}

const BADGES = [
  { id: "first_scan",    emoji: "🔍", label: "First Scan",     desc: "Scanned your first tin" },
  { id: "sprout",        emoji: "🌿", label: "Sprouted",       desc: "Reached Sprout stage" },
  { id: "grower",        emoji: "🪴", label: "Green Thumb",    desc: "Reached Growing stage" },
  { id: "champion",      emoji: "🏆", label: "Eco Champion",   desc: "Fully matured a plant" },
  { id: "logger",        emoji: "📸", label: "Documenter",     desc: "Logged 3+ growth entries" },
  { id: "streak",        emoji: "🔥", label: "Daily Streak",   desc: "Visited 3 days in a row" },
]

// ─── Particle Background ──────────────────────────────────────────────────────

const PARTICLE_SPECS = Array.from({ length: 18 }, (_, index) => ({
  key: index,
  size: 2 + (index % 4),
  left: (index * 13) % 100,
  top: (index * 19) % 100,
  color: index % 3 === 0 ? "#34d399" : index % 3 === 1 ? "#a3e635" : "#6ee7b7",
  shadow: index % 2 === 0 ? "#34d39960" : "#a3e63560",
  duration: 6 + (index % 5) * 2,
  delay: (index % 5) * 0.8,
}))

function getDaysSinceCreated(createdAt: string) {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000)
}

function Particles() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {PARTICLE_SPECS.map((particle) => (
        <div
          key={particle.key}
          className="absolute rounded-full opacity-0"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            background: particle.color,
            boxShadow: `0 0 6px 2px ${particle.shadow}`,
            animation: `floatParticle ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes floatParticle {
          0%   { opacity: 0; transform: translateY(0px) scale(0.5); }
          20%  { opacity: 0.8; }
          80%  { opacity: 0.6; }
          100% { opacity: 0; transform: translateY(-120px) scale(1.2); }
        }
      `}</style>
    </div>
  )
}

// ─── XP Bar ───────────────────────────────────────────────────────────────────

function XPBar({ stage }: { stage: PlantStage }) {
  const cfg = STAGE_CONFIG[stage]
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      setWidth((cfg.xp / cfg.maxXp) * 100)
    }, 400)
    return () => clearTimeout(t)
  }, [stage, cfg.xp, cfg.maxXp])

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-white/60">XP Progress</span>
        <span className={cn("font-bold font-['Syne']", cfg.color)}>
          {cfg.xp} / {cfg.maxXp} XP
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-white/8 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${cfg.glow}80, ${cfg.glow})`,
            boxShadow: `0 0 8px ${cfg.glow}60`,
          }}
        >
          {/* Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  )
}

// ─── Stage Timeline ───────────────────────────────────────────────────────────

function StageTimeline({ stage }: { stage: PlantStage }) {
  const currentIdx = STAGE_ORDER.indexOf(stage)

  return (
    <div className="flex items-center w-full">
      {STAGE_ORDER.map((s, idx) => {
        const cfg = STAGE_CONFIG[s]
        const isDone    = idx < currentIdx
        const isCurrent = idx === currentIdx
        const isLocked  = idx > currentIdx

        return (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="relative">
                <div className={cn(
                  "h-11 w-11 rounded-full border-2 flex items-center justify-center text-xl",
                  "transition-all duration-500",
                  isCurrent ? "border-current scale-110" : isDone ? "border-white/30" : "border-white/10",
                  isCurrent ? cfg.color : "",
                  isCurrent ? cfg.bgGlow : isDone ? "bg-white/8" : "bg-white/3",
                )}>
                  {isLocked ? <span className="text-sm text-white/20">🔒</span> : cfg.emoji}
                </div>
                {isCurrent && (
                  <div
                    className="absolute inset-0 rounded-full blur-md opacity-50 animate-pulse"
                    style={{ background: cfg.glow }}
                  />
                )}
                {isDone && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 flex items-center justify-center">
                    <span className="text-[8px]">✓</span>
                  </div>
                )}
              </div>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-wider",
                isCurrent ? cfg.color : isDone ? "text-white/40" : "text-white/15"
              )}>
                {cfg.label.replace(" 🏆", "")}
              </span>
            </div>

            {idx < STAGE_ORDER.length - 1 && (
              <div className={cn(
                "h-px w-4 shrink-0 -mt-5 transition-all duration-700",
                isDone ? "bg-emerald-400/50" : "bg-white/8"
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Badge Grid ───────────────────────────────────────────────────────────────

function BadgeGrid({ plant }: { plant: Plant }) {
  const earned = new Set<string>()
  earned.add("first_scan")
  if (["SPROUT","GROWING","MATURE"].includes(plant.stage)) earned.add("sprout")
  if (["GROWING","MATURE"].includes(plant.stage)) earned.add("grower")
  if (plant.stage === "MATURE") earned.add("champion")
  if (plant.growthLogs.length >= 3) earned.add("logger")

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {BADGES.map((badge) => {
        const has = earned.has(badge.id)
        return (
          <div
            key={badge.id}
            title={has ? badge.desc : "Locked"}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl p-2.5 border transition-all duration-300",
              has
                ? "border-white/15 bg-white/8 cursor-default"
                : "border-white/5 bg-white/3 opacity-40 grayscale"
            )}
          >
            <span className="text-2xl">{badge.emoji}</span>
            <span className={cn("text-[9px] font-bold text-center leading-tight uppercase tracking-wide",
              has ? "text-white/70" : "text-white/20"
            )}>
              {badge.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Growth Log ───────────────────────────────────────────────────────────────

function GrowthLogFeed({ logs }: { logs: GrowthLog[] }) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-white/30 py-2">
        No growth logs yet. Be the first to document this plant&apos;s journey!
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {logs.map((log, idx) => (
        <li
          key={log.id}
          className={cn(
            "flex gap-3 rounded-xl border border-white/8 bg-white/3 p-3",
            "opacity-0 translate-y-2 animate-[fadeUp_0.4s_ease_forwards]"
          )}
          style={{ animationDelay: `${idx * 70}ms` }}
        >
          {log.image && (
            <div className="relative h-14 w-14 rounded-lg object-cover shrink-0 border border-white/10 overflow-hidden">
              <Image
                src={log.image}
                alt="Growth"
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white/75 leading-relaxed">
              {log.note ?? "Growth logged"}
            </p>
            <p className="mt-1 text-[11px] text-white/30">{timeAgo(log.createdAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

// ─── Add Growth Log Form ──────────────────────────────────────────────────────

function AddLogForm({
  plantId, onSuccess,
}: {
  plantId: string
  onSuccess: (log: GrowthLog) => void
}) {
  const [note, setNote]       = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [open, setOpen]       = useState(false)

  const handleSubmit = async () => {
    if (!note.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API.plantLog, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plantId, note }),
      })
      const parsed = await parseApiResponse<GrowthLog>(res)
      if (!parsed.ok) throw new Error(parsed.error)

      onSuccess(parsed.data)
      setNote("")
      setOpen(false)
    } catch (error: unknown) {
      setError(errorFromUnknown(error, "Failed to log growth"))
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "w-full rounded-xl border border-dashed border-emerald-400/30 py-3",
          "text-sm font-medium text-emerald-400/70 hover:text-emerald-400",
          "hover:border-emerald-400/50 hover:bg-emerald-400/5 transition-all duration-200"
        )}
      >
        + Log today&apos;s growth
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 space-y-3">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Describe what you see today - new leaves, height, color..."
        rows={3}
        className={cn(
          "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5",
          "text-sm text-white/80 placeholder:text-white/25 resize-none",
          "focus:outline-none focus:border-emerald-400/40 transition-colors"
        )}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={loading || !note.trim()}
          className={cn(
            "flex-1 rounded-lg bg-emerald-500 py-2 text-sm font-semibold text-white",
            "transition-all duration-200 hover:bg-emerald-400",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {loading ? "Saving..." : "Save Log"}
        </button>
        <button
          onClick={() => { setOpen(false); setNote(""); setError(null) }}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Reminder Form ────────────────────────────────────────────────────────────

function ReminderForm({ plantId }: { plantId: string }) {
  const [time, setTime]         = useState("")
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const minTime = toDateTimeLocalValue(new Date(Date.now() + 60000))

  const handleSet = async () => {
    if (!time || loading) return
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch(API.plantReminder, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plantId, time: new Date(time).toISOString() }),
      })
      const parsed = await parseApiResponse<{ id: string }>(res)
      if (!parsed.ok) throw new Error(parsed.error)

      setSuccess(true)
      setTime("")
    } catch (error: unknown) {
      setError(errorFromUnknown(error, "Failed to set reminder"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">💧</span>
        <p className="text-sm font-semibold text-white/80">Set Water Reminder</p>
      </div>

      {success ? (
        <p className="text-sm text-emerald-400 flex items-center gap-2">
          <span>✓</span> Reminder set! We&apos;ll remind you to water your plant.
        </p>
      ) : (
        <>
          <input
            type="datetime-local"
            value={time}
            min={minTime}
            onChange={(e) => {
              setTime(e.target.value)
              setSuccess(false)
            }}
            className={cn(
              "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2",
              "text-sm text-white/70 focus:outline-none focus:border-emerald-400/40",
              "transition-colors [color-scheme:dark]"
            )}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            onClick={handleSet}
            disabled={loading || !time}
            className={cn(
              "w-full rounded-lg border border-sky-400/30 bg-sky-400/10 py-2",
              "text-sm font-semibold text-sky-400 hover:bg-sky-400/20",
              "transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {loading ? "Setting..." : "Set Reminder"}
          </button>
        </>
      )}
    </div>
  )
}

// ─── Shop Nudge Card ──────────────────────────────────────────────────────────

function ShopNudge({ stage, seedType }: { stage: PlantStage; seedType: string }) {
  const nudges: Record<PlantStage, { headline: string; sub: string; cta: string }> = {
    SEEDED:  {
      headline: "🎁 Power up your seedling",
      sub:      "Get another tin and plant a companion — studies show companion planting boosts growth by 30%.",
      cta:      "Shop Companion Tins →",
    },
    SPROUT:  {
      headline: "⚡ Your sprout needs a squad",
      sub:      "Plants grow better together. Add a new tin to your garden and earn +50 XP.",
      cta:      "Add to Collection →",
    },
    GROWING: {
      headline: "🏆 You're a serious grower",
      sub:      "Unlock the Eco Champion badge faster — plant one more tin and hit MATURE twice as quick.",
      cta:      "Grow Your Garden →",
    },
    MATURE:  {
      headline: "🌟 Champion unlocked — what's next?",
      sub:      "You've maxed this plant. Start a new journey — each new tin earns 100 bonus XP.",
      cta:      "Start a New Tin →",
    },
  }

  const nudge = nudges[stage]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-950/60 to-green-950/60 p-5">
      {/* Glow */}
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none" />

      <p className="font-['Syne'] text-base font-bold text-white mb-1">{nudge.headline}</p>
      <p className="text-sm text-white/55 leading-relaxed mb-4">{nudge.sub}</p>

      <Link
        href={`/products?seedType=${encodeURIComponent(seedType)}`}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl",
          "bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5",
          "text-sm font-bold text-white transition-all duration-200",
          "hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5"
        )}
      >
        {nudge.cta}
      </Link>
    </div>
  )
}

// ─── Register Flow ────────────────────────────────────────────────────────────

function RegisterPlant({
  qrCode, onRegistered,
}: {
  qrCode: string
  onRegistered: (plant: Plant) => void
}) {
  const [seedType, setSeedType] = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleRegister = async () => {
    if (!seedType.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API.plantRegister, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ qrCode, seedType }),
      })
      const parsed = await parseApiResponse<Plant>(res)
      if (!parsed.ok) {
        if (parsed.code === "PLANT_ALREADY_REGISTERED_BY_USER") {
          const existingRes = await fetch(`${API.plants}?qrCode=${encodeURIComponent(qrCode)}`, {
            credentials: "include",
            cache: "no-store",
          })
          const existing = await parseApiResponse<QRScanResponse>(existingRes)
          if (existing.ok && existing.data.isOwner) {
            onRegistered(existing.data.plant)
            return
          }
        }

        throw new Error(parsed.error)
      }

      onRegistered(parsed.data)
    } catch (error: unknown) {
      setError(errorFromUnknown(error, "Registration failed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Particles />

      <div className="relative w-full max-w-sm space-y-6 text-center">
        {/* Scan animation */}
        <div className="relative mx-auto h-28 w-28">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
          <div className="absolute inset-3 rounded-full bg-emerald-500/15 animate-ping" style={{ animationDelay: "0.3s" }} />
          <div className="relative h-full w-full rounded-full border-2 border-emerald-400/50 bg-emerald-400/10 flex items-center justify-center">
            <span className="text-5xl animate-bounce">🌱</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400 mb-2">
            New Tin Detected
          </p>
          <h1 className="font-['Syne'] text-3xl font-black text-white">
            Claim Your Plant
          </h1>
          <p className="mt-2 text-sm text-white/50">
            This tin hasn&apos;t been activated yet. Register it to start your growing journey.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-4 text-left">
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
              What seed came in your tin?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["tomato", "basil", "marigold"].map((seed) => (
                <button
                  key={seed}
                  onClick={() => setSeedType(seed)}
                  className={cn(
                    "rounded-xl border py-2.5 text-sm font-medium capitalize transition-all duration-200",
                    seedType === seed
                      ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300"
                      : "border-white/10 bg-white/5 text-white/50 hover:text-white/80"
                  )}
                >
                  {seed === "tomato" ? "🍅" : seed === "basil" ? "🌿" : "🌼"} {seed}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            onClick={handleRegister}
            disabled={loading || !seedType}
            className={cn(
              "w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white",
              "transition-all duration-200 hover:bg-emerald-400 hover:-translate-y-0.5",
              "hover:shadow-lg hover:shadow-emerald-500/30",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
            )}
          >
            {loading ? "Activating tin..." : "Activate & Start Growing 🌱"}
          </button>
        </div>

        <p className="text-xs text-white/25">QR Code: {qrCode}</p>
      </div>
    </div>
  )
}

function PublicScanGate({
  loginHref,
  qrCode,
}: {
  loginHref: string
  qrCode: string
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Particles />
      <div className="w-full max-w-md space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
        <p className="text-5xl">🌱</p>
        <p className="font-['Syne'] text-2xl font-black text-white">
          This tin is ready to claim
        </p>
        <p className="text-sm text-white/50 leading-relaxed">
          Sign in to activate this QR code, claim ownership, and unlock reminders,
          growth logs, and points.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={loginHref}
            className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-400 transition-colors"
          >
            Sign in to claim
          </Link>
          <Link
            href="/products"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/75 hover:text-white hover:bg-white/10 transition-colors"
          >
            Browse products
          </Link>
        </div>
        <p className="text-[11px] text-white/25">QR Code: {qrCode}</p>
      </div>
    </div>
  )
}

function PublicPlantSummary({
  plant,
  loginHref,
  isAuthenticated,
}: {
  plant: PublicPlant
  loginHref: string
  isAuthenticated: boolean
}) {
  const cfg = STAGE_CONFIG[plant.stage]

  return (
    <div className="min-h-screen bg-[#050d0a]">
      <Particles />
      <div className="mx-auto max-w-lg px-4 pt-12 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-5 backdrop-blur-xl">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-2">
              QR Scan Result
            </p>
            <h1 className="font-['Syne'] text-3xl font-black text-white">
              {plant.product?.name ?? "Tin Garden"}
            </h1>
            <p className="mt-2 text-sm text-white/50">
              This tin is already claimed, so we can only show a limited public view.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <span className={cn("text-sm font-bold", cfg.color)}>
                {cfg.emoji} {cfg.label}
              </span>
              <span className="text-xs text-white/30">
                Since {formatDate(plant.createdAt)}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/65">
              {plant.seedType} • {plant.product?.seedType ?? "Seeded tin"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-2">
              What you can do
            </p>
            <p className="text-sm text-white/50 leading-relaxed">
              {isAuthenticated
                ? "View your own plants in the dashboard or continue scanning your tins."
                : "Sign in if this is your tin, or browse products to start a new one."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={isAuthenticated ? "/dashboard/plants" : loginHref}
              className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-400 transition-colors text-center"
            >
              {isAuthenticated ? "Open dashboard" : "Sign in"}
            </Link>
            <Link
              href="/products"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/75 hover:text-white hover:bg-white/10 transition-colors text-center"
            >
              Shop more tins
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ScanPage() {
  const params  = useParams()
  const router  = useRouter()
  const codeParam = params.code
  const code = Array.isArray(codeParam) ? codeParam[0] : codeParam
  const loginHref = `${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.scan(code ?? ""))}`

  const [state, setState]           = useState<PageState>({ status: "loading" })
  const [logs, setLogs]             = useState<GrowthLog[]>([])
  const [activeTab, setActiveTab]   = useState<"overview" | "logs" | "guide" | "badges">("overview")
  const [justRegistered, setJustRegistered] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (!code?.trim()) {
      setState({ status: "error", message: "Invalid QR code" })
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const [profileRes, plantRes] = await Promise.all([
          fetch(API.profile, {
            credentials: "include",
            cache: "no-store",
          }),
          fetch(`${API.plants}?qrCode=${encodeURIComponent(code)}`, {
            credentials: "include",
            cache: "no-store",
          }),
        ])

        const profile = profileRes.ok ? await profileRes.json() : null
        const authed = Boolean(profile?.email)
        const parsed = await parseApiResponse<QRScanResponse>(plantRes)

        if (cancelled) return
        setIsAuthenticated(authed)

        if (!parsed.ok) {
          if (parsed.status === 404) {
            setLogs([])
            setJustRegistered(false)
            setState({ status: "unclaimed", qrCode: code })
            return
          }

          if (parsed.status === 401) {
            router.push(loginHref)
            return
          }

          throw new Error(parsed.error)
        }

        if (!parsed.data.isOwner) {
          setLogs([])
          setJustRegistered(false)
          setState({ status: "public", plant: parsed.data.plant as PublicPlant })
          return
        }

        setLogs(parsed.data.plant.growthLogs ?? [])
        setJustRegistered(false)
        setState({ status: "loaded", plant: parsed.data.plant, isOwner: true })
      } catch (error: unknown) {
        if (!cancelled) {
          setState({
            status: "error",
            message: errorFromUnknown(error, "Failed to load plant"),
          })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [code, loginHref, router])

  useEffect(() => {
    if (!justRegistered) return

    const timeout = window.setTimeout(() => setJustRegistered(false), 5000)
    return () => window.clearTimeout(timeout)
  }, [justRegistered])

  const handleRegistered = (plant: Plant) => {
    setLogs(plant.growthLogs ?? [])
    setJustRegistered(true)
    setState({ status: "loaded", plant, isOwner: true })
  }

  const handleLogAdded = (log: GrowthLog) => {
    setLogs((prev) => [log, ...prev])
    setState((prev) =>
      prev.status === "loaded"
        ? {
            ...prev,
            plant: {
              ...prev.plant,
              growthLogs: [log, ...(prev.plant.growthLogs ?? [])],
            },
          }
        : prev
    )
  }

  // ── Loading ──
  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Particles />
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
          <p className="text-sm text-white/40 font-medium">Reading QR code...</p>
        </div>
      </div>
    )
  }

  // ── Error ──
  if (state.status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-4xl">⚠️</p>
          <p className="font-['Syne'] text-xl font-bold text-white">Something went wrong</p>
          <p className="text-sm text-white/50">{state.message}</p>
          <button onClick={() => router.back()} className="text-sm text-emerald-400 underline">
            Go back
          </button>
        </div>
      </div>
    )
  }

  // ── Claimed by someone else ──
  if (state.status === "unclaimed") {
    return (
      <div className="min-h-screen bg-[#050d0a]">
        {isAuthenticated ? (
          <RegisterPlant qrCode={state.qrCode} onRegistered={handleRegistered} />
        ) : (
          <PublicScanGate loginHref={loginHref} qrCode={state.qrCode} />
        )}
      </div>
    )
  }

  if (state.status === "public") {
    return (
      <PublicPlantSummary
        plant={state.plant}
        loginHref={loginHref}
        isAuthenticated={isAuthenticated}
      />
    )
  }

  if (state.status === "claimed") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Particles />
        <div className="text-center space-y-4 max-w-xs">
          <p className="text-5xl">🔒</p>
          <h2 className="font-['Syne'] text-2xl font-black text-white">Already Claimed</h2>
          <p className="text-sm text-white/50">
            This tin has already been registered by another grower. Each tin can only be claimed once.
          </p>
          <Link
            href="/products"
            className="inline-block rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-400 transition-colors"
          >
            Get Your Own Tin →
          </Link>
        </div>
      </div>
    )
  }

  // ── Register flow ──
  if (state.status === "register") {
    return (
      <div className="min-h-screen bg-[#050d0a]">
        <RegisterPlant qrCode={state.qrCode} onRegistered={handleRegistered} />
      </div>
    )
  }

  // ── Full plant dashboard ──
  const { plant } = state
  const cfg = STAGE_CONFIG[plant.stage]

  const tabs = [
    { id: "overview", label: "Overview",  emoji: "🌿" },
    { id: "logs",     label: "Growth Log", emoji: "📸" },
    { id: "guide",    label: "Care Guide", emoji: "📖" },
    { id: "badges",   label: "Badges",    emoji: "🏆" },
  ] as const

  return (
    <div className="min-h-screen bg-[#050d0a] pb-20">
      <Particles />

      {/* ── Just registered banner ── */}
      {justRegistered && (
        <div className="sticky top-0 z-50 bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-white animate-[slideDown_0.4s_ease]">
          🎉 Tin activated! +100 XP earned. Your growing journey begins now.
        </div>
      )}

      <div className="mx-auto max-w-lg px-4 pt-8 space-y-6">

        {/* ── Hero card ── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a1f14] to-[#071209] p-6">
          {/* Big ambient glow */}
          <div
            className="absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: cfg.glow }}
          />
          <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-1">
                {plant.product?.name ?? "Tin Garden"}
              </p>
              <h1 className="font-['Syne'] text-3xl font-black text-white leading-tight capitalize">
                {plant.seedType} Plant
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <span className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-bold",
                  cfg.color,
                  cfg.bgGlow,
                  "border-current/30"
                )}>
                  {cfg.emoji} {cfg.label}
                </span>
                <span className="text-xs text-white/30">
                  Since {formatDate(plant.createdAt)}
                </span>
              </div>
            </div>

            {/* Big emoji */}
            <div
              className="text-6xl relative"
              style={{ filter: `drop-shadow(0 0 12px ${cfg.glow}80)` }}
            >
              {cfg.emoji}
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-5">
            <XPBar stage={plant.stage} />
          </div>

          {/* Current quest */}
          <div className="mt-4 rounded-xl border border-white/8 bg-white/3 px-3 py-2.5 flex items-start gap-2">
            <span className="text-base shrink-0">⚔️</span>
            <p className="text-xs text-white/55 leading-relaxed">
              <span className="font-semibold text-white/80">Active Quest: </span>
              {cfg.quest}
            </p>
          </div>
        </div>

        {/* ── Stage timeline ── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-4">
            Growth Journey
          </p>
          <StageTimeline stage={plant.stage} />
        </div>

        {/* ── Shop nudge ── */}
        <ShopNudge stage={plant.stage} seedType={plant.seedType} />

        {/* ── Tabs ── */}
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 rounded-lg py-2 text-xs font-semibold transition-all duration-200",
                activeTab === tab.id
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                  : "text-white/35 hover:text-white/60"
              )}
            >
              <span className="hidden sm:inline">{tab.emoji} </span>{tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div className="space-y-4" key={activeTab}>

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="space-y-4 animate-[fadeUp_0.3s_ease]">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Stage Progress", value: `${Math.round(getPlantStageProgress(plant.stage) * 100)}%`, emoji: "📈" },
                  { label: "Growth Logs",    value: logs.length,    emoji: "📸" },
                  { label: "Days Growing",
                    value: getDaysSinceCreated(plant.createdAt),
                    emoji: "📅" },
                  { label: "XP Earned",      value: `${cfg.xp} XP`, emoji: "⭐" },
                ].map(({ label, value, emoji }) => (
                  <div key={label} className="rounded-xl border border-white/8 bg-white/5 p-3.5">
                    <span className="text-xl">{emoji}</span>
                    <p className="font-['Syne'] text-2xl font-bold text-white mt-1">{value}</p>
                    <p className="text-[11px] text-white/40 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <ReminderForm plantId={plant.id} />
            </div>
          )}

          {/* Growth Logs */}
          {activeTab === "logs" && (
            <div className="space-y-3 animate-[fadeUp_0.3s_ease]">
              <AddLogForm plantId={plant.id} onSuccess={handleLogAdded} />
              <GrowthLogFeed logs={logs} />
            </div>
          )}

          {/* Care Guide */}
          {activeTab === "guide" && (
            <div className="animate-[fadeUp_0.3s_ease]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                  {plant.seedType} Care Guide
                </p>
                {STAGE_ORDER.map((s) => {
                  const c = STAGE_CONFIG[s]
                  const isActive = s === plant.stage
                  const isLocked = STAGE_ORDER.indexOf(s) > STAGE_ORDER.indexOf(plant.stage)
                  return (
                    <div
                      key={s}
                      className={cn(
                        "rounded-xl border p-3.5 transition-all",
                        isActive ? "border-emerald-400/30 bg-emerald-400/8" : "border-white/8 bg-white/3",
                        isLocked ? "opacity-40" : ""
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span>{isLocked ? "🔒" : c.emoji}</span>
                        <span className={cn("text-sm font-bold", isActive ? c.color : "text-white/60")}>
                          {c.label}
                        </span>
                        <span className="ml-auto text-[10px] text-white/25">{c.xp} XP</span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">{c.quest}</p>
                    </div>
                  )
                })}
                <Link
                  href={`/dashboard/plants`}
                  className="block text-center text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors"
                >
                  View full plant dashboard →
                </Link>
              </div>
            </div>
          )}

          {/* Badges */}
          {activeTab === "badges" && (
            <div className="animate-[fadeUp_0.3s_ease]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                  Your Achievements
                </p>
                <BadgeGrid plant={{ ...plant, growthLogs: logs }} />
                <p className="text-xs text-white/25 text-center">
                  {Object.values(BADGES).length - [...new Set([
                    "first_scan",
                    ...(["SPROUT","GROWING","MATURE"].includes(plant.stage) ? ["sprout"] : []),
                    ...(["GROWING","MATURE"].includes(plant.stage) ? ["grower"] : []),
                    ...(plant.stage === "MATURE" ? ["champion"] : []),
                    ...(logs.length >= 3 ? ["logger"] : []),
                  ])].length} badges still locked — keep growing to unlock them all
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}
