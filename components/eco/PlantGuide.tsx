// components/eco/PlantGuide.tsx
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────

type PlantStage = "SEEDED" | "SPROUT" | "GROWING" | "MATURE"

interface StageDetail {
  emoji:     string
  days:      string
  tip:       string
  waterNote: string
  color:     string
  glow:      string
}

interface SeedGuide {
  displayName:    string
  description:    string
  difficulty:     "Easy" | "Medium" | "Hard"
  waterFrequency: string
  sunlight:       string
  stages:         Record<PlantStage, StageDetail>
}

interface PlantGuideProps {
  seedType?:     string
  currentStage?: PlantStage
  className?:    string
}

// ─── Seed Data ─────────────────────────────────────────────────────────────────

const STAGE_ORDER: PlantStage[] = ["SEEDED", "SPROUT", "GROWING", "MATURE"]

const SEED_GUIDES: Record<string, SeedGuide> = {
  tomato: {
    displayName:    "Tomato",
    description:    "Rewarding for beginners. Grows vigorously in repurposed tins with deep watering.",
    difficulty:     "Easy",
    waterFrequency: "Every 2 days",
    sunlight:       "6–8 hrs / day",
    stages: {
      SEEDED: {
        emoji: "🌱", days: "Day 1–5",
        tip: "Keep soil consistently moist. Place in a warm spot (21–27°C). Cover loosely with plastic wrap to retain humidity until germination.",
        waterNote: "Mist lightly twice daily.",
        color: "text-amber-400", glow: "bg-amber-500",
      },
      SPROUT: {
        emoji: "🌿", days: "Day 6–14",
        tip: "Move to bright indirect light. Thin to the single strongest sprout by snipping — don't pull, it disturbs roots.",
        waterNote: "Water when top 1 cm feels dry.",
        color: "text-lime-400", glow: "bg-lime-500",
      },
      GROWING: {
        emoji: "🪴", days: "Day 15–40",
        tip: "Move to full sun. Add a small bamboo stake for support. Watch for leaf curl — usually a sign of underwatering.",
        waterNote: "Deep water every 2 days.",
        color: "text-green-400", glow: "bg-green-500",
      },
      MATURE: {
        emoji: "🍅", days: "Day 41+",
        tip: "Harvest when fully red and slightly soft to touch. Pinch off suckers (side shoots between stem and branch) to keep energy in fruit.",
        waterNote: "Reduce slightly as fruits ripen.",
        color: "text-emerald-400", glow: "bg-emerald-500",
      },
    },
  },
  basil: {
    displayName:    "Basil",
    description:    "A fragrant kitchen herb. Thrives in tins on a sunny windowsill and grows back after harvest.",
    difficulty:     "Easy",
    waterFrequency: "Daily",
    sunlight:       "4–6 hrs / day",
    stages: {
      SEEDED: {
        emoji: "🌱", days: "Day 1–7",
        tip: "Sow 2–3 seeds per tin at 5mm depth. Keep at room temperature. Germination is slow — be patient for up to 10 days.",
        waterNote: "Mist lightly, never waterlog.",
        color: "text-amber-400", glow: "bg-amber-500",
      },
      SPROUT: {
        emoji: "🌿", days: "Day 8–16",
        tip: "Thin to the strongest seedling. Keep in bright indirect light. Basil hates cold drafts — keep away from AC vents.",
        waterNote: "Water when soil surface is dry.",
        color: "text-lime-400", glow: "bg-lime-500",
      },
      GROWING: {
        emoji: "🪴", days: "Day 17–35",
        tip: "Pinch flower buds the moment they appear — this keeps the plant producing leaves instead of going to seed.",
        waterNote: "Water daily in warm weather.",
        color: "text-green-400", glow: "bg-green-500",
      },
      MATURE: {
        emoji: "🌾", days: "Day 36+",
        tip: "Harvest from the top, cutting just above a leaf node. Never remove more than one-third of the plant at once — it will keep regrowing.",
        waterNote: "Consistent daily watering.",
        color: "text-emerald-400", glow: "bg-emerald-500",
      },
    },
  },
  marigold: {
    displayName:    "Marigold",
    description:    "A resilient flowering plant that naturally repels pests. Brightens any tin garden effortlessly.",
    difficulty:     "Easy",
    waterFrequency: "Every 3 days",
    sunlight:       "6+ hrs / day",
    stages: {
      SEEDED: {
        emoji: "🌱", days: "Day 1–7",
        tip: "Plant seeds 5mm deep. Marigolds need warmth to germinate — keep above 18°C. They're fast; expect to see green in 5–7 days.",
        waterNote: "Keep moist, not saturated.",
        color: "text-amber-400", glow: "bg-amber-500",
      },
      SPROUT: {
        emoji: "🌿", days: "Day 8–20",
        tip: "Thin to the strongest seedling once two true leaves appear. Move to a south-facing windowsill for maximum light.",
        waterNote: "Water at base, avoid leaves.",
        color: "text-lime-400", glow: "bg-lime-500",
      },
      GROWING: {
        emoji: "🪴", days: "Day 21–45",
        tip: "Pinch the central growing tip early on to encourage a bushier plant with more flowers. Rotate the tin every 2–3 days for even growth.",
        waterNote: "Every 3 days, deeply.",
        color: "text-green-400", glow: "bg-green-500",
      },
      MATURE: {
        emoji: "🌼", days: "Day 46+",
        tip: "Deadhead (remove) spent flowers promptly to trigger new blooms. The roots naturally produce thiophenes that deter soil nematodes.",
        waterNote: "Reduce in cooler weather.",
        color: "text-emerald-400", glow: "bg-emerald-500",
      },
    },
  },
}

