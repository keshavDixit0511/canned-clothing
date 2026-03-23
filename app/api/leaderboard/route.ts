// app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50)

    const entries = await prisma.leaderboard.findMany({
      take:    limit,
      orderBy: { points: "desc" },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    })

    // Count plants per user for display
    const userIds = entries.map((e) => e.userId)
    const plantCounts = await prisma.plant.groupBy({
      by:     ["userId"],
      where:  { userId: { in: userIds } },
      _count: { id: true },
    })
    const plantCountMap = Object.fromEntries(
      plantCounts.map((p) => [p.userId, p._count.id])
    )

    const response = entries.map((entry, i) => ({
      rank:        entry.rank ?? i + 1,
      user:        entry.user,
      points:      entry.points,
      plantsCount: plantCountMap[entry.userId] ?? 0,
    }))

    return NextResponse.json(response)
  } catch (err) {
    console.error("[leaderboard GET]", err)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}