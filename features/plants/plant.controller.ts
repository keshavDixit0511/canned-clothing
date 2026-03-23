// features/plants/plant.controller.ts

import { NextRequest, NextResponse } from "next/server"
import { cookies }                   from "next/headers"
import { verifyToken }               from "@/lib/auth/jwt"
import { PlantService }              from "./plant.service"
import {
  registerPlantSchema,
  updateStageSchema,
  addGrowthLogSchema,
  setReminderSchema,
} from "./plant.validation"
import { z } from "zod"

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

export class PlantController {

  /** GET /api/plant — all user plants */
  /** GET /api/plant?qrCode=xxx — scan lookup */
  static async getPlants(req: NextRequest): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const qrCode = new URL(req.url).searchParams.get("qrCode")

      if (qrCode) {
        const result = await PlantService.getByQRCode(qrCode, userId)
        if (!result) {
          return NextResponse.json({ error: "Plant not found" }, { status: 404 })
        }
        return NextResponse.json(result)
      }

      const plants = await PlantService.getUserPlants(userId)
      return NextResponse.json(plants)
    } catch (err: any) {
      return NextResponse.json({ error: err.message ?? "Failed to fetch plants" }, { status: 500 })
    }
  }

  /** POST /api/plant/register */
  static async register(req: NextRequest): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const body  = await req.json()
      const data  = registerPlantSchema.parse(body)
      const plant = await PlantService.register(userId, data)
      return NextResponse.json(plant, { status: 201 })
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
      }
      return NextResponse.json({ error: err.message ?? "Failed to register plant" }, { status: 400 })
    }
  }

  /** PATCH /api/plant/advance — advance to next stage */
  static async advanceStage(req: NextRequest): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const { plantId } = await req.json()
      if (!plantId) {
        return NextResponse.json({ error: "plantId is required" }, { status: 400 })
      }
      const plant = await PlantService.advanceStage(plantId, userId)
      return NextResponse.json(plant)
    } catch (err: any) {
      return NextResponse.json({ error: err.message ?? "Failed to advance stage" }, { status: 400 })
    }
  }

  /** POST /api/plant/log — add growth log */
  static async addGrowthLog(req: NextRequest): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const body = await req.json()
      const data = addGrowthLogSchema.parse(body)
      const log  = await PlantService.addGrowthLog(data.plantId, userId, data.note, data.image)
      return NextResponse.json(log, { status: 201 })
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
      }
      return NextResponse.json({ error: err.message ?? "Failed to add log" }, { status: 400 })
    }
  }

  /** POST /api/plant/reminder — set water reminder */
  static async setReminder(req: NextRequest): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const body     = await req.json()
      const data     = setReminderSchema.parse(body)
      const reminder = await PlantService.setReminder(
        data.plantId,
        userId,
        new Date(data.time)
      )
      return NextResponse.json(reminder, { status: 201 })
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
      }
      return NextResponse.json({ error: err.message ?? "Failed to set reminder" }, { status: 400 })
    }
  }

  /** GET /api/plant/reminder — get all reminders */
  static async getReminders(): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const reminders = await PlantService.getReminders(userId)
      return NextResponse.json(reminders)
    } catch (err: any) {
      return NextResponse.json({ error: err.message ?? "Failed to fetch reminders" }, { status: 500 })
    }
  }
}