// features/eco/eco.service.ts

import { prisma } from "@/server/db/prisma"
import type { EcoStatsResponse, GlobalEcoStats } from "./eco.types"

const CO2_KG_PER_PLANT    = 21
const ECO_SCORE_PER_PLANT = 10

export class EcoService {

  /**
   * Get eco stats for a specific user.
   */
  static async getUserStats(userId: string): Promise<EcoStatsResponse> {
    const [plantsCount, ordersCount] = await Promise.all([
      prisma.plant.count({ where: { userId } }),
      prisma.order.count({ where: { userId } }),
    ])

    return {
      treesPlanted: plantsCount,
      orders:       ordersCount,
      ecoScore:     plantsCount * ECO_SCORE_PER_PLANT,
      co2Saved:     plantsCount * CO2_KG_PER_PLANT,
    }
  }

  /**
   * Get global community eco impact stats.
   */
  static async getGlobalStats(): Promise<GlobalEcoStats> {
    const [totalTins, totalPlants, activeGrowers] = await Promise.all([
      prisma.plant.count(),
      prisma.plant.count({ where: { stage: { not: "SEEDED" } } }),
      prisma.leaderboard.count({ where: { points: { gt: 0 } } }),
    ])

    return {
      totalTins,
      totalPlants,
      totalCO2:      totalTins * CO2_KG_PER_PLANT,
      activeGrowers,
    }
  }
}