// features/plants/plant.validation.ts

import { z }          from "zod"
import { PlantStage } from "@prisma/client"

export const registerPlantSchema = z.object({
  qrCode:    z.string().min(1, "QR code is required"),
  seedType:  z.string().min(1, "Seed type is required").max(50),
  productId: z.string().optional(),
})

export const updateStageSchema = z.object({
  plantId: z.string().min(1, "plantId is required"),
  stage:   z.nativeEnum(PlantStage, { message: "Invalid stage" }),
})

export const addGrowthLogSchema = z.object({
  plantId: z.string().min(1, "plantId is required"),
  note:    z.string().max(1000).optional().nullable(),
  image:   z.string().url("Must be a valid URL").optional().nullable(),
})

export const setReminderSchema = z.object({
  plantId: z.string().min(1, "plantId is required"),
  time:    z.string().refine((v) => !isNaN(Date.parse(v)), "Must be a valid date"),
})

export type RegisterPlantInput = z.infer<typeof registerPlantSchema>
export type UpdateStageInput   = z.infer<typeof updateStageSchema>
export type AddGrowthLogInput  = z.infer<typeof addGrowthLogSchema>
export type SetReminderInput   = z.infer<typeof setReminderSchema>