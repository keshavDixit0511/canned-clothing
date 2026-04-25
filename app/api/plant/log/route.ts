import { prisma } from "@/server/db/prisma"
import { addGrowthLogSchema } from "@/lib/validators"
import { requireSession, isAuthError } from "@/lib/auth"
import { getErrorMessage } from "@/lib/error-message"
import { apiError, apiSuccess } from "@/lib/api-response"

export async function POST(req: Request) {
  try {
    const payload = await requireSession(req)
    const body = await req.json()
    const data = addGrowthLogSchema.parse(body)

    const plant = await prisma.plant.findFirst({
      where: { id: data.plantId, userId: payload.userId },
    })

    if (!plant) {
      return apiError("Plant not found", 404, "PLANT_NOT_FOUND")
    }

    const log = await prisma.$transaction(async (tx) => {
      const created = await tx.growthLog.create({
        data: {
          plantId: data.plantId,
          userId: payload.userId,
          note: data.note ?? null,
          image: data.image ?? null,
        },
      })

      await tx.leaderboard.upsert({
        where: { userId: payload.userId },
        update: { points: { increment: 25 } },
        create: { userId: payload.userId, points: 25 },
      })

      return created
    })

    return apiSuccess(log, { status: 201 })
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return apiError(error.message, error.status, "UNAUTHORIZED")
    }

    console.error("GROWTH_LOG_ERROR", error)
    return apiError(
      getErrorMessage(error, "Failed to add growth log"),
      400,
      "GROWTH_LOG_FAILED"
    )
  }
}
