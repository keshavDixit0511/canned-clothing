import { NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { requireAdminSession, isAuthError } from "@/lib/auth"
import { updateProductInterestLeadSchema } from "@/lib/validators"

type Params = { params: Promise<{ id: string }> }

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAdminSession(_req)
    const { id } = await params

    const lead = await prisma.productInterestLead.findUnique({
      where: { id },
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

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("[leads/[id] GET]", error)
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireAdminSession(req)
    const { id } = await params
    const body = await req.json()
    const data = updateProductInterestLeadSchema.parse(body)

    const existing = await prisma.productInterestLead.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    const lead = await prisma.productInterestLead.update({
      where: { id },
      data: {
        status: data.status,
        adminNotes: data.adminNotes?.trim() || null,
      },
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

    return NextResponse.json(lead)
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("[leads/[id] PATCH]", error)
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 })
  }
}
