// app/api/plant/register/route.ts

import { NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { registerPlantSchema } from "@/lib/validators"
import { randomUUID } from "crypto"
import { requireSession, isAuthError } from "@/lib/auth"
import { getErrorMessage } from "@/lib/error-message"

export async function POST(req: Request) {
  try {
    const payload = await requireSession()
    const body = await req.json()
    const data = registerPlantSchema.parse(body)

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // qrCode must be unique — use provided one or generate
    // QR creation falls back to the server to support cases where the client
    // knows the product but does not yet have a scanned QR payload.
    const qrCode = data.qrCode ?? randomUUID()

    // Check qrCode not already registered
    const existing = await prisma.plant.findUnique({ where: { qrCode } })
    if (existing) {
      return NextResponse.json(
        { error: "This QR code has already been registered" },
        { status: 409 }
      )
    }

    const plant = await prisma.plant.create({
      data: {
        userId:    payload.userId,
        productId: data.productId,
        seedType:  data.seedType,
        qrCode,
        stage:     "SEEDED",
      },
      include: { product: true },
    })

    return NextResponse.json(plant, { status: 201 })
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("PLANT_REGISTER_ERROR", error)
    return NextResponse.json(
      { error: getErrorMessage(error, "Plant registration failed") },
      { status: 400 }
    )
  }
}
