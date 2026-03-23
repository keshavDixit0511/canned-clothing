// app/api/payment/route.ts

import { NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { requireSession, isAuthError } from "@/lib/auth"
import Razorpay from "razorpay"
import crypto from "crypto"

function getRazorpayClient() {
  const key = process.env.RAZORPAY_KEY
  const secret = process.env.RAZORPAY_SECRET

  if (!key || !secret) {
    throw new Error("Razorpay credentials are not configured")
  }

  // Lazily creating the client keeps Next builds from crashing when payment
  // env vars are only present in runtime environments.
  return new Razorpay({
    key_id: key,
    key_secret: secret,
  })
}

// ─── POST /api/payment — Initiate payment, create Razorpay order ──────────────

export async function POST(req: Request) {
  try {
    const payload = await requireSession()
    const body = await req.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 })
    }

    // Verify order belongs to this user and is still PENDING
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    if (order.userId !== payload.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Order is not in a payable state" },
        { status: 400 }
      )
    }

    // Reuse the existing pending payment row when the client retries checkout,
    // but always mint a fresh provider order reference to avoid stale sessions.
    const razorpay = getRazorpayClient()
    const rzpOrder = await razorpay.orders.create({
      amount:   Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt:  `rcpt_${order.id}`,
    })

    // Save pending Payment record to DB
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

    return NextResponse.json({
      rzpOrderId: rzpOrder.id,
      amount:     rzpOrder.amount,
      currency:   rzpOrder.currency,
      orderId:    order.id,
      // Send key to client so it doesn't need to be hardcoded in frontend
      key:        process.env.RAZORPAY_KEY!,
    })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("PAYMENT_CREATE_ERROR", error)
    return NextResponse.json(
      { error: "Payment initiation failed" },
      { status: 500 }
    )
  }
}

// ─── PATCH /api/payment — Verify payment signature, mark order PAID ──────────

export async function PATCH(req: Request) {
  try {
    const payload = await requireSession()
    const body = await req.json()

    const {
      orderId,         // your DB order id
      rzpOrderId,      // razorpay order id
      rzpPaymentId,    // razorpay payment id (from checkout callback)
      rzpSignature,    // razorpay signature (from checkout callback)
    } = body

    if (!orderId || !rzpOrderId || !rzpPaymentId || !rzpSignature) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 }
      )
    }

    // Verify Razorpay signature
    const razorpaySecret = process.env.RAZORPAY_SECRET
    if (!razorpaySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials are not configured" },
        { status: 500 }
      )
    }

    const expectedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(`${rzpOrderId}|${rzpPaymentId}`)
      .digest("hex")

    if (expectedSignature !== rzpSignature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      )
    }

    // Verify order ownership before updating any payment state.
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    })
    if (!order || order.userId !== payload.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Payment verification must be idempotent because the gateway callback
    // can be retried by the client after a network interruption.
    if (order.status === "PAID") {
      return NextResponse.json({ message: "Payment already verified", orderId })
    }

    if (!order.payment) {
      return NextResponse.json(
        { error: "Payment record not found for this order" },
        { status: 404 }
      )
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data:  { status: "PAID" },
      }),
      prisma.payment.update({
        where: { orderId },
        data:  { status: "SUCCESS", providerRef: rzpPaymentId },
      }),
    ])

    return NextResponse.json({ message: "Payment verified", orderId })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("PAYMENT_VERIFY_ERROR", error)
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    )
  }
}
