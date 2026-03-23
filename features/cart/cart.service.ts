// features/cart/cart.service.ts

import { prisma } from "@/server/db/prisma"
import type { CartItemInput, CartItemUpdateInput } from "./cart.types"

const CART_INCLUDE = {
  items: {
    include: {
      product: {
        select: {
          id:     true,
          name:   true,
          slug:   true,
          price:  true,
          stock:  true,
          images: { orderBy: { order: "asc" as const }, take: 1 },
        },
      },
    },
  },
} as const

export class CartService {

  /**
   * Get cart for user. Creates one if it doesn't exist.
   */
  static async getCart(userId: string) {
    const existing = await prisma.cart.findUnique({
      where:   { userId },
      include: CART_INCLUDE,
    })
    if (existing) return existing

    return prisma.cart.create({
      data:    { userId },
      include: CART_INCLUDE,
    })
  }

  /**
   * Add item to cart.
   * Merges quantity if same product already in cart.
   * Validates stock before adding.
   */
  static async addItem(userId: string, input: CartItemInput) {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    })
    if (!product) throw new Error("Product not found")
    if (product.stock < 1) throw new Error("Product is out of stock")

    // Get or create cart
    let cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } })
    }

    // Check if item already exists
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: input.productId },
    })

    if (existing) {
      const newQty = existing.quantity + input.quantity
      if (product.stock < newQty) {
        throw new Error(`Only ${product.stock} unit(s) available`)
      }
      await prisma.cartItem.update({
        where: { id: existing.id },
        data:  { quantity: newQty },
      })
    } else {
      if (product.stock < input.quantity) {
        throw new Error(`Only ${product.stock} unit(s) available`)
      }
      await prisma.cartItem.create({
        data: {
          cartId:    cart.id,
          productId: input.productId,
          quantity:  input.quantity,
        },
      })
    }

    return CartService.getCart(userId)
  }

  /**
   * Update quantity of a cart item.
   * Removes item if quantity reaches 0.
   */
  static async updateItem(userId: string, input: CartItemUpdateInput) {
    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) throw new Error("Cart not found")

    const item = await prisma.cartItem.findFirst({
      where: { id: input.cartItemId, cartId: cart.id },
    })
    if (!item) throw new Error("Cart item not found")

    if (input.quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: input.cartItemId } })
    } else {
      await prisma.cartItem.update({
        where: { id: input.cartItemId },
        data:  { quantity: input.quantity },
      })
    }

    return CartService.getCart(userId)
  }

  /**
   * Remove a specific item from cart.
   */
  static async removeItem(userId: string, cartItemId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) throw new Error("Cart not found")

    const item = await prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id },
    })
    if (!item) throw new Error("Cart item not found")

    await prisma.cartItem.delete({ where: { id: cartItemId } })
    return CartService.getCart(userId)
  }

  /**
   * Remove all items from cart.
   */
  static async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) return
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  }
}