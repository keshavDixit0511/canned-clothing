import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/server/db/prisma"
import { registerPlantSchema } from "@/lib/validators"
import { requireSession, isAuthError } from "@/lib/auth"
import { getErrorMessage } from "@/lib/error-message"
import { apiError, apiSuccess } from "@/lib/api-response"

export async function POST(req: Request) {
  try {
    const payload = await requireSession(req)
    const body = await req.json()
    const data = registerPlantSchema.parse(body)

    if (data.productId) {
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
      })

      if (!product) {
        return apiError("Product not found", 404, "PRODUCT_NOT_FOUND")
      }
    }

    const existing = await prisma.plant.findUnique({
      where: { qrCode: data.qrCode },
    })

    if (existing) {
      return apiError(
        existing.userId === payload.userId
          ? "This tin is already registered to your account"
          : "This QR code has already been registered",
        409,
        existing.userId === payload.userId
          ? "PLANT_ALREADY_REGISTERED_BY_USER"
          : "PLANT_ALREADY_REGISTERED"
      )
    }

    const plant = await prisma.$transaction(async (tx) => {
      const created = await tx.plant.create({
        data: {
          userId: payload.userId,
          productId: data.productId ?? null,
          seedType: data.seedType,
          qrCode: data.qrCode,
          stage: "SEEDED",
        },
        include: {
          product: true,
          growthLogs: { orderBy: { createdAt: "desc" } },
          reminders: { orderBy: { time: "asc" } },
        },
      })

      await tx.leaderboard.upsert({
        where: { userId: payload.userId },
        update: { points: { increment: 100 } },
        create: { userId: payload.userId, points: 100 },
      })

      return created
    })

    return apiSuccess(plant, { status: 201 })
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return apiError(error.message, error.status, "UNAUTHORIZED")
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return apiError(
        "This QR code has already been registered",
        409,
        "PLANT_ALREADY_REGISTERED"
      )
    }

    console.error("PLANT_REGISTER_ERROR", error)
    return apiError(
      getErrorMessage(error, "Plant registration failed"),
      400,
      "PLANT_REGISTRATION_FAILED"
    )
  }
}
