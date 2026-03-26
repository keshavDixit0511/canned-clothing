import { describe, expect, it } from "vitest"
import {
  PLANT_STAGE_ORDER,
  getPlantStageIndex,
  getStageRewardPoints,
  isForwardStageTransition,
} from "@/lib/plant-progress"

describe("plant progress helpers", () => {
  it("keeps the live stage order monotonic", () => {
    expect(PLANT_STAGE_ORDER).toEqual(["SEEDED", "SPROUT", "GROWING", "MATURE"])
    expect(getPlantStageIndex("SPROUT")).toBe(1)
  })

  it("only allows one-step forward transitions", () => {
    expect(isForwardStageTransition("SEEDED", "SPROUT")).toBe(true)
    expect(isForwardStageTransition("SEEDED", "GROWING")).toBe(false)
    expect(isForwardStageTransition("GROWING", "SPROUT")).toBe(false)
  })

  it("maps stage rewards to the earned transition stage", () => {
    expect(getStageRewardPoints("SPROUT")).toBe(10)
    expect(getStageRewardPoints("GROWING")).toBe(20)
    expect(getStageRewardPoints("MATURE")).toBe(50)
  })
})
