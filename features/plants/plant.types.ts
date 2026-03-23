// features/plants/plant.types.ts

import type { PlantStage } from "@prisma/client"

export type { PlantStage }

export interface RegisterPlantInput {
  qrCode:     string
  seedType:   string
  productId?: string
}

export interface UpdateStageInput {
  plantId: string
  stage:   PlantStage
}

export interface PlantResponse {
  id:        string
  userId:    string
  productId: string | null
  seedType:  string
  qrCode:    string
  stage:     PlantStage
  createdAt: string
  product: {
    id:       string
    name:     string
    slug:     string
    seedType: string
  } | null
  growthLogs: {
    id:        string
    note:      string | null
    image:     string | null
    createdAt: string
  }[]
}

export interface QRScanResponse {
  plant:   PlantResponse
  isOwner: boolean
}