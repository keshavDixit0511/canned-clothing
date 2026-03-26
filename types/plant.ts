// types/plant.ts

export type PlantStage = "SEEDED" | "SPROUT" | "GROWING" | "MATURE"

export interface GrowthLog {
  id:        string
  plantId:   string
  userId:    string
  note:      string | null
  image:     string | null
  createdAt: string
}

export interface Reminder {
  id:        string
  userId:    string
  plantId:   string
  time:      string
  createdAt: string
  plant?: {
    id:       string
    seedType: string
    stage:    PlantStage
    qrCode:   string
  }
}

export interface Plant {
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
  growthLogs: GrowthLog[]
  reminders?: Reminder[]
}

export interface PublicPlantScan {
  id:        string
  seedType:  string
  stage:     PlantStage
  createdAt: string
  product: {
    id:       string
    name:     string
    slug:     string
    seedType: string
  } | null
}

export interface PlantSummary {
  id:        string
  seedType:  string
  stage:     PlantStage
  qrCode:    string
  createdAt: string
}

export interface RegisterPlantInput {
  qrCode:     string
  seedType:   string
  productId?: string
}

export interface AddGrowthLogInput {
  plantId: string
  note?:   string | null
  image?:  string | null
}

export interface SetReminderInput {
  plantId: string
  time:    string  // ISO date string
}

export type QRScanResponse =
  | {
      plant:   Plant
      isOwner: true
    }
  | {
      plant:   PublicPlantScan
      isOwner: false
    }

// Stage metadata for UI
export interface StageConfig {
  label:  string
  emoji:  string
  color:  string
  glow:   string
  xp:     number
  maxXp:  number
  quest:  string
}

export const STAGE_ORDER: PlantStage[] = [
  "SEEDED",
  "SPROUT",
  "GROWING",
  "MATURE",
]

export const STAGE_CONFIG: Record<PlantStage, StageConfig> = {
  SEEDED: {
    label: "Seeded",
    emoji: "🌱",
    color: "text-amber-400",
    glow:  "#f59e0b",
    xp:    100,
    maxXp: 250,
    quest: "Keep soil moist for 5 days to unlock SPROUT stage",
  },
  SPROUT: {
    label: "Sprouting",
    emoji: "🌿",
    color: "text-lime-400",
    glow:  "#a3e635",
    xp:    250,
    maxXp: 600,
    quest: "Move to sunlight and thin to one seedling to continue growing",
  },
  GROWING: {
    label: "Growing",
    emoji: "🪴",
    color: "text-green-400",
    glow:  "#4ade80",
    xp:    600,
    maxXp: 1000,
    quest: "Water deeply every 2 days — full sun unlocks MATURE stage",
  },
  MATURE: {
    label: "Mature",
    emoji: "🌳",
    color: "text-emerald-400",
    glow:  "#34d399",
    xp:    1000,
    maxXp: 1000,
    quest: "Your plant has reached full potential. You're an eco champion!",
  },
}
