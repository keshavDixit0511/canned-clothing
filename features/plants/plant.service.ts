// features/plants/plant.service.ts

import { prisma }        from "@/server/db/prisma"
import { PlantStage }    from "@prisma/client"
import { STAGE_POINTS, getNextStage } from "./plant.utils"
import type { RegisterPlantInput } from "./plant.types"

const PLANT_INCLUDE = {
  product: {
    select: { id: true, name: true, slug: true, seedType: true },
  },
  growthLogs: {
    orderBy: { createdAt: "desc" as const },
  },
}

export class PlantService {

  /**
   * Get all plants for a user.
   */
  static async getUserPlants(userId: string) {
    return prisma.plant.findMany({
      where:   { userId },
      include: PLANT_INCLUDE,
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Get a plant by QR code.
   * Returns { plant, isOwner }.
   */
  static async getByQRCode(qrCode: string, userId: string) {
    const plant = await prisma.plant.findUnique({
      where:   { qrCode },
      include: PLANT_INCLUDE,
    })

    if (!plant) return null

    return { plant, isOwner: plant.userId === userId }
  }

  /**
   * Get a plant by ID. Verifies ownership.
   */
  static async getById(plantId: string, userId: string) {
    const plant = await prisma.plant.findFirst({
      where:   { id: plantId, userId },
      include: PLANT_INCLUDE,
    })
    if (!plant) throw new Error("Plant not found")
    return plant
  }

  /**
   * Register a new plant from a QR code scan.
   * Throws if QR code already claimed.
   */
  static async register(userId: string, input: RegisterPlantInput) {
    const existing = await prisma.plant.findUnique({
      where: { qrCode: input.qrCode },
    })
    if (existing) throw new Error("This tin has already been claimed")

    const plant = await prisma.plant.create({
      data: {
        userId,
        qrCode:    input.qrCode,
        seedType:  input.seedType,
        productId: input.productId ?? null,
        stage:     PlantStage.SEEDED,
      },
      include: PLANT_INCLUDE,
    })

    // Award points for registering a tin
    await prisma.leaderboard.upsert({
      where:  { userId },
      update: { points: { increment: 100 } },
      create: { userId, points: 100 },
    })

    return plant
  }

  /**
   * Advance plant to next stage.
   * Awards bonus points for reaching new stage.
   */
  static async advanceStage(plantId: string, userId: string) {
    const plant = await prisma.plant.findFirst({
      where: { id: plantId, userId },
    })
    if (!plant) throw new Error("Plant not found")

    const nextStage = getNextStage(plant.stage)
    if (!nextStage) throw new Error("Plant is already at MATURE stage")

    const updated = await prisma.plant.update({
      where:   { id: plantId },
      data:    { stage: nextStage },
      include: PLANT_INCLUDE,
    })

    // Award stage bonus points
    const bonus = STAGE_POINTS[nextStage]
    if (bonus) {
      await prisma.leaderboard.upsert({
        where:  { userId },
        update: { points: { increment: bonus } },
        create: { userId, points: bonus },
      })
    }

    return updated
  }

  /**
   * Set plant to a specific stage (admin/manual override).
   */
  static async setStage(plantId: string, userId: string, stage: PlantStage) {
    const plant = await prisma.plant.findFirst({
      where: { id: plantId, userId },
    })
    if (!plant) throw new Error("Plant not found")

    return prisma.plant.update({
      where:   { id: plantId },
      data:    { stage },
      include: PLANT_INCLUDE,
    })
  }

  /**
   * Add a growth log entry.
   */
  static async addGrowthLog(
    plantId: string,
    userId:  string,
    note?:   string | null,
    image?:  string | null
  ) {
    const plant = await prisma.plant.findFirst({
      where: { id: plantId, userId },
    })
    if (!plant) throw new Error("Plant not found")

    const log = await prisma.growthLog.create({
      data: { plantId, userId, note: note ?? null, image: image ?? null },
    })

    // Award points for logging
    await prisma.leaderboard.upsert({
      where:  { userId },
      update: { points: { increment: 25 } },
      create: { userId, points: 25 },
    })

    return log
  }

  /**
   * Get all growth logs for a plant.
   */
  static async getGrowthLogs(plantId: string, userId: string) {
    const plant = await prisma.plant.findFirst({
      where: { id: plantId, userId },
    })
    if (!plant) throw new Error("Plant not found")

    return prisma.growthLog.findMany({
      where:   { plantId },
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Set a water reminder for a plant.
   */
  static async setReminder(plantId: string, userId: string, time: Date) {
    const plant = await prisma.plant.findFirst({
      where: { id: plantId, userId },
    })
    if (!plant) throw new Error("Plant not found")

    return prisma.reminder.create({
      data: { userId, plantId, time },
    })
  }

  /**
   * Get all reminders for a user.
   */
  static async getReminders(userId: string) {
    return prisma.reminder.findMany({
      where:   { userId },
      include: {
        plant: { select: { id: true, seedType: true, stage: true, qrCode: true } },
      },
      orderBy: { time: "asc" },
    })
  }
}