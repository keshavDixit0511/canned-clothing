// features/products/product.validation.ts

import { z } from "zod"

export const createProductSchema = z.object({
  name:        z.string().min(1, "Name is required").max(200),
  slug:        z.string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().min(1, "Description is required"),
  price:       z.number().positive("Price must be positive"),
  stock:       z.number().int().min(0, "Stock cannot be negative"),
  activity:    z.string().min(1, "Activity is required"),
  seedType:    z.string().min(1, "Seed type is required"),
  images:      z.array(z.object({
    url:   z.string().url("Must be a valid URL"),
    order: z.number().int().min(0),
  })).optional(),
})

export const updateProductSchema = z.object({
  name:        z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  price:       z.number().positive().optional(),
  stock:       z.number().int().min(0).optional(),
  activity:    z.string().min(1).optional(),
  seedType:    z.string().min(1).optional(),
})

export const productQuerySchema = z.object({
  search:   z.string().optional(),
  seedType: z.string().optional(),
  sort:     z.enum(["newest", "price_asc", "price_desc", "name_asc"]).optional(),
  page:     z.coerce.number().int().min(1).optional().default(1),
  limit:    z.coerce.number().int().min(1).max(100).optional().default(20),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductQuery       = z.infer<typeof productQuerySchema>