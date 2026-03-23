// features/reminders/reminder.controller.ts

import { NextRequest, NextResponse } from "next/server"
import { cookies }                   from "next/headers"
import { verifyToken }               from "@/lib/auth/jwt"
import { ReminderService }           from "./reminder.service"
import { z }                         from "zod"

const createSchema = z.object({
  plantId: z.string().min(1, "plantId is required"),
  time:    z.string().refine((v) => !isNaN(Date.parse(v)), "Must be a valid ISO date"),
})

async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null
    return verifyToken(token).userId
  } catch {
    return null
  }
}

export class ReminderController {

  /** GET /api/plant/reminder */
  static async getReminders(): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const reminders = await ReminderService.getUserReminders(userId)
      return NextResponse.json(reminders)
    } catch (err: any) {
      return NextResponse.json({ error: err.message ?? "Failed to fetch reminders" }, { status: 500 })
    }
  }

  /** POST /api/plant/reminder */
  static async createReminder(req: NextRequest): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const body     = await req.json()
      const data     = createSchema.parse(body)
      const reminder = await ReminderService.create(userId, data.plantId, new Date(data.time))
      return NextResponse.json(reminder, { status: 201 })
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
      }
      return NextResponse.json({ error: err.message ?? "Failed to set reminder" }, { status: 400 })
    }
  }

  /** DELETE /api/plant/reminder?reminderId=xxx */
  static async deleteReminder(req: NextRequest): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const reminderId = new URL(req.url).searchParams.get("reminderId")
      if (!reminderId) {
        return NextResponse.json({ error: "reminderId is required" }, { status: 400 })
      }
      await ReminderService.delete(reminderId, userId)
      return NextResponse.json({ success: true })
    } catch (err: any) {
      return NextResponse.json({ error: err.message ?? "Failed to delete reminder" }, { status: 400 })
    }
  }
}