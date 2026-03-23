// features/cart/cart.controller.ts

import { NextRequest, NextResponse } from "next/server"
import { cookies }                   from "next/headers"
import { verifyToken }               from "@/lib/auth/jwt"
import { CartService }               from "./cart.service"
import { z }                         from "zod"

const addItemSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  quantity:  z.number().int().min(1, "Quantity must be at least 1").max(10),
})

const updateItemSchema = z.object({
  cartItemId: z.string().min(1, "cartItemId is required"),
  quantity:   z.number().int().min(0, "Quantity cannot be negative"),
})

async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null
    return verifyToken(token).userId
  } catch {
    return null
  }
}

export class CartController {

  /** GET /api/cart */
  static async getCart(): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const cart = await CartService.getCart(userId)
      return NextResponse.json(cart)
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message ?? "Failed to fetch cart" },
        { status: 500 }
      )
    }
  }

  /** POST /api/cart */
  static async addItem(req: NextRequest): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const body = await req.json()
      const data = addItemSchema.parse(body)
      const cart = await CartService.addItem(userId, data)
      return NextResponse.json(cart, { status: 201 })
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
      }
      return NextResponse.json(
        { error: err.message ?? "Failed to add item" },
        { status: 400 }
      )
    }
  }

  /** PATCH /api/cart */
  static async updateItem(req: NextRequest): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const body = await req.json()
      const data = updateItemSchema.parse(body)
      const cart = await CartService.updateItem(userId, data)
      return NextResponse.json(cart)
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
      }
      return NextResponse.json(
        { error: err.message ?? "Failed to update item" },
        { status: 400 }
      )
    }
  }

  /** DELETE /api/cart?cartItemId=xxx */
  static async removeItem(req: NextRequest): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const cartItemId = new URL(req.url).searchParams.get("cartItemId")
      if (!cartItemId) {
        return NextResponse.json({ error: "cartItemId is required" }, { status: 400 })
      }
      const cart = await CartService.removeItem(userId, cartItemId)
      return NextResponse.json(cart)
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message ?? "Failed to remove item" },
        { status: 400 }
      )
    }
  }
}