// hooks/useEcoStats.ts
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { CO2_KG_PER_PLANT } from "@/lib/constants"
import { getErrorMessage } from "@/lib/error-message"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EcoStats {
  treesPlanted: number
  orders:       number
  ecoScore:     number
  // Derived
  co2Saved:     number
  tinsPlanted:  number
}

interface EcoState {
  data:     EcoStats | null
  loading:  boolean
  error:    string | null
  lastFetch: number | null
}

const CACHE_MS = 2 * 60 * 1000  // 2 minutes — matches CACHE_TTL.eco

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useEcoStats(options?: {
  /** Auto-refresh interval in ms. Default: no auto-refresh */
  refreshInterval?: number
  /** Start polling immediately */
  autoFetch?: boolean
}) {
  const { refreshInterval, autoFetch = true } = options ?? {}

  const [state, setState] = useState<EcoState>({
    data:      null,
    loading:   true,
    error:     null,
    lastFetch: null,
  })

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchStats = useCallback(async (force = false) => {
    // Skip if recently fetched and not forced
    if (!force && state.lastFetch && Date.now() - state.lastFetch < CACHE_MS) return

    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch("/api/eco")
      if (!res.ok) throw new Error("Failed to fetch eco stats")
      const raw = await res.json()

      const data: EcoStats = {
        treesPlanted: raw.treesPlanted ?? 0,
        orders:       raw.orders       ?? 0,
        ecoScore:     raw.ecoScore     ?? 0,
        // Derived values
        co2Saved:     (raw.treesPlanted ?? 0) * CO2_KG_PER_PLANT,
        tinsPlanted:  raw.treesPlanted  ?? 0,
      }

      setState({ data, loading: false, error: null, lastFetch: Date.now() })
    } catch (error: unknown) {
      setState((s) => ({
        ...s,
        loading: false,
        error: getErrorMessage(error, "Failed to load eco stats"),
      }))
    }
  }, [state.lastFetch])

  // Initial fetch
  useEffect(() => {
    if (autoFetch) fetchStats(true)
  }, [autoFetch, fetchStats])

  // Auto-refresh interval
  useEffect(() => {
    if (!refreshInterval) return
    timerRef.current = setInterval(() => fetchStats(true), refreshInterval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [refreshInterval, fetchStats])

  return {
    data:          state.data,
    loading:       state.loading,
    error:         state.error,
    // Convenience flat accessors
    treesPlanted:  state.data?.treesPlanted ?? 0,
    orders:        state.data?.orders       ?? 0,
    ecoScore:      state.data?.ecoScore     ?? 0,
    co2Saved:      state.data?.co2Saved     ?? 0,
    tinsPlanted:   state.data?.tinsPlanted  ?? 0,
    refetch:       () => fetchStats(true),
  }
}
