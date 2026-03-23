// features/leaderboard/leaderboard.controller.ts

import { NextRequest, NextResponse } from "next/server"
import { cookies }                   from "next/headers"
import { verifyToken }               from "@/lib/auth/jwt"
import { LeaderboardService }        from "./leaderboard.service"

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

export class LeaderboardController {

  /** GET /api/leaderboard?limit=50 */
  static async getLeaderboard(req: NextRequest): Promise<NextResponse> {
    try {
      const limit   = parseInt(new URL(req.url).searchParams.get("limit") ?? "50")
      const entries = await LeaderboardService.getTopEntries(limit)
      return NextResponse.json(entries)
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message ?? "Failed to fetch leaderboard" },
        { status: 500 }
      )
    }
  }

  /** GET /api/leaderboard/me */
  static async getMyRank(): Promise<NextResponse> {
    const userId = await getUserId()

    // Return zeroed response if not logged in (no error)
    if (!userId) {
      return NextResponse.json({ points: 0, rank: null })
    }

    try {
      const data = await LeaderboardService.getUserRank(userId)
      return NextResponse.json(data)
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message ?? "Failed to fetch rank" },
        { status: 500 }
      )
    }
  }
}