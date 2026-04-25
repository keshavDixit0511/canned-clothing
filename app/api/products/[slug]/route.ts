// app/api/products/[slug]/route.ts

import { NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { requireAdminSession, isAuthError } from "@/lib/auth"
import { updateProductSchema } from "@/lib/validators"

type Params = { params: Promise<{ slug: string }> }

// ─── GET /api/products/[slug] ─────────────────────────────────────────────────

export async function GET(_req: Request, { params }: Params) {
  try {
    const { slug } = await params
    const product = await prisma.product.findUnique({
      where: { slug }, // ← slug, not id
      include: {
        images: { orderBy: { order: "asc" } },
        plants: {
          select: { id: true, stage: true, createdAt: true },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("PRODUCT_FETCH_ERROR", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

// ─── PATCH /api/products/[slug] ───────────────────────────────────────────────

export async function PATCH(req: Request, { params }: Params) {
  try {
    // Product mutations stay admin-only even if the frontend later adds
    // a separate admin console or management workflow.
    await requireAdminSession(req)

    const { slug } = await params
    const body = await req.json()
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "At least one field must be provided" },
        { status: 400 }
      )
    }
    const data = updateProductSchema.parse(body)
    const { images, ...rest } = data

    const product = await prisma.product.update({
      where: { slug },
      data: {
        ...rest,
        ...(images
          ? {
              // Prisma expects relation writes in nested form, so we replace
              // the image list atomically instead of passing raw arrays through.
              images: {
                deleteMany: {},
                create: images.map((image, index) => ({
                  url: image.url,
                  order: image.order ?? index,
                })),
              },
            }
          : {}),
      },
      include: { images: { orderBy: { order: "asc" } } },
    })

    return NextResponse.json(product)
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("PRODUCT_UPDATE_ERROR", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}

// ─── DELETE /api/products/[slug] ──────────────────────────────────────────────

export async function DELETE(_req: Request, { params }: Params) {
  try {
    // Deleting catalog items is destructive, so we require an admin session
    // on the server regardless of which UI initiates the request.
    await requireAdminSession(_req)

    const { slug } = await params
    await prisma.product.delete({ where: { slug } })
    return NextResponse.json({ message: "Product deleted" })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("PRODUCT_DELETE_ERROR", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
