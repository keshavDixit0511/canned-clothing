// app/api/plant/route.ts

import { NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { requireSession, isAuthError } from "@/lib/auth"

const VALID_STAGES = ["SEEDED", "SPROUT", "GROWING", "MATURE"] as const

// ── GET /api/plant ────────────────────────────────────────────────────────────
// GET /api/plant           → Plant[]  (all user plants)
// GET /api/plant?qrCode=x  → { plant, isOwner }

export async function GET(req: Request) {
  try {
    const payload = await requireSession()

    const { searchParams } = new URL(req.url)
    const qrCode = searchParams.get("qrCode")

    if (qrCode) {
      const plant = await prisma.plant.findUnique({
        where: { qrCode },
        include: {
          product: true,
          growthLogs: { orderBy: { createdAt: "desc" } },
          reminders:  { orderBy: { time: "asc" } },
        },
      })

      if (!plant) {
        return NextResponse.json({ error: "Plant not found" }, { status: 404 })
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
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("PLANTS_FETCH_ERROR", error)
    return NextResponse.json({ error: "Failed to fetch plants" }, { status: 500 })
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
      return NextResponse.json(
        { error: "plantId and stage are required" },
        { status: 400 }
      )
    }

    if (!VALID_STAGES.includes(stage)) {
      return NextResponse.json(
        { error: `stage must be one of: ${VALID_STAGES.join(", ")}` },
        { status: 400 }
      )
    }

    const plant = await prisma.plant.findUnique({ where: { id: plantId } })
    if (!plant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 })
    }
    if (plant.userId !== payload.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("PLANT_STAGE_UPDATE_ERROR", error)
    return NextResponse.json({ error: "Failed to update stage" }, { status: 500 })
  }
}
