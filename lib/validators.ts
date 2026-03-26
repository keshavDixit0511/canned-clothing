import { z } from "zod"
import {
  LEAD_STATUSES,
  PRODUCT_AVAILABILITY_STATUSES,
} from "@/lib/commerce"

function isValidImageSource(value: string) {
  if (!value.trim()) return false

  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return value.startsWith("/")
  }
}

const productImageSchema = z.object({
  url: z
    .string()
    .min(1, "Image URL is required")
    .trim()
    .refine(
      isValidImageSource,
      "Image URL must be an absolute URL or a site-relative path"
    ),
  order: z.number().int().min(0),
})

// ─── Primitives ───────────────────────────────────────────────────────────────

export const emailSchema = z
  .string({ message: "Email is required" })
  .email("Enter a valid email address")
  .toLowerCase()
  .trim()

export const passwordSchema = z
  .string({ message: "Password is required" })
  .min(6, "Password must be at least 6 characters")
  .max(72, "Password is too long")

export const nameSchema = z
  .string({ message: "Name is required" })
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name is too long")
  .trim()

export const phoneSchema = z
  .string()
  .regex(/^(\+91|0)?[6-9]\d{9}$/, "Enter a valid Indian mobile number")
  .optional()

export const pincodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode")

export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")

export const cuidSchema = z
  .string()
  .min(1, "ID is required")

export const qrCodeSchema = z
  .string()
  .min(1, "QR code is required")
  .max(255, "QR code is too long")
  .trim()

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name:     nameSchema,
  email:    emailSchema,
  password: passwordSchema,
})

export const loginSchema = z.object({
  email:    emailSchema,
  password: passwordSchema,
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput    = z.infer<typeof loginSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password is too long"),
  })
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message: "New password must be different from current password",
      path: ["newPassword"],
    }
  )

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// ─── Shipping Address ─────────────────────────────────────────────────────────

export const shippingAddressSchema = z.object({
  shippingName:    nameSchema,
  shippingPhone:   phoneSchema.unwrap().or(z.literal("")).optional(),
  shippingAddr:    z.string().min(5, "Enter a full address").max(200).trim(),
  shippingCity:    z.string().min(2, "Enter a city").max(100).trim(),
  shippingState:   z.string().min(2, "Enter a state").max(100).trim(),
  shippingZip:     pincodeSchema,
  shippingCountry: z.string().min(2).max(100).trim().default("India"),
})

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const addToCartSchema = z.object({
  productId: cuidSchema,
  quantity:  z.number().int().min(1).max(10).default(1),
})

export const updateCartItemSchema = z.object({
  productId: cuidSchema,
  quantity:  z.number().int().min(1).max(10),
})

export const removeCartItemSchema = z.object({
  productId: cuidSchema,
})

export type AddToCartInput    = z.infer<typeof addToCartSchema>
export type UpdateCartInput   = z.infer<typeof updateCartItemSchema>
export type RemoveCartInput   = z.infer<typeof removeCartItemSchema>

// ─── Order ────────────────────────────────────────────────────────────────────

