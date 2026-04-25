import { z } from "zod"

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

export const qrCodeSchema = z
  .string()
  .min(1, "QR code is required")
  .max(255, "QR code is too long")
  .trim()

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password is too long"),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })

export const shippingAddressSchema = z.object({
  shippingName: nameSchema,
  shippingPhone: phoneSchema.unwrap().or(z.literal("")).optional(),
  shippingAddr: z.string().min(5, "Enter a full address").max(200).trim(),
  shippingCity: z.string().min(2, "Enter a city").max(100).trim(),
  shippingState: z.string().min(2, "Enter a state").max(100).trim(),
  shippingZip: pincodeSchema,
  shippingCountry: z.string().min(2).max(100).trim().default("India"),
})

export const createOrderSchema = shippingAddressSchema.extend({
  paymentProvider: z.enum(["RAZORPAY", "STRIPE"]),
})

export const registerPlantSchema = z.object({
  qrCode: qrCodeSchema,
  seedType: z.string().min(1, "Seed type is required").max(100).trim(),
  productId: z.string().min(1).optional(),
})

export const addGrowthLogSchema = z
  .object({
    plantId: z.string().min(1),
    note: z.string().max(500).trim().optional(),
    image: z.string().url("Invalid image URL").optional(),
  })
  .refine((data) => Boolean(data.note?.trim() || data.image), {
    message: "Add a note or image to log growth",
    path: ["note"],
  })

export const createReminderSchema = z.object({
  plantId: z.string().min(1),
  time: z
    .string()
    .datetime({ message: "Invalid datetime format" })
    .refine((value) => new Date(value).getTime() > Date.now(), {
      message: "Reminder time must be in the future",
    }),
})

export const createProductInterestLeadSchema = z.object({
  productId: z.string().min(1),
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.unwrap(),
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
