// features/products/product.controller.ts

import { NextRequest, NextResponse } from "next/server"
import { cookies }                   from "next/headers"
import { verifyToken }               from "@/lib/auth/jwt"
import { ProductService }            from "./product.service"
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from "./product.validation"
import { z } from "zod"

async function getAuth(): Promise<{ userId: string; role: string } | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null
    const payload = verifyToken(token)
    return { userId: payload.userId, role: payload.role }
  } catch {
    return null
  }
}

export class ProductController {

  /** GET /api/products */
  static async getProducts(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url)
      const raw = {
        search:   searchParams.get("search")   ?? undefined,
        seedType: searchParams.get("seedType") ?? undefined,
        sort:     searchParams.get("sort")     ?? undefined,
        page:     searchParams.get("page")     ?? undefined,
        limit:    searchParams.get("limit")    ?? undefined,
      }
      const query    = productQuerySchema.parse(raw)
      const result   = await ProductService.getProducts(query)
      // Return array for simple usage, or full result with pagination
      return NextResponse.json(result.products)
    } catch (err: any) {
      return NextResponse.json({ error: err.message ?? "Failed to fetch products" }, { status: 500 })
    }
  }

  /** GET /api/products/:slug */
  static async getProduct(slug: string): Promise<NextResponse> {
    try {
      const product = await ProductService.getBySlug(slug)
      return NextResponse.json(product)
    } catch (err: any) {
      return NextResponse.json({ error: err.message ?? "Product not found" }, { status: 404 })
    }
  }

  /** POST /api/products — admin only */
  static async createProduct(req: NextRequest): Promise<NextResponse> {
    const auth = await getAuth()
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 })
    }
    try {
      const body    = await req.json()
      const data    = createProductSchema.parse(body)
      const product = await ProductService.create(data)
      return NextResponse.json(product, { status: 201 })
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
      }
      return NextResponse.json({ error: err.message ?? "Failed to create product" }, { status: 400 })
    }
  }

  /** PATCH /api/products/:slug — admin only */
  static async updateProduct(req: NextRequest, slug: string): Promise<NextResponse> {
    const auth = await getAuth()
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 })
    }
    try {
      const body    = await req.json()
      const data    = updateProductSchema.parse(body)
      const product = await ProductService.update(slug, data)
      return NextResponse.json(product)
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
      }
      return NextResponse.json({ error: err.message ?? "Failed to update product" }, { status: 400 })
    }
  }

  /** DELETE /api/products/:slug — admin only */
  static async deleteProduct(slug: string): Promise<NextResponse> {
    const auth = await getAuth()
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 })
    }
    try {
      await ProductService.delete(slug)
      return NextResponse.json({ success: true })
    } catch (err: any) {
      return NextResponse.json({ error: err.message ?? "Failed to delete product" }, { status: 400 })
    }
  }
}