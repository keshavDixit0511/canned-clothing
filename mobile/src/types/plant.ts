export type PlantStage = "SEEDED" | "SPROUT" | "GROWING" | "MATURE"

export interface GrowthLog {
  id: string
  plantId: string
  userId: string
  note: string | null
  image: string | null
  createdAt: string
}

export interface Reminder {
  id: string
  userId: string
  plantId: string
  time: string
  createdAt: string
  plant?: {
    id: string
    seedType: string
    stage: PlantStage
    qrCode: string
  }
}

export interface Plant {
  id: string
  userId: string
  productId: string | null
  seedType: string
  qrCode: string
  stage: PlantStage
  createdAt: string
  product: {
    id: string
    name: string
    slug: string
    seedType: string
  } | null
  growthLogs: GrowthLog[]
  reminders?: Reminder[]
}
