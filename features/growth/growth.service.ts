// features/growth/growth.service.ts

import { prisma } from "@/server/db/prisma"
import { PlantStage } from "@prisma/client"

// ─── Stage progression order ───────────────────────────────────────────────────

const STAGE_ORDER: PlantStage[] = [
  PlantStage.SEEDED,
  PlantStage.SPROUT,
  PlantStage.GROWING,
  PlantStage.MATURE,
]

// Points awarded per action
const POINTS = {
  LOG_GROWTH:     25,
  REACH_SPROUT:   50,
  REACH_GROWING:  75,
  REACH_MATURE:   200,
}

// ─── GrowthService ─────────────────────────────────────────────────────────────

export class GrowthService {

  /**
   * Add a growth log entry for a plant.
   * Verifies plant belongs to the user before creating.
   * Awards leaderboard points automatically.
   */
  static async addLog({
    plantId,
    userId,
    note,
    image,
  }: {
    plantId: string
    userId:  string
    note?:   string | null
    image?:  string | null
  }) {
    // Verify plant belongs to this user
    const plant = await prisma.plant.findFirst({
      where: { id: plantId, userId },
    })

    if (!plant) {
      throw new Error("Plant not found or does not belong to this user")
    }

    // Create the growth log
    const log = await prisma.growthLog.create({
      data: {
        plantId,
        userId,
        note:  note  ?? null,
        image: image ?? null,
      },
    })

    // Award Green Points for logging
    await GrowthService.awardPoints(userId, POINTS.LOG_GROWTH)

    return log
  }

  /**
   * Get all growth logs for a plant.
   * Verifies plant belongs to the user.
   */
  static async getLogs({
    plantId,
    userId,
  }: {
    plantId: string
    userId:  string
  }) {
    // Verify ownership
    const plant = await prisma.plant.findFirst({
      where: { id: plantId, userId },
    })

    if (!plant) {
      throw new Error("Plant not found or does not belong to this user")
    }

    return prisma.growthLog.findMany({
      where:   { plantId },
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Advance a plant to the next stage.
   * Returns the updated plant.
   * Awards bonus points for reaching a new stage.
   */
  static async advanceStage({
    plantId,
    userId,
  }: {
    plantId: string
    userId:  string
  }) {
    const plant = await prisma.plant.findFirst({
      where: { id: plantId, userId },
    })

    if (!plant) {
      throw new Error("Plant not found or does not belong to this user")
    }

    const currentIndex = STAGE_ORDER.indexOf(plant.stage)

    // Already at final stage
    if (currentIndex === STAGE_ORDER.length - 1) {
      throw new Error("Plant is already at the MATURE stage")
    }

    const nextStage = STAGE_ORDER[currentIndex + 1]

    const updated = await prisma.plant.update({
      where: { id: plantId },
      data:  { stage: nextStage },
    })

    // Award bonus points for reaching new stage
    const stagePoints: Partial<Record<PlantStage, number>> = {
      [PlantStage.SPROUT]:  POINTS.REACH_SPROUT,
      [PlantStage.GROWING]: POINTS.REACH_GROWING,
      [PlantStage.MATURE]:  POINTS.REACH_MATURE,
    }

    const bonus = stagePoints[nextStage]
    if (bonus) {
      await GrowthService.awardPoints(userId, bonus)
    }

    return updated
  }

  /**
   * Get a single growth log by ID.
   */
  static async getLogById(logId: string) {
    return prisma.growthLog.findUnique({
      where: { id: logId },
    })
  }

  /**
   * Delete a growth log.
   * Only the owner can delete their log.
   */
  static async deleteLog({
    logId,
    userId,
  }: {
    logId:  string
    userId: string
  }) {
    const log = await prisma.growthLog.findFirst({
      where: { id: logId, userId },
    })

    if (!log) {
      throw new Error("Log not found or does not belong to this user")
    }

    return prisma.growthLog.delete({
      where: { id: logId },
    })
  }

  /**
   * Award Green Points to a user on the leaderboard.
   * Creates a leaderboard entry if one doesn't exist yet.
   */
  static async awardPoints(userId: string, points: number) {
    return prisma.leaderboard.upsert({
      where:  { userId },
      update: { points: { increment: points } },
      create: { userId, points },
    })
  }

  /**
   * Get the current stage progress as a 0–1 fraction.
   */
  static getStageProgress(stage: PlantStage): number {
    const index = STAGE_ORDER.indexOf(stage)
    return index / (STAGE_ORDER.length - 1)
  }

  /**
   * Get the next stage for a plant, or null if already MATURE.
   */
  static getNextStage(stage: PlantStage): PlantStage | null {
    const index = STAGE_ORDER.indexOf(stage)
    if (index === -1 || index === STAGE_ORDER.length - 1) return null
    return STAGE_ORDER[index + 1]
  }
}