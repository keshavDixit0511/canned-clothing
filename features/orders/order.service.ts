// features/orders/order.service.ts

import { prisma }           from "@/server/db/prisma"
import type { CreateOrderInput } from "./order.types"

const ORDER_INCLUDE = {
  items: {
    include: {
      product: {
        select: {
          name:   true,
          slug:   true,
          images: { take: 1, orderBy: { order: "asc" as const } },
        },
      },
    },
  },
  payment: { select: { status: true, provider: true } },
} as const

export class OrderService {

  /**
   * Get all orders for a user, newest first.
   */
  static async getUserOrders(userId: string) {
    return prisma.order.findMany({
      where:   { userId },
      orderBy: { createdAt: "desc" },
      include: ORDER_INCLUDE,
    })
  }

  /**
   * Get single order by ID. Verifies it belongs to user.
   */
  static async getOrderById(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where:   { id: orderId },
      include: ORDER_INCLUDE,
    })
    if (!order)           throw new Error("Order not found")
    if (order.userId !== userId) throw new Error("Forbidden")
    return order
  }

  /**
   * Create an order from the user's cart.
   * Validates stock → creates order → decrements stock → clears cart.
   * All in one atomic transaction.
   */
  static async createOrder(userId: string, input: CreateOrderInput) {
    const cart = await prisma.cart.findUnique({
      where:   { userId },
      include: { items: { include: { product: true } } },
    })

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty")
    }

    // Stock validation
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`"${item.product.name}" has insufficient stock`)
      }
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    const order = await prisma.$transaction(async (tx) => {
      // Create order + items
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status:          "PENDING",
          shippingName:    input.shippingName,
          shippingPhone:   input.shippingPhone,
          shippingAddr:    input.shippingAddr,
          shippingCity:    input.shippingCity,
          shippingState:   input.shippingState,
          shippingZip:     input.shippingZip,
          shippingCountry: input.shippingCountry,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity:  item.quantity,
              price:     item.product.price,
            })),
          },
        },
        include: ORDER_INCLUDE,
      })

      // Decrement stock for each product
      await Promise.all(
        cart.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data:  { stock: { decrement: item.quantity } },
          })
        )
      )

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

      return newOrder
    })

    return order
  }

  /**
   * Update order status. Used by admin or payment webhook.
   */
  static async updateStatus(orderId: string, status: string) {
    return prisma.order.update({
      where: { id: orderId },
      data:  { status: status as any },
    })
  }
}