// features/payments/payment.service.ts

import { prisma }   from "@/server/db/prisma"
import Razorpay     from "razorpay"
import crypto       from "crypto"
import type { InitiatePaymentInput, VerifyPaymentInput } from "./payment.types"

function getRazorpay() {
  const keyId     = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured in environment variables")
  }
  return {
    instance:  new Razorpay({ key_id: keyId, key_secret: keySecret }),
    keyId,
    keySecret,
  }
}

export class PaymentService {

  /**
   * Create a Razorpay order and store a PENDING Payment record.
   */
  static async initiateRazorpay(userId: string, input: InitiatePaymentInput) {
    const { instance, keyId } = getRazorpay()

    const order = await prisma.order.findUnique({ where: { id: input.orderId } })
    if (!order)                  throw new Error("Order not found")
    if (order.userId !== userId) throw new Error("Forbidden")

    // Amount in paise
    const amountPaise = Math.round(order.totalAmount * 100)

    const rzpOrder = await instance.orders.create({
      amount:   amountPaise,
      currency: "INR",
      receipt:  order.id,
    })

    // Upsert Payment record as PENDING
    await prisma.payment.upsert({
      where:  { orderId: order.id },
      update: { providerRef: rzpOrder.id, status: "PENDING" },
      create: {
        orderId:     order.id,
        provider:    "RAZORPAY",
        providerRef: rzpOrder.id,
        amount:      order.totalAmount,
        status:      "PENDING",
      },
    })

    return {
      razorpayOrderId: rzpOrder.id,
      amount:          amountPaise,
      currency:        "INR",
      keyId,
    }
  }

  /**
   * Verify HMAC signature from Razorpay webhook/callback.
   * Marks payment SUCCESS and order PAID on success.
   * Marks payment FAILED on signature mismatch.
   */
  static async verifyRazorpay(userId: string, input: VerifyPaymentInput) {
    const { keySecret } = getRazorpay()

    const order = await prisma.order.findUnique({ where: { id: input.orderId } })
    if (!order)                  throw new Error("Order not found")
    if (order.userId !== userId) throw new Error("Forbidden")

    // HMAC-SHA256 verification
    const body     = `${input.razorpayOrderId}|${input.razorpayPaymentId}`
    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex")

    if (expected !== input.razorpaySignature) {
      await prisma.payment.update({
        where: { orderId: input.orderId },
        data:  { status: "FAILED" },
      })
      throw new Error("Payment verification failed — invalid signature")
    }

    // Mark success atomically
    const [payment] = await Promise.all([
      prisma.payment.update({
        where: { orderId: input.orderId },
        data:  {
          status:      "SUCCESS",
          providerRef: input.razorpayPaymentId,
        },
      }),
      prisma.order.update({
        where: { id: input.orderId },
        data:  { status: "PAID" },
      }),
    ])

    return payment
  }

  /**
   * Get payment record for an order.
   */
  static async getPayment(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order)                  throw new Error("Order not found")
    if (order.userId !== userId) throw new Error("Forbidden")

    return prisma.payment.findUnique({ where: { orderId } })
  }
}