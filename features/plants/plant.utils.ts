// features/plants/plant.utils.ts

import { PlantStage } from "@prisma/client"

// ─── Stage order ──────────────────────────────────────────────────────────────

export const STAGE_ORDER: PlantStage[] = [
  PlantStage.SEEDED,
  PlantStage.SPROUT,
  PlantStage.GROWING,
  PlantStage.MATURE,
]

// ─── XP values per stage ─────────────────────────────────────────────────────

export const STAGE_XP: Record<PlantStage, number> = {
  SEEDED:  100,
  SPROUT:  250,
  GROWING: 600,
  MATURE:  1000,
}

// ─── Points awarded when reaching a stage ────────────────────────────────────

export const STAGE_POINTS: Partial<Record<PlantStage, number>> = {
  SPROUT:  50,
  GROWING: 75,
  MATURE:  200,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the next stage or null if already MATURE.
 */
export function getNextStage(stage: PlantStage): PlantStage | null {
  const idx = STAGE_ORDER.indexOf(stage)
  if (idx === -1 || idx === STAGE_ORDER.length - 1) return null
  return STAGE_ORDER[idx + 1]
}

/**
 * Returns 0–1 progress fraction for current stage.
 */
export function getStageProgress(stage: PlantStage): number {
  const idx = STAGE_ORDER.indexOf(stage)
  if (idx === -1) return 0
  return idx / (STAGE_ORDER.length - 1)
}

/**
 * Returns true if stage B is after stage A.
 */
export function isStageAfter(a: PlantStage, b: PlantStage): boolean {
  return STAGE_ORDER.indexOf(b) > STAGE_ORDER.indexOf(a)
}

/**
 * Returns days since a given date.
 */
export function daysSince(date: Date | string): number {
  return Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  )
}

/**
 * Generate a unique QR code string for a new tin.
 * Format: DK-<timestamp>-<random>
 */
export function generateQRCode(): string {
  const ts  = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `DK-${ts}-${rnd}`
}