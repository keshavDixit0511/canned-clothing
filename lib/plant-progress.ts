import type { PlantStage } from "@/types/plant"

export const PLANT_STAGE_ORDER: PlantStage[] = [
  "SEEDED",
  "SPROUT",
  "GROWING",
  "MATURE",
]

const STAGE_REWARDS: Partial<Record<PlantStage, number>> = {
  SPROUT: 10,
  GROWING: 20,
  MATURE: 50,
}

export function getPlantStageIndex(stage: PlantStage) {
  return PLANT_STAGE_ORDER.indexOf(stage)
}

export function isForwardStageTransition(
  currentStage: PlantStage,
  nextStage: PlantStage
) {
  const currentIndex = getPlantStageIndex(currentStage)
  const nextIndex = getPlantStageIndex(nextStage)

  if (currentIndex < 0 || nextIndex < 0) return false
  return nextIndex === currentIndex + 1
}

export function getStageRewardPoints(stage: PlantStage) {
  return STAGE_REWARDS[stage] ?? 0
}

