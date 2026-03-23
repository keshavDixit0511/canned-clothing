// features/orders/order.controller.ts

import { NextRequest, NextResponse } from "next/server"
import { cookies }                   from "next/headers"
import { verifyToken }               from "@/lib/auth/jwt"
import { OrderService }              from "./order.service"
import { z }                         from "zod"

const createOrderSchema = z.object({
  shippingName:    z.string().min(1, "Name is required"),
  shippingPhone:   z.string().min(10, "Valid phone number required"),
  shippingAddr:    z.string().min(1, "Address is required"),
  shippingCity:    z.string().min(1, "City is required"),
  shippingState:   z.string().min(1, "State is required"),
  shippingZip:     z.string().regex(/^\d{6}$/, "Valid 6-digit PIN required"),
  shippingCountry: z.string().min(1, "Country is required"),
  paymentProvider: z.enum(["RAZORPAY", "STRIPE"]),
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

export class OrderController {

  /** GET /api/orders */
  static async getOrders(): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const orders = await OrderService.getUserOrders(userId)
      return NextResponse.json(orders)
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message ?? "Failed to fetch orders" },
        { status: 500 }
      )
    }
  }

  /** GET /api/orders/:id */
  static async getOrder(orderId: string): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const order = await OrderService.getOrderById(orderId, userId)
      return NextResponse.json(order)
    } catch (err: any) {
      const status = err.message === "Forbidden" ? 403 : 404
      return NextResponse.json(
        { error: err.message ?? "Order not found" },
        { status }
      )
    }
  }

  /** POST /api/orders */
  static async createOrder(req: NextRequest): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const body  = await req.json()
      const data  = createOrderSchema.parse(body)
      const order = await OrderService.createOrder(userId, data)
      return NextResponse.json(order, { status: 201 })
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
      }
      return NextResponse.json(
        { error: err.message ?? "Failed to create order" },
        { status: 400 }
      )
    }
  }
}