// types/eco.ts

export interface EcoStats {
  treesPlanted: number
  orders:       number
  ecoScore:     number
  co2Saved:     number
}

export interface GlobalEcoStats {
  totalTins:     number
  totalPlants:   number
  totalCO2:      number
  activeGrowers: number
}

export interface LeaderboardEntry {
  rank:        number
  points:      number
  plantsCount: number
  user: {
    name:  string | null
    image: string | null
  }
}

export interface UserRank {
  points: number
  rank:   number | null
}

// Milestone definitions for eco-impact page
export interface EcoMilestone {
  target:  number
  label:   string
  emoji:   string
  xp:      number
}

export const ECO_MILESTONES: EcoMilestone[] = [
  { target: 1,  label: "First Tin",      emoji: "🥇", xp: 100  },
  { target: 3,  label: "Trio Grower",    emoji: "🌿", xp: 300  },
  { target: 5,  label: "Eco Enthusiast", emoji: "♻️",  xp: 500  },
  { target: 10, label: "Green Pioneer",  emoji: "🌳", xp: 1000 },
  { target: 25, label: "Eco Champion",   emoji: "🏆", xp: 2500 },
  { target: 50, label: "Carbon Hero",    emoji: "🌏", xp: 5000 },
]

export const CO2_KG_PER_PLANT    = 21
export const ECO_SCORE_PER_PLANT = 10