const FALLBACK_SEED = "tomato"

const DIFFICULTY_STYLES = {
  Easy:   "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  Medium: "text-amber-400  border-amber-400/30  bg-amber-400/10",
  Hard:   "text-rose-400   border-rose-400/30   bg-rose-400/10",
}

// ─── Stage Node ────────────────────────────────────────────────────────────────

function StageNode({
  stage, info, isActive, isPast, isCurrent, onClick,
}: {
  stage:     PlantStage
  info:      StageDetail
  isActive:  boolean
  isPast:    boolean
  isCurrent: boolean
  onClick:   () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 flex-1 focus:outline-none group"
    >
      <div className="relative">
        <div className={cn(
          "h-10 w-10 rounded-full border-2 flex items-center justify-center text-lg",
          "transition-all duration-300",
          isActive
            ? "border-emerald-400 bg-emerald-400/20 scale-110 shadow-lg shadow-emerald-900/30"
            : isPast
            ? "border-emerald-400/40 bg-emerald-400/8"
            : "border-white/12 bg-white/4 group-hover:border-white/25"
        )}>
          {info.emoji}
        </div>
        {isActive && (
          <div className={cn("absolute inset-0 rounded-full blur-lg opacity-35 pointer-events-none", info.glow)} />
        )}
        {isCurrent && (
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#0d1117] animate-pulse" />
        )}
      </div>
      <span className={cn(
        "text-[10px] font-semibold uppercase tracking-wide transition-colors",
        isActive ? info.color : "text-white/30 group-hover:text-white/50"
      )}>
        {stage.charAt(0) + stage.slice(1).toLowerCase()}
      </span>
    </button>
  )
}

// ─── PlantGuide ────────────────────────────────────────────────────────────────

