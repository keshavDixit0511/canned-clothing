// app/api/growth/route.ts

import { NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { addGrowthLogSchema } from "@/lib/validators"
import { requireSession, isAuthError } from "@/lib/auth"
import { getErrorMessage } from "@/lib/error-message"

export async function POST(req: Request) {
  try {
    const payload = await requireSession()
    const body    = await req.json()
    const data    = addGrowthLogSchema.parse(body)

    // Verify the plant belongs to this user
    const plant = await prisma.plant.findFirst({
      where: { id: data.plantId, userId: payload.userId },
    })
    if (!plant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 })
    }

    const log = await prisma.growthLog.create({
      data: {
        plantId: data.plantId,
        userId:  payload.userId,
        note:    data.note ?? null,
        image:   data.image ?? null,
      },
    })

    // Award points for logging growth
    await prisma.leaderboard.upsert({
      where:  { userId: payload.userId },
      update: { points: { increment: 25 } },
      create: { userId: payload.userId, points: 25 },
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("[growth POST]", error)
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to log growth") },
      { status: 400 }
    )
  }
}
