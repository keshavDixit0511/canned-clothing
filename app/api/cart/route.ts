// app/api/cart/route.ts

import { NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { addToCartSchema, updateCartItemSchema, removeCartItemSchema } from "@/lib/validators"
import { requireSession, isAuthError } from "@/lib/auth"
import { getErrorMessage } from "@/lib/error-message"

// ─── Helper: get or create Cart for user ──────────────────────────────────────

async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({ where: { userId } })
  if (existing) return existing
  return prisma.cart.create({ data: { userId } })
}

// ─── GET /api/cart ─────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const payload = await requireSession(req)

    const cart = await prisma.cart.findUnique({
      where: { userId: payload.userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    })

    // Return empty items array if no cart exists yet
    return NextResponse.json({
      items: cart?.items ?? [],
      cartId: cart?.id ?? null,
    })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("CART_FETCH_ERROR", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

// ─── POST /api/cart — Add item ─────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const payload = await requireSession(req)
    const body = await req.json()
    const { productId, quantity } = addToCartSchema.parse(body)

    // Verify product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    if (product.stock < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    const cart = await getOrCreateCart(payload.userId)

    // If item already in cart, increment quantity
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    })

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: { include: { images: true } } },
      })
      return NextResponse.json(updated)
    }

    const item = await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
      include: { product: { include: { images: true } } },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("CART_ADD_ERROR", error)
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to add item") },
      { status: 500 }
    )
  }
}

// ─── PATCH /api/cart — Update quantity ────────────────────────────────────────

export async function PATCH(req: Request) {
  try {
    const payload = await requireSession(req)
    const body = await req.json()
    const { productId, quantity } = updateCartItemSchema.parse(body)

    const cart = await prisma.cart.findUnique({
      where: { userId: payload.userId },
    })
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    const item = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    })
    if (!item) {
      return NextResponse.json({ error: "Item not in cart" }, { status: 404 })
    }

    const updated = await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
      include: { product: { include: { images: true } } },
    })

    return NextResponse.json(updated)
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("CART_UPDATE_ERROR", error)
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to update cart") },
      { status: 500 }
    )
  }
}

// ─── DELETE /api/cart — Remove item ───────────────────────────────────────────

export async function DELETE(req: Request) {
  try {
    const payload = await requireSession(req)
    const body = await req.json()
    const { productId } = removeCartItemSchema.parse(body)

    const cart = await prisma.cart.findUnique({
      where: { userId: payload.userId },
    })
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    const item = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    })
    if (!item) {
      return NextResponse.json({ error: "Item not in cart" }, { status: 404 })
    }

    await prisma.cartItem.delete({ where: { id: item.id } })

    return NextResponse.json({ message: "Item removed" })
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("CART_DELETE_ERROR", error)
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to remove item") },
      { status: 500 }
    )
  }
}