export function PlantGuide({ seedType, currentStage, className }: PlantGuideProps) {
  const normalizedSeed  = seedType?.toLowerCase() ?? ""
  const resolvedSeed    = SEED_GUIDES[normalizedSeed] ? normalizedSeed : FALLBACK_SEED
  const availableSeeds  = Object.keys(SEED_GUIDES)

  const [selectedSeed, setSelectedSeed] = useState<string>(resolvedSeed)
  const [activeStage,  setActiveStage]  = useState<PlantStage>(currentStage ?? "SEEDED")

  const guide       = SEED_GUIDES[selectedSeed]
  const stageDetail = guide.stages[activeStage]
  const activeIdx   = STAGE_ORDER.indexOf(activeStage)

  const handleSeedChange = (seed: string) => {
    setSelectedSeed(seed)
    setActiveStage(currentStage ?? "SEEDED")
  }

  return (
    <div className={cn("w-full", className)}>

      {/* Header */}
      <div className="mb-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Care Guide
        </p>
        <h2 className="font-['Syne'] text-2xl font-bold text-white">
          Grow Your Tin Garden
        </h2>
      </div>

      {/* Seed tabs */}
      {!seedType && (
        <div className="mb-4 flex flex-wrap gap-2">
          {availableSeeds.map((seed) => {
            const g = SEED_GUIDES[seed]
            return (
              <button
                key={seed}
                onClick={() => handleSeedChange(seed)}
                className={cn(
                  "rounded-xl px-3.5 py-1.5 text-sm font-medium border transition-all duration-200",
                  selectedSeed === seed
                    ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300"
                    : "border-white/10 bg-white/5 text-white/50 hover:text-white/80 hover:border-white/20"
                )}
              >
                {g.stages.MATURE.emoji} {g.displayName}
              </button>
            )
          })}
        </div>
      )}

      {/* Main card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-green-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-emerald-500/8 blur-3xl pointer-events-none" />

        {/* Seed header */}
        <div className="mb-5 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-['Syne'] text-xl font-bold text-white">{guide.displayName}</h3>
            <p className="mt-1 text-sm text-white/50 max-w-sm leading-relaxed">{guide.description}</p>
          </div>
          <span className={cn(
            "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            DIFFICULTY_STYLES[guide.difficulty]
          )}>
            {guide.difficulty}
          </span>
        </div>

        {/* Quick stat chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { icon: "💧", text: guide.waterFrequency },
            { icon: "☀️", text: guide.sunlight },
            { icon: "🌿", text: "Eco-friendly" },
          ].map(({ icon, text }) => (
            <div key={text}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="text-sm">{icon}</span>
              <span className="text-xs text-white/55">{text}</span>
            </div>
          ))}
        </div>

        {/* Stage timeline */}
        <div className="mb-6 flex items-center">
          {STAGE_ORDER.map((stage, idx) => (
            <div key={stage} className="flex items-center flex-1">
              <StageNode
                stage={stage}
                info={guide.stages[stage]}
                isActive={stage === activeStage}
                isPast={idx < activeIdx}
                isCurrent={stage === currentStage}
                onClick={() => setActiveStage(stage)}
              />
              {idx < STAGE_ORDER.length - 1 && (
                <div className={cn(
                  "h-px w-4 shrink-0 -mt-5 transition-all duration-500",
                  idx < activeIdx ? "bg-emerald-400/40" : "bg-white/10"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Stage detail panel — key forces re-mount for animation */}
        <div
          key={activeStage}
          className="rounded-xl border border-white/10 bg-white/5 p-4 animate-[fadeUp_0.3s_ease_forwards] opacity-0"
        >
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{stageDetail.emoji}</span>
              <span className={cn("text-sm font-bold", stageDetail.color)}>
                {activeStage.charAt(0) + activeStage.slice(1).toLowerCase()} Stage
              </span>
              {activeStage === currentStage && (
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  Your plant is here
                </span>
              )}
            </div>
            <span className="text-xs text-white/30">{stageDetail.days}</span>
          </div>

          <p className="text-sm text-white/70 leading-relaxed mb-3">{stageDetail.tip}</p>

          <div className="flex items-center gap-2 rounded-lg border border-sky-400/20 bg-sky-400/8 px-3 py-2">
            <span className="text-base">💧</span>
            <span className="text-xs text-sky-300/80">{stageDetail.waterNote}</span>
          </div>
        </div>

        {/* Stage navigation */}
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => activeIdx > 0 && setActiveStage(STAGE_ORDER[activeIdx - 1])}
            disabled={activeIdx === 0}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
              activeIdx === 0
                ? "cursor-not-allowed border-white/5 text-white/15"
                : "border-white/10 text-white/50 hover:border-white/25 hover:text-white/80"
            )}
          >
            ← Prev Stage
          </button>
          <button
            onClick={() => activeIdx < STAGE_ORDER.length - 1 && setActiveStage(STAGE_ORDER[activeIdx + 1])}
            disabled={activeIdx === STAGE_ORDER.length - 1}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
              activeIdx === STAGE_ORDER.length - 1
                ? "cursor-not-allowed border-white/5 text-white/15"
                : "border-white/10 text-white/50 hover:border-white/25 hover:text-white/80"
            )}
          >
            Next Stage →
          </button>
        </div>
      </div>
    </div>
  )
}