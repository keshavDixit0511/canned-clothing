// features/eco/eco.controller.ts

import { NextResponse } from "next/server"
import { cookies }      from "next/headers"
import { verifyToken }  from "@/lib/auth/jwt"
import { EcoService }   from "./eco.service"

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

export class EcoController {

  /**
   * GET /api/eco
   * Returns personal stats if logged in, global stats if not.
   */
  static async getStats(): Promise<NextResponse> {
    try {
      const userId = await getUserId()

      if (userId) {
        const stats = await EcoService.getUserStats(userId)
        return NextResponse.json(stats)
      }

      // Not logged in — return global stats mapped to same shape
      const global = await EcoService.getGlobalStats()
      return NextResponse.json({
        treesPlanted: global.totalTins,
        orders:       0,
        ecoScore:     global.totalTins * 10,
        co2Saved:     global.totalCO2,
      })
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message ?? "Failed to fetch eco stats" },
        { status: 500 }
      )
    }
  }

  /**
   * GET /api/eco/global
   * Public community stats endpoint.
   */
  static async getGlobalStats(): Promise<NextResponse> {
    try {
      const stats = await EcoService.getGlobalStats()
      return NextResponse.json(stats)
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message ?? "Failed to fetch global stats" },
        { status: 500 }
      )
    }
  }
}