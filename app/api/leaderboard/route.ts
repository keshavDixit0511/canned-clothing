// app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"

async function fetchLeaderboardEntries(limit: number) {
  return prisma.leaderboard.findMany({
    take:    limit,
    orderBy: { points: "desc" },
    include: {
      user: {
        select: { name: true, image: true },
      },
    },
  })
}

async function fetchPlantCounts(userIds: string[]) {
  return prisma.plant.groupBy({
    by:     ["userId"],
    where:  { userId: { in: userIds } },
    _count: { id: true },
  })
}

type LeaderboardEntries = Awaited<ReturnType<typeof fetchLeaderboardEntries>>
type LeaderboardEntry = LeaderboardEntries[number]
type PlantCountRows = Awaited<ReturnType<typeof fetchPlantCounts>>
type PlantCountRow = PlantCountRows[number]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50)

    const entries = await fetchLeaderboardEntries(limit)

    // Count plants per user for display
    const userIds = entries.map((entry: LeaderboardEntry) => entry.userId)
    const plantCounts = await fetchPlantCounts(userIds)
    const plantCountMap = Object.fromEntries(
      plantCounts.map((plantCount: PlantCountRow) => [plantCount.userId, plantCount._count.id])
    )

    const response = entries.map((entry: LeaderboardEntry, i: number) => ({
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
