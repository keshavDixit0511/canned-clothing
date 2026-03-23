// features/growth/growth.controller.ts

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth/jwt"
import { GrowthService } from "./growth.service"
import { z } from "zod"

// ─── Validation schemas ────────────────────────────────────────────────────────

const addLogSchema = z.object({
  plantId: z.string().min(1, "plantId is required"),
  note:    z.string().optional().nullable(),
  image:   z.string().url("Must be a valid URL").optional().nullable(),
})

const advanceStageSchema = z.object({
  plantId: z.string().min(1, "plantId is required"),
})

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null
    const payload = verifyToken(token)
    return payload.userId
  } catch {
    return null
  }
}

// ─── GrowthController ─────────────────────────────────────────────────────────

export class GrowthController {

  /**
   * POST /api/growth
   * Add a growth log entry.
   * Body: { plantId, note?, image? }
   */
  static async addLog(req: NextRequest): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const body = await req.json()
      const data = addLogSchema.parse(body)

      const log = await GrowthService.addLog({
        plantId: data.plantId,
        userId,
        note:    data.note,
        image:   data.image,
      })

      return NextResponse.json(log, { status: 201 })
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return NextResponse.json(
          { error: err.issues[0].message },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: err.message ?? "Failed to add growth log" },
        { status: 400 }
      )
    }
  }

  /**
   * GET /api/growth?plantId=xxx
   * Get all growth logs for a plant.
   */
  static async getLogs(req: NextRequest): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const plantId = new URL(req.url).searchParams.get("plantId")
      if (!plantId) {
        return NextResponse.json(
          { error: "plantId query param is required" },
          { status: 400 }
        )
      }

      const logs = await GrowthService.getLogs({ plantId, userId })
      return NextResponse.json(logs)
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message ?? "Failed to fetch logs" },
        { status: 400 }
      )
    }
  }

  /**
   * PATCH /api/growth/advance
   * Advance plant to next stage.
   * Body: { plantId }
   */
  static async advanceStage(req: NextRequest): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const body = await req.json()
      const data = advanceStageSchema.parse(body)

      const plant = await GrowthService.advanceStage({
        plantId: data.plantId,
        userId,
      })

      return NextResponse.json(plant)
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return NextResponse.json(
          { error: err.issues[0].message },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: err.message ?? "Failed to advance stage" },
        { status: 400 }
      )
    }
  }

  /**
   * DELETE /api/growth?logId=xxx
   * Delete a growth log.
   */
  static async deleteLog(req: NextRequest): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const logId = new URL(req.url).searchParams.get("logId")
      if (!logId) {
        return NextResponse.json(
          { error: "logId query param is required" },
          { status: 400 }
        )
      }

      await GrowthService.deleteLog({ logId, userId })
      return NextResponse.json({ success: true })
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message ?? "Failed to delete log" },
        { status: 400 }
      )
    }
  }
}