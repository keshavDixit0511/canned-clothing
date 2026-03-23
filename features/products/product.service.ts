// features/products/product.service.ts

import { prisma }  from "@/server/db/prisma"
import { slugify } from "@/lib/utils"
import type { CreateProductInput, UpdateProductInput, ProductQueryParams } from "./product.types"

const IMAGE_SELECT = {
  images: { orderBy: { order: "asc" as const } },
}

export class ProductService {

  /**
   * Get all products with optional filters.
   */
  static async getProducts(params: ProductQueryParams = {}) {
    const {
      search,
      seedType,
      sort   = "newest",
      page   = 1,
      limit  = 20,
    } = params

    const where: any = {}

    if (search) {
      where.OR = [
        { name:        { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { seedType:    { contains: search, mode: "insensitive" } },
      ]
    }

    if (seedType) {
      where.seedType = { equals: seedType, mode: "insensitive" }
    }

    const orderBy: any =
      sort === "price_asc"  ? { price: "asc" }  :
      sort === "price_desc" ? { price: "desc" } :
      sort === "name_asc"   ? { name:  "asc" }  :
      { createdAt: "desc" }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip:    (page - 1) * limit,
        take:    limit,
        include: IMAGE_SELECT,
      }),
      prisma.product.count({ where }),
    ])

    return { products, total, page, limit, pages: Math.ceil(total / limit) }
  }

  /**
   * Get a single product by slug.
   */
  static async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where:   { slug },
      include: IMAGE_SELECT,
    })
    if (!product) throw new Error("Product not found")
    return product
  }

  /**
   * Get a single product by ID.
   */
  static async getById(id: string) {
    const product = await prisma.product.findUnique({
      where:   { id },
      include: IMAGE_SELECT,
    })
    if (!product) throw new Error("Product not found")
    return product
  }

  /**
   * Create a new product (admin only).
   */
  static async create(input: CreateProductInput) {
    const existing = await prisma.product.findUnique({
      where: { slug: input.slug },
    })
    if (existing) throw new Error("A product with this slug already exists")

    const { images, ...data } = input

    return prisma.product.create({
      data: {
        ...data,
        images: images?.length
          ? { create: images.map((img) => ({ url: img.url, order: img.order })) }
          : undefined,
      },
      include: IMAGE_SELECT,
    })
  }

  /**
   * Update product fields (admin only).
   */
  static async update(slug: string, input: UpdateProductInput) {
    const product = await prisma.product.findUnique({ where: { slug } })
    if (!product) throw new Error("Product not found")

    return prisma.product.update({
      where:   { slug },
      data:    input,
      include: IMAGE_SELECT,
    })
  }

  /**
   * Delete a product (admin only).
   */
  static async delete(slug: string) {
    const product = await prisma.product.findUnique({ where: { slug } })
    if (!product) throw new Error("Product not found")

    return prisma.product.delete({ where: { slug } })
  }

  /**
   * Add an image to a product.
   */
  static async addImage(productId: string, url: string, order: number) {
    return prisma.productImage.create({
      data: { productId, url, order },
    })
  }

  /**
   * Remove an image from a product.
   */
  static async removeImage(imageId: string) {
    return prisma.productImage.delete({ where: { id: imageId } })
  }
}