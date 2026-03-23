// app/api/plant/log/route.ts
// POST /api/plant/log — Add a growth log entry to a plant

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/server/db/prisma"
import { verifyToken } from "@/lib/auth/jwt"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    const body = await req.json()
    const { plantId, note, image } = body

    if (!plantId) {
      return NextResponse.json({ error: "plantId is required" }, { status: 400 })
    }

    // Verify plant exists and belongs to user
    const plant = await prisma.plant.findUnique({ where: { id: plantId } })
    if (!plant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 })
    }
    if (plant.userId !== payload.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const log = await prisma.growthLog.create({
      data: {
        plantId,
        userId: payload.userId,
        note:   note   ?? null,
        image:  image  ?? null,
      },
    })

    // Award leaderboard points for logging growth
    await prisma.leaderboard.upsert({
      where:  { userId: payload.userId },
      update: { points: { increment: 25 } },
      create: { userId: payload.userId, points: 25 },
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error("GROWTH_LOG_ERROR", error)
    return NextResponse.json({ error: "Failed to add growth log" }, { status: 500 })
  }
}