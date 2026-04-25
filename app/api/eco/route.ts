import { NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { requireSession, isAuthError } from "@/lib/auth"

export async function GET(req: Request) {

  try {
    const payload = await requireSession(req)

    const plants = await prisma.plant.count({
      where: {
        userId: payload.userId
      }
    })

    const orders = await prisma.order.count({
      where: {
        userId: payload.userId
      }
    })

    const ecoScore = plants * 10

    return NextResponse.json({
      treesPlanted: plants,
      orders,
      ecoScore
    })

  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("ECO_FETCH_ERROR", error)

    return NextResponse.json(
      { error: "Failed to fetch eco stats" },
      { status: 500 }
    )
  }
}
