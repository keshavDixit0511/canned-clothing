// app/api/plant/reminder/route.ts
// POST /api/plant/reminder — Set a water reminder for a plant

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
    const { plantId, time } = body

    if (!plantId || !time) {
      return NextResponse.json(
        { error: "plantId and time are required" },
        { status: 400 }
      )
    }

    // Validate time is a parseable date
    const reminderDate = new Date(time)
    if (isNaN(reminderDate.getTime())) {
      return NextResponse.json(
        { error: "time must be a valid ISO date string" },
        { status: 400 }
      )
    }

    // Verify plant belongs to user
    const plant = await prisma.plant.findUnique({ where: { id: plantId } })
    if (!plant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 })
    }
    if (plant.userId !== payload.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId:  payload.userId,
        plantId,
        time:    reminderDate,
      },
    })

    return NextResponse.json(reminder, { status: 201 })
  } catch (error) {
    console.error("REMINDER_CREATE_ERROR", error)
    return NextResponse.json({ error: "Failed to set reminder" }, { status: 500 })
  }
}

// GET /api/plant/reminder — Get all reminders for current user
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)

    const reminders = await prisma.reminder.findMany({
      where:   { userId: payload.userId },
      include: { plant: { select: { id: true, seedType: true, stage: true, qrCode: true } } },
      orderBy: { time: "asc" },
    })

    return NextResponse.json(reminders)
  } catch (error) {
    console.error("REMINDER_FETCH_ERROR", error)
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 })
  }
}