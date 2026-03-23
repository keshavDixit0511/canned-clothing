// hooks/useLeaderboard.ts
"use client"

import { useState, useEffect, useCallback } from "react"
import { LEADERBOARD_PAGE_SIZE } from "@/lib/constants"
import { getErrorMessage } from "@/lib/error-message"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank:        number
  user:        { name: string | null; image: string | null }
  points:      number
  plantsCount: number
}

export interface MyRank {
  points: number
  rank:   number | null
}

interface LeaderboardState {
  entries:  LeaderboardEntry[]
  myRank:   MyRank | null
  loading:  boolean
  error:    string | null
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLeaderboard(options?: {
  /** How many entries to fetch. Default: LEADERBOARD_PAGE_SIZE (10) */
  limit?: number
  /** Whether to also fetch the current user's rank. Default: true */
  fetchMyRank?: boolean
}) {
  const { limit = LEADERBOARD_PAGE_SIZE, fetchMyRank = true } = options ?? {}

  const [state, setState] = useState<LeaderboardState>({
    entries:  [],
    myRank:   null,
    loading:  true,
    error:    null,
  })

  const fetchAll = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      // Run both in parallel
      const requests: Promise<Response>[] = [
        fetch(`/api/leaderboard?limit=${limit}`),
      ]
      if (fetchMyRank) {
        requests.push(fetch("/api/leaderboard/me", { credentials: "include" }))
      }

      const results = await Promise.allSettled(requests)

      // ── Leaderboard entries ────────────────────────────────────────────
      let entries: LeaderboardEntry[] = []
      const listResult = results[0]
      if (listResult.status === "fulfilled" && listResult.value.ok) {
        entries = await listResult.value.json()
      }

      // ── My rank ───────────────────────────────────────────────────────
      let myRank: MyRank | null = null
      if (fetchMyRank && results[1]) {
        const meResult = results[1]
        if (meResult.status === "fulfilled" && meResult.value.ok) {
          myRank = await meResult.value.json()
        }
      }

      setState({ entries, myRank, loading: false, error: null })
    } catch (error: unknown) {
      setState((s) => ({
        ...s,
        loading: false,
        error: getErrorMessage(error, "Failed to load leaderboard"),
      }))
    }
  }, [limit, fetchMyRank])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const topThree   = state.entries.slice(0, 3)
  const isOnBoard  = state.entries.some(
    (e) => state.myRank && e.points === state.myRank.points
  )

  return {
    entries:    state.entries,
    myRank:     state.myRank,
    loading:    state.loading,
    error:      state.error,
    topThree,
    isOnBoard,
    refetch:    fetchAll,
  }
}
