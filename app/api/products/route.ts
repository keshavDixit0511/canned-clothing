// app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server"
import { Prisma }                    from "@prisma/client"
import { prisma }                    from "@/server/db/prisma"
import { cookies }                   from "next/headers"
import { verifyToken }               from "@/lib/auth/jwt"
import { PRODUCT_AVAILABILITY_STATUSES } from "@/lib/commerce"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const search   = searchParams.get("search")   ?? ""
    const activity = searchParams.get("activity") ?? ""
    const seedType = searchParams.get("seedType") ?? ""
    const sort     = searchParams.get("sort")     ?? "newest"
    const page     = parseInt(searchParams.get("page")  ?? "1")
    const limit    = parseInt(searchParams.get("limit") ?? "20")

    // Build where clause
    const where: Prisma.ProductWhereInput = {}

    if (search.trim()) {
      where.OR = [
        { name:        { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    // Filter by activity (Daily Wear, Gym, Work, etc.)
    if (activity && activity !== "all") {
      where.activity = { equals: activity, mode: "insensitive" }
    }

    if (seedType && seedType !== "all") {
      where.seedType = { equals: seedType, mode: "insensitive" }
    }

    // Sort
    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === "price_asc"  ? { price: "asc"  } :
      sort === "price_desc" ? { price: "desc" } :
      sort === "name_asc"   ? { name:  "asc"  } :
      { createdAt: "desc" }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip:    (page - 1) * limit,
      take:    limit,
      include: {
        images: { orderBy: { order: "asc" } },
      },
    })

    return NextResponse.json(products)
  } catch (err) {
    console.error("[products GET]", err)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = (await req.json()) as {
      name?: string
      slug?: string
      description?: string
      price?: string | number
      stock?: string | number
      availabilityStatus?: string
      activity?: string
      seedType?: string
      images?: Array<{ url: string; order?: number }>
    }
    const { name, slug, description, price, stock, activity, seedType, images } = body
    const availabilityStatus = body.availabilityStatus
      ? PRODUCT_AVAILABILITY_STATUSES.includes(
          body.availabilityStatus as (typeof PRODUCT_AVAILABILITY_STATUSES)[number]
        )
        ? body.availabilityStatus
        : null
      : "IN_STOCK"

    if (availabilityStatus === null) {
      return NextResponse.json({ error: "Invalid availability status" }, { status: 400 })
    }

    if (!name || !slug || !description || !price || !activity || !seedType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        // Coerce numeric form inputs safely whether they arrive as strings or numbers.
        price:    Number(price),
        stock:    Number(stock),
        availabilityStatus,
        activity,
        seedType,
        images: images?.length
          ? { create: images.map((img) => ({ url: img.url, order: img.order ?? 0 })) }
          : undefined,
      },
      include: { images: { orderBy: { order: "asc" } } },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    console.error("[products POST]", err)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
