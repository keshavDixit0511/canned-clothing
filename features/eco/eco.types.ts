// features/eco/eco.types.ts

export interface EcoStatsResponse {
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