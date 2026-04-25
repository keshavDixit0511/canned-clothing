// app/api/leaderboard/me/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { getSession } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getSession(req)
    if (!session) {
      return NextResponse.json({ points: 0, rank: null })
    }

    const entry = await prisma.leaderboard.findUnique({
      where: { userId: session.userId },
    })

    if (!entry) {
      return NextResponse.json({ points: 0, rank: null })
    }

    // Calculate rank dynamically if not stored
    let rank = entry.rank
    if (!rank) {
      rank = await prisma.leaderboard.count({
        where: { points: { gt: entry.points } },
      }) + 1
    }

    return NextResponse.json({ points: entry.points, rank })
  } catch (err) {
    console.error("[leaderboard/me GET]", err)
    return NextResponse.json({ points: 0, rank: null }, { status: 500 })
  }
}
