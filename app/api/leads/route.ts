import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { requireAdminSession, isAuthError } from "@/lib/auth"
import { createProductInterestLeadSchema } from "@/lib/validators"
import { LEAD_STATUSES } from "@/lib/commerce"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const productId = searchParams.get("productId")

    const where: {
      status?: (typeof LEAD_STATUSES)[number]
      productId?: string
    } = {}

    if (status && LEAD_STATUSES.includes(status as (typeof LEAD_STATUSES)[number])) {
      where.status = status as (typeof LEAD_STATUSES)[number]
    }

    if (productId) {
      where.productId = productId
    }

    const leads = await prisma.productInterestLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            availabilityStatus: true,
          },
        },
      },
    })

    return NextResponse.json(leads)
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("[leads GET]", error)
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = createProductInterestLeadSchema.parse(body)

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { id: true, name: true, availabilityStatus: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const lead = await prisma.productInterestLead.create({
      data: {
        productId: data.productId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city?.trim() || null,
        likedConcept: data.likedConcept,
        willingToPayRange: data.willingToPayRange,
        wouldRecommend: data.wouldRecommend,
        comment: data.comment?.trim() || null,
      },
    })

    return NextResponse.json(
      { message: "Interest submitted", lead },
      { status: 201 }
    )
  } catch (error) {
    console.error("[leads POST]", error)
    return NextResponse.json({ error: "Failed to submit interest" }, { status: 400 })
  }
}
