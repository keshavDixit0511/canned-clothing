// app/api/orders/route.ts

import { NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { createOrderSchema } from "@/lib/validators"
import { requireSession, isAuthError } from "@/lib/auth"
import { getErrorMessage } from "@/lib/error-message"

// ─── GET /api/orders ───────────────────────────────────────────────────────────

export async function GET() {
  try {
    const payload = await requireSession()

    const orders = await prisma.order.findMany({
      where: { userId: payload.userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("ORDER_FETCH_ERROR", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

// ─── POST /api/orders ─────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const payload = await requireSession()
    const body = await req.json()

    // Validates all shipping fields + paymentProvider
    const data = createOrderSchema.parse(body)

    // Get cart via Cart model (CartItem has cartId, not userId)
    const cart = await prisma.cart.findUnique({
      where: { userId: payload.userId },
      include: { items: { include: { product: true } } },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Verify all products still have stock
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `"${item.product.name}" is out of stock` },
          { status: 400 }
        )
      }
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    // Order creation is intentionally separated from payment initiation so
    // the client can safely retry the payment step without rebuilding the cart.
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: payload.userId,
          totalAmount,
          status: "PENDING",
          shippingName:    data.shippingName,
          shippingPhone:   data.shippingPhone ?? "",
          shippingAddr:    data.shippingAddr,
          shippingCity:    data.shippingCity,
          shippingState:   data.shippingState,
          shippingZip:     data.shippingZip,
          shippingCountry: data.shippingCountry,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity:  item.quantity,
              price:     item.product.price,
            })),
          },
        },
        include: {
          items: { include: { product: { include: { images: true } } } },
        },
      })

      // Decrement product stock
      await Promise.all(
        cart.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      )

      // Clear the cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

      return newOrder
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("ORDER_CREATE_ERROR", error)
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to create order") },
      { status: 400 }
    )
  }
}
