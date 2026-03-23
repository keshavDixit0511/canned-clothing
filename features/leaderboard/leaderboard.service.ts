// features/leaderboard/leaderboard.service.ts

import { prisma } from "@/server/db/prisma"

export class LeaderboardService {

  /**
   * Get top N entries sorted by points descending.
   * Enriches with plant count per user.
   */
  static async getTopEntries(limit = 50) {
    const entries = await prisma.leaderboard.findMany({
      take:    Math.min(limit, 100),
      orderBy: { points: "desc" },
      include: {
        user: { select: { name: true, image: true } },
      },
    })

    // Batch fetch plant counts
    const userIds     = entries.map((e) => e.userId)
    const plantCounts = await prisma.plant.groupBy({
      by:     ["userId"],
      where:  { userId: { in: userIds } },
      _count: { id: true },
    })
    const plantMap = Object.fromEntries(
      plantCounts.map((p) => [p.userId, p._count.id])
    )

    return entries.map((entry, i) => ({
      rank:        entry.rank ?? i + 1,
      user:        entry.user,
      points:      entry.points,
      plantsCount: plantMap[entry.userId] ?? 0,
    }))
  }

  /**
   * Get rank + points for a specific user.
   * Calculates dynamic rank by counting users with more points.
   */
  static async getUserRank(userId: string) {
    const entry = await prisma.leaderboard.findUnique({
      where: { userId },
    })

    if (!entry) return { points: 0, rank: null }

    const rank = await prisma.leaderboard.count({
      where: { points: { gt: entry.points } },
    }) + 1

    return { points: entry.points, rank }
  }

  /**
   * Award points. Creates entry if user not on leaderboard yet.
   */
  static async awardPoints(userId: string, points: number) {
    return prisma.leaderboard.upsert({
      where:  { userId },
      update: { points: { increment: points } },
      create: { userId, points },
    })
  }

  /**
   * Recalculate and persist rank for all users.
   * Run this periodically (e.g. cron job) to keep ranks accurate.
   */
  static async recalculateRanks() {
    const entries = await prisma.leaderboard.findMany({
      orderBy: { points: "desc" },
    })

    await Promise.all(
      entries.map((entry, i) =>
        prisma.leaderboard.update({
          where: { id: entry.id },
          data:  { rank: i + 1 },
        })
      )
    )

    return entries.length
  }
}