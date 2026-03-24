// app/api/plant/route.ts

import { NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { requireSession, isAuthError } from "@/lib/auth"
import { qrCodeSchema } from "@/lib/validators"
import { apiError } from "@/lib/api-response"
import { getErrorMessage } from "@/lib/error-message"

const VALID_STAGES = ["SEEDED", "SPROUT", "GROWING", "MATURE"] as const

// ── GET /api/plant ────────────────────────────────────────────────────────────
// GET /api/plant           → Plant[]  (all user plants)
// GET /api/plant?qrCode=x  → { plant, isOwner }

export async function GET(req: Request) {
  try {
    const payload = await requireSession()

    const { searchParams } = new URL(req.url)
    const qrCodeParam = searchParams.get("qrCode")

    if (qrCodeParam) {
      const qrCode = qrCodeSchema.parse(qrCodeParam)
      const plant = await prisma.plant.findUnique({
        where: { qrCode },
        include: {
          product: true,
          growthLogs: { orderBy: { createdAt: "desc" } },
          reminders:  { orderBy: { time: "asc" } },
        },
      })

      if (!plant) {
        return apiError("Plant not found", 404, "PLANT_NOT_FOUND")
      }

      const isOwner = plant.userId === payload.userId

      // QR scans can happen outside the owner's dashboard, so non-owners only
      // receive a minimal view of the plant and product metadata.
      if (!isOwner) {
        return NextResponse.json({
          isOwner,
          plant: {
            id: plant.id,
            seedType: plant.seedType,
            stage: plant.stage,
            createdAt: plant.createdAt,
            product: plant.product,
          },
        })
      }

      return NextResponse.json({ plant, isOwner })
    }

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

    const plant = await prisma.plant.findUnique({ where: { id: plantId } })
    if (!plant) {
      return apiError("Plant not found", 404, "PLANT_NOT_FOUND")
    }
    if (plant.userId !== payload.userId) {
      return apiError("Forbidden", 403, "FORBIDDEN")
    }

    const updated = await prisma.plant.update({
      where:   { id: plantId },
      data:    { stage },
      include: {
        product:    true,
        growthLogs: { orderBy: { createdAt: "desc" } },
      },
    })

    // Award leaderboard points per stage
    const STAGE_POINTS: Record<string, number> = {
      SPROUT:  10,
      GROWING: 20,
      MATURE:  50,
    }
    const points = STAGE_POINTS[stage]
    if (points) {
      await prisma.leaderboard.upsert({
        where:  { userId: payload.userId },
        update: { points: { increment: points } },
        create: { userId: payload.userId, points },
      })
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
