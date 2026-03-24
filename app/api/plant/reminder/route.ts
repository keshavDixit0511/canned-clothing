import { NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { createReminderSchema } from "@/lib/validators"
import { requireSession, isAuthError } from "@/lib/auth"
import { getErrorMessage } from "@/lib/error-message"
import { apiError, apiSuccess } from "@/lib/api-response"

export async function POST(req: Request) {
  try {
    const payload = await requireSession()
    const body = await req.json()
    const data = createReminderSchema.parse(body)
    const reminderTime = new Date(data.time)

    const plant = await prisma.plant.findFirst({
      where: { id: data.plantId, userId: payload.userId },
    })

    if (!plant) {
      return apiError("Plant not found", 404, "PLANT_NOT_FOUND")
    }

    const duplicate = await prisma.reminder.findFirst({
      where: {
        userId: payload.userId,
        plantId: data.plantId,
        time: reminderTime,
      },
    })

    if (duplicate) {
      return apiError(
        "You already have a reminder set for this time",
        409,
        "REMINDER_ALREADY_EXISTS"
      )
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: payload.userId,
        plantId: data.plantId,
        time: reminderTime,
      },
      include: {
        plant: {
          select: { id: true, seedType: true, stage: true, qrCode: true },
        },
      },
    })

    return apiSuccess(reminder, { status: 201 })
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return apiError(error.message, error.status, "UNAUTHORIZED")
    }

    console.error("REMINDER_CREATE_ERROR", error)
    return apiError(
      getErrorMessage(error, "Failed to set reminder"),
      400,
      "REMINDER_CREATE_FAILED"
    )
  }
}

export async function GET() {
  try {
    const payload = await requireSession()

    const reminders = await prisma.reminder.findMany({
      where: { userId: payload.userId },
      include: {
        plant: {
          select: { id: true, seedType: true, stage: true, qrCode: true },
        },
      },
      orderBy: { time: "asc" },
    })

    return apiSuccess(reminders)
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return apiError(error.message, error.status, "UNAUTHORIZED")
    }

    console.error("REMINDER_FETCH_ERROR", error)
    return apiError(
      getErrorMessage(error, "Failed to fetch reminders"),
      500,
      "REMINDER_FETCH_FAILED"
    )
  }
}
