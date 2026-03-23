// features/payments/payment.controller.ts

import { NextRequest, NextResponse } from "next/server"
import { cookies }                   from "next/headers"
import { verifyToken }               from "@/lib/auth/jwt"
import { PaymentService }            from "./payment.service"
import { z }                         from "zod"

const initiateSchema = z.object({
  orderId: z.string().min(1, "orderId is required"),
})

const verifySchema = z.object({
  orderId:           z.string().min(1),
  razorpayOrderId:   z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
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

export class PaymentController {

  /** POST /api/payment — create Razorpay order */
  static async initiate(req: NextRequest): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const body   = await req.json()
      const data   = initiateSchema.parse(body)
      const result = await PaymentService.initiateRazorpay(userId, data)
      return NextResponse.json(result)
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
      }
      return NextResponse.json(
        { error: err.message ?? "Failed to initiate payment" },
        { status: 400 }
      )
    }
  }

  /** PATCH /api/payment — verify Razorpay payment */
  static async verify(req: NextRequest): Promise<NextResponse> {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      const body    = await req.json()
      const data    = verifySchema.parse(body)
      const payment = await PaymentService.verifyRazorpay(userId, data)
      return NextResponse.json(payment)
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
      }
      return NextResponse.json(
        { error: err.message ?? "Payment verification failed" },
        { status: 400 }
      )
    }
  }
}