export const createOrderSchema = shippingAddressSchema.extend({
  paymentProvider: z.enum(["RAZORPAY", "STRIPE"]),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>

// ─── Payment ──────────────────────────────────────────────────────────────────

export const verifyPaymentSchema = z.object({
  orderId:     cuidSchema,
  providerRef: z.string().min(1, "Payment reference is required"),
  provider:    z.enum(["RAZORPAY", "STRIPE"]),
})

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>

// ─── Plant ────────────────────────────────────────────────────────────────────

export const registerPlantSchema = z.object({
  qrCode:    qrCodeSchema,
  seedType:  z.string().min(1, "Seed type is required").max(100).trim(),
  productId: cuidSchema.optional(),
})

export const updatePlantStageSchema = z.object({
  plantId: cuidSchema,
  stage:   z.enum(["SEEDED", "SPROUT", "GROWING", "MATURE"]),
})

export type RegisterPlantInput    = z.infer<typeof registerPlantSchema>
export type UpdatePlantStageInput = z.infer<typeof updatePlantStageSchema>

// ─── Growth Log ───────────────────────────────────────────────────────────────

export const addGrowthLogSchema = z.object({
  plantId: cuidSchema,
  note:    z.string().max(500).trim().optional(),
  image:   z.string().url("Invalid image URL").optional(),
}).refine(
  (data) => Boolean(data.note?.trim() || data.image),
  {
    message: "Add a note or image to log growth",
    path: ["note"],
  }
)

export type AddGrowthLogInput = z.infer<typeof addGrowthLogSchema>

// ─── Reminder ─────────────────────────────────────────────────────────────────

export const createReminderSchema = z.object({
  plantId: cuidSchema,
  time:    z
    .string()
    .datetime({ message: "Invalid datetime format" })
    .refine((value) => new Date(value).getTime() > Date.now(), {
      message: "Reminder time must be in the future",
    }),
})

export type CreateReminderInput = z.infer<typeof createReminderSchema>

// ─── Product (Admin) ──────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name:        z.string().min(2).max(200).trim(),
  slug:        slugSchema,
  description: z.string().min(10).max(5000).trim(),
  price:       z.number().positive("Price must be positive"),
  stock:       z.number().int().min(0),
  availabilityStatus: z.enum(PRODUCT_AVAILABILITY_STATUSES).default("IN_STOCK"),
  activity:    z.string().min(1).max(100).trim(),
  seedType:    z.string().min(1).max(100).trim(),
  images:      z
    .array(productImageSchema)
    .min(1, "At least one image is required"),
})

export const updateProductSchema = z
  .object({
    name: z.string().min(2).max(200).trim().optional(),
    slug: slugSchema.optional(),
    description: z.string().min(10).max(5000).trim().optional(),
    price: z.number().positive("Price must be positive").optional(),
    stock: z.number().int().min(0).optional(),
    availabilityStatus: z.enum(PRODUCT_AVAILABILITY_STATUSES).optional(),
    activity: z.string().min(1).max(100).trim().optional(),
    seedType: z.string().min(1).max(100).trim().optional(),
    images: z
      .array(productImageSchema)
      .min(1, "At least one image is required")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>

// â”€â”€â”€ Product Interest Lead â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const requiredPhoneSchema = phoneSchema.unwrap()

export const createProductInterestLeadSchema = z.object({
  productId: cuidSchema,
  name: nameSchema,
  email: emailSchema,
  phone: requiredPhoneSchema,
  city: z.string().max(100).trim().optional(),
  likedConcept: z.enum(["YES", "MAYBE", "NO"]),
  willingToPayRange: z.enum([
    "PRICE_999_1299",
    "PRICE_1299_1599",
    "PRICE_1599_1999",
    "PRICE_1999_PLUS",
  ]),
  wouldRecommend: z.enum(["YES", "MAYBE", "NO"]),
  comment: z.string().max(1000).trim().optional(),
})

export type CreateProductInterestLeadInput = z.infer<typeof createProductInterestLeadSchema>

export const updateProductInterestLeadSchema = z.object({
  status: z.enum(LEAD_STATUSES),
  adminNotes: z.string().max(2000).trim().optional(),
})

export type UpdateProductInterestLeadInput = z.infer<typeof updateProductInterestLeadSchema>

// ─── Upload ───────────────────────────────────────────────────────────────────

export const uploadResponseSchema = z.object({
  url: z.string().url(),
  key: z.string(),
})

export type UploadResponse = z.infer<typeof uploadResponseSchema>

// ─── Pagination Query ─────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
})

export type PaginationInput = z.infer<typeof paginationSchema>

// ─── Product Query ────────────────────────────────────────────────────────────

export const productQuerySchema = paginationSchema.extend({
  search:   z.string().trim().optional(),
  seedType: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy:   z.enum(["price_asc", "price_desc", "newest", "popular"]).optional(),
})

export type ProductQueryInput = z.infer<typeof productQuerySchema>
