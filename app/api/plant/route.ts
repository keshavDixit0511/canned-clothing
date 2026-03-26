// app/api/plant/route.ts

import { NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { getSession, requireSession, isAuthError } from "@/lib/auth"
import { qrCodeSchema } from "@/lib/validators"
import { apiError } from "@/lib/api-response"
import { getErrorMessage } from "@/lib/error-message"
import { isForwardStageTransition, getStageRewardPoints } from "@/lib/plant-progress"

const VALID_STAGES = ["SEEDED", "SPROUT", "GROWING", "MATURE"] as const

// ── GET /api/plant ────────────────────────────────────────────────────────────
// GET /api/plant           → Plant[]  (all user plants)
// GET /api/plant?qrCode=x  → { plant, isOwner }

export async function GET(req: Request) {
  try {
    const session = await getSession()

    const { searchParams } = new URL(req.url)
    const qrCodeParam = searchParams.get("qrCode")

    if (qrCodeParam) {
      const qrCode = qrCodeSchema.parse(qrCodeParam)
      const plant = await prisma.plant.findUnique({
        where: { qrCode },
        select: {
          id: true,
          userId: true,
          seedType: true,
          stage: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              seedType: true,
            },
          },
        },
      })

      if (!plant) {
        return apiError("Plant not found", 404, "PLANT_NOT_FOUND")
      }

      const isOwner = Boolean(session && plant.userId === session.userId)

      // QR scans can happen outside the owner's dashboard, so anonymous and
      // non-owner viewers only receive a minimal public view.
      if (!isOwner) {
        const publicPlant = { ...plant }
        delete (publicPlant as { userId?: string }).userId
        return NextResponse.json({
          isOwner,
          plant: publicPlant,
        })
      }

      const fullPlant = await prisma.plant.findUnique({
        where: { qrCode },
        include: {
          product: true,
          growthLogs: { orderBy: { createdAt: "desc" } },
          reminders:  { orderBy: { time: "asc" } },
        },
      })

      if (!fullPlant) {
        return apiError("Plant not found", 404, "PLANT_NOT_FOUND")
      }

      return NextResponse.json({ plant: fullPlant, isOwner })
    }

    const payload = await requireSession()

    const plants = await prisma.plant.findMany({
      where:   { userId: payload.userId },
      include: {
        product:   true,
        growthLogs: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(plants)
  } catch (error) {
    if (isAuthError(error)) {
      return apiError(error.message, error.status, "UNAUTHORIZED")
    }

    console.error("PLANTS_FETCH_ERROR", error)
    return apiError(
      getErrorMessage(error, "Failed to fetch plants"),
      500,
      "PLANTS_FETCH_FAILED"
    )
  }
}

// ── PATCH /api/plant ──────────────────────────────────────────────────────────
// Body: { plantId: string, stage: PlantStage }
// Awards leaderboard points on stage progression

export async function PATCH(req: Request) {
  try {
    const payload = await requireSession()
    const body    = await req.json()
    const { plantId, stage } = body

    if (!plantId || !stage) {
      return apiError("plantId and stage are required", 400, "INVALID_STAGE_UPDATE")
    }

    if (!VALID_STAGES.includes(stage)) {
      return apiError(
        `stage must be one of: ${VALID_STAGES.join(", ")}`,
        400,
        "INVALID_STAGE_UPDATE"
      )
    }

    const nextStage = stage as (typeof VALID_STAGES)[number]

    const plant = await prisma.plant.findUnique({ where: { id: plantId } })
    if (!plant) {
      return apiError("Plant not found", 404, "PLANT_NOT_FOUND")
    }
    if (plant.userId !== payload.userId) {
      return apiError("Forbidden", 403, "FORBIDDEN")
    }

    if (!isForwardStageTransition(plant.stage, nextStage)) {
      return apiError(
        "Plant stage can only move forward one step",
        409,
        "INVALID_STAGE_TRANSITION"
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.plant.updateMany({
        where: {
          id: plantId,
          userId: payload.userId,
          stage: plant.stage,
        },
        data: { stage: nextStage },
      })

      if (result.count !== 1) {
        return null
      }

      const points = getStageRewardPoints(nextStage)
      if (points > 0) {
        await tx.leaderboard.upsert({
          where:  { userId: payload.userId },
          update: { points: { increment: points } },
          create: { userId: payload.userId, points },
        })
      }

      return tx.plant.findUnique({
        where:   { id: plantId },
        include: {
          product:    true,
          growthLogs: { orderBy: { createdAt: "desc" } },
        },
      })
    })

    if (!updated) {
      return apiError(
        "Plant stage was updated already",
        409,
        "STALE_STAGE_UPDATE"
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    if (isAuthError(error)) {
      return apiError(error.message, error.status, "UNAUTHORIZED")
    }

    console.error("PLANT_STAGE_UPDATE_ERROR", error)
    return apiError(
      getErrorMessage(error, "Failed to update stage"),
      500,
      "PLANT_STAGE_UPDATE_FAILED"
    )
  }
}
