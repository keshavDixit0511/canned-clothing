// hooks/usePlants.ts
"use client"

import { useState, useEffect, useCallback } from "react"
import { PLANT_STAGES } from "@/lib/constants"
import { getErrorMessage } from "@/lib/error-message"
import { parseApiResponse } from "@/lib/api-client"

// ─── Types ────────────────────────────────────────────────────────────────────

export type PlantStage = "SEEDED" | "SPROUT" | "GROWING" | "MATURE"

export interface GrowthLog {
  id:        string
  plantId:   string
  userId:    string
  note:      string | null
  image:     string | null
  createdAt: string
}

export interface PlantProduct {
  id:   string
  name: string
  slug: string
}

export interface Plant {
  id:        string
  userId:    string
  productId: string | null
  seedType:  string
  qrCode:    string
  stage:     PlantStage
  createdAt: string
  product:   PlantProduct | null
  growthLogs: GrowthLog[]
}

export interface RegisterPlantPayload {
  qrCode: string
  seedType:  string
  productId?: string
}

export interface AddGrowthLogPayload {
  plantId: string
  note?:   string
  image?:  string
}

export interface UpdateStagePayload {
  plantId: string
  stage:   PlantStage
}

interface PlantsState {
  plants:  Plant[]
  loading: boolean
  error:   string | null
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePlants() {
  const [state, setState] = useState<PlantsState>({
    plants:  [],
    loading: true,
    error:   null,
  })

  // ── Fetch all user plants ─────────────────────────────────────────────────
  const fetchPlants = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch("/api/plant", { credentials: "include" })
      if (!res.ok) {
        if (res.status === 401) {
          setState({ plants: [], loading: false, error: null })
          return
        }
        throw new Error("Failed to fetch plants")
      }
      const data = await res.json()
      setState({ plants: Array.isArray(data) ? data : [], loading: false, error: null })
    } catch (error: unknown) {
      setState((s) => ({ ...s, loading: false, error: getErrorMessage(error, "Failed to load plants") }))
    }
  }, [])

  useEffect(() => {
    fetchPlants()
  }, [fetchPlants])

  // ── Fetch single plant by QR code ─────────────────────────────────────────
  const getPlantByQR = useCallback(
    async (qrCode: string): Promise<{ plant: Plant | null; isOwner: boolean; error?: string }> => {
      try {
      const res = await fetch(`/api/plant?qrCode=${encodeURIComponent(qrCode)}`, {
          credentials: "include",
        })
        if (res.status === 404) return { plant: null, isOwner: false, error: "Plant not found" }
        const parsed = await parseApiResponse<{ plant: Plant; isOwner: boolean }>(res)
        if (!parsed.ok) throw new Error(parsed.error)
        const data = parsed.data
        return { plant: data.plant, isOwner: data.isOwner }
      } catch (error: unknown) {
        return { plant: null, isOwner: false, error: getErrorMessage(error, "Failed to fetch plant") }
      }
    },
    []
  )

  // ── Register new plant ────────────────────────────────────────────────────
  const registerPlant = useCallback(
    async (payload: RegisterPlantPayload): Promise<{ success: boolean; plant?: Plant; error?: string }> => {
      try {
        const res = await fetch("/api/plant/register", {
          method:      "POST",
          headers:     { "Content-Type": "application/json" },
          credentials: "include",
          body:        JSON.stringify(payload),
        })
        const parsed = await parseApiResponse<Plant>(res)
        if (!parsed.ok) return { success: false, error: parsed.error }
        const data = parsed.data

        setState((s) => ({ ...s, plants: [data, ...s.plants] }))
        return { success: true, plant: data }
      } catch {
        return { success: false, error: "Network error" }
      }
    },
    []
  )

  // ── Add growth log ────────────────────────────────────────────────────────
  const addGrowthLog = useCallback(
    async (payload: AddGrowthLogPayload): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch("/api/plant/log", {
          method:      "POST",
          headers:     { "Content-Type": "application/json" },
          credentials: "include",
          body:        JSON.stringify(payload),
        })
        const parsed = await parseApiResponse<GrowthLog>(res)
        if (!parsed.ok) return { success: false, error: parsed.error }
        const data = parsed.data

        // Update plant in local state with new log
        setState((s) => ({
          ...s,
          plants: s.plants.map((p) =>
            p.id === payload.plantId
              ? { ...p, growthLogs: [data, ...p.growthLogs] }
              : p
          ),
        }))
        return { success: true }
      } catch {
        return { success: false, error: "Network error" }
      }
    },
    []
  )

  // ── Update plant stage ────────────────────────────────────────────────────
  const updateStage = useCallback(
    async (payload: UpdateStagePayload): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch("/api/plant", {
          method:      "PATCH",
          headers:     { "Content-Type": "application/json" },
          credentials: "include",
          body:        JSON.stringify(payload),
        })
        const parsed = await parseApiResponse<Plant>(res)
        if (!parsed.ok) return { success: false, error: parsed.error }

        setState((s) => ({
          ...s,
          plants: s.plants.map((p) =>
            p.id === payload.plantId ? { ...p, stage: payload.stage } : p
          ),
        }))
        return { success: true }
      } catch {
        return { success: false, error: "Network error" }
      }
    },
    []
  )

  // ── Set water reminder ────────────────────────────────────────────────────
  const setReminder = useCallback(
    async (plantId: string, time: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch("/api/plant/reminder", {
          method:      "POST",
          headers:     { "Content-Type": "application/json" },
          credentials: "include",
          body:        JSON.stringify({ plantId, time }),
        })
        const parsed = await parseApiResponse<{ id: string }>(res)
        if (!parsed.ok) return { success: false, error: parsed.error }
        return { success: true }
      } catch {
        return { success: false, error: "Network error" }
      }
    },
    []
  )

  // ── Derived ───────────────────────────────────────────────────────────────
  const getPlantById = useCallback(
    (id: string) => state.plants.find((p) => p.id === id) ?? null,
    [state.plants]
  )

  const getStageIndex = (stage: PlantStage) => PLANT_STAGES.indexOf(stage)

  const getStageProgress = (stage: PlantStage) =>
    ((getStageIndex(stage) + 1) / PLANT_STAGES.length) * 100

  const maturePlants  = state.plants.filter((p) => p.stage === "MATURE")
  const activePlants  = state.plants.filter((p) => p.stage !== "MATURE")

  return {
    plants:          state.plants,
    loading:         state.loading,
    error:           state.error,
    maturePlants,
    activePlants,
    totalPlants:     state.plants.length,
    getPlantById,
    getPlantByQR,
    getStageIndex,
    getStageProgress,
    registerPlant,
    addGrowthLog,
    updateStage,
    setReminder,
    refetch:         fetchPlants,
  }
}
