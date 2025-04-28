"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import type { Database } from "@/lib/database.types"

export type Trade = Database["public"]["Tables"]["trades"]["Row"]

// Global state to share data between hook instances
const globalState = {
  trades: [] as Trade[],
  lastFetch: 0,
  isLoading: false,
  error: null as string | null,
  fetchPromise: null as Promise<void> | null,
}

export function useTrades() {
  const { user } = useAuth()
  const [trades, setTrades] = useState<Trade[]>(globalState.trades)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())
  const mountedRef = useRef(true)

  // Improve the initial data loading in the useTrades hook

  // Update the fetchTrades function to be more reliable on initial load
  const fetchTrades = useCallback(
    async (force = false) => {
      if (!user) return

      // If there's already a fetch in progress, wait for it
      if (globalState.fetchPromise && !force) {
        await globalState.fetchPromise
        return
      }

      // Set loading state immediately
      setIsLoading(true)
      globalState.isLoading = true

      const fetchPromise = (async () => {
        try {
          console.log("Client: 🔍 Fetching trades for user:", user.id)

          const { data, error: supabaseError } = await supabase
            .from("trades")
            .select("*")
            .eq("user_id", user.id)
            .order("entry_date", { ascending: false })

          if (supabaseError) {
            console.error("Client: ❌ Error fetching trades:", supabaseError)
            setError(supabaseError.message)
            globalState.error = supabaseError.message
            return
          }

          console.log(`Client: ✅ Trades fetched successfully: ${data?.length || 0} trades`)

          // Update state with the fetched data
          setTrades(data || [])
          globalState.trades = data || []
          globalState.lastFetch = Date.now()
          setLastUpdate(Date.now())
        } catch (err) {
          console.error("Client: ❌ Unexpected error in fetchTrades:", err)
          const errorMessage = err instanceof Error ? err.message : "Failed to fetch trades. Please try again later."
          setError(errorMessage)
          globalState.error = errorMessage
        } finally {
          setIsLoading(false)
          globalState.isLoading = false
          globalState.fetchPromise = null
        }
      })()

      globalState.fetchPromise = fetchPromise
      return fetchPromise
    },
    [user],
  )

  // Function to manually refresh the data
  const mutate = useCallback(() => {
    return fetchTrades(true)
  }, [fetchTrades])

  // Update the initial fetch effect to be more aggressive
  useEffect(() => {
    mountedRef.current = true

    if (user) {
      console.log("Client: 🚀 Initial trades fetch triggered")
      // Force an immediate fetch on mount
      fetchTrades(true)
    }

    return () => {
      mountedRef.current = false
    }
  }, [user, fetchTrades])

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`trades-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trades",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (!mountedRef.current) return

          if (payload.eventType === "INSERT") {
            setTrades((prev) => [payload.new as Trade, ...prev])
            globalState.trades = [payload.new as Trade, ...globalState.trades]
          } else if (payload.eventType === "UPDATE") {
            setTrades((prev) => prev.map((trade) => (trade.id === payload.new.id ? (payload.new as Trade) : trade)))
            globalState.trades = globalState.trades.map((trade) =>
              trade.id === payload.new.id ? (payload.new as Trade) : trade,
            )
          } else if (payload.eventType === "DELETE") {
            setTrades((prev) => prev.filter((trade) => trade.id !== payload.old.id))
            globalState.trades = globalState.trades.filter((trade) => trade.id !== payload.old.id)
          }

          setLastUpdate(Date.now())
          globalState.lastFetch = Date.now()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  return { trades, isLoading, error, mutate, lastUpdate }
}

export function useOpenTrades() {
  const { trades, isLoading, error, mutate, lastUpdate } = useTrades()
  const openTrades = useMemo(() => trades.filter((trade) => trade.status === "open"), [trades])
  return { openTrades, isLoading, error, mutate, lastUpdate }
}

export function useClosedTrades() {
  const { trades, isLoading, error, mutate, lastUpdate } = useTrades()
  const closedTrades = useMemo(() => trades.filter((trade) => trade.status === "closed"), [trades])
  return { closedTrades, isLoading, error, mutate, lastUpdate }
}

export function useTradeStats() {
  const { trades, isLoading, error, mutate, lastUpdate } = useTrades()

  const stats = useMemo(() => {
    const calculatedStats = {
      totalTrades: trades.length,
      openTrades: trades.filter((t) => t.status === "open").length,
      closedTrades: trades.filter((t) => t.status === "closed").length,
      winningTrades: trades.filter((t) => t.profit !== null && t.profit > 0).length,
      losingTrades: trades.filter((t) => t.profit !== null && t.profit <= 0).length,
      totalProfit: trades.reduce((sum, t) => sum + (t.profit || 0), 0),
      winRate: 0,
      averageProfit: 0,
      averageLoss: 0,
      profitFactor: 0,
      largestGain: 0,
    }

    const closedTrades = trades.filter((t) => t.status === "closed")
    if (closedTrades.length > 0) {
      calculatedStats.winRate = (calculatedStats.winningTrades / closedTrades.length) * 100

      const winningTradesData = trades.filter((t) => t.profit !== null && t.profit > 0)
      if (winningTradesData.length > 0) {
        calculatedStats.averageProfit =
          winningTradesData.reduce((sum, t) => sum + (t.profit || 0), 0) / winningTradesData.length

        // Calculate largest gain
        calculatedStats.largestGain = Math.max(...winningTradesData.map((t) => t.profit || 0))
      }

      const losingTradesData = trades.filter((t) => t.profit !== null && t.profit <= 0)
      if (losingTradesData.length > 0) {
        calculatedStats.averageLoss =
          losingTradesData.reduce((sum, t) => sum + (t.profit || 0), 0) / losingTradesData.length
      }

      // Calculate profit factor (gross profit / gross loss)
      const grossProfit = winningTradesData.reduce((sum, t) => sum + (t.profit || 0), 0)
      const grossLoss = Math.abs(losingTradesData.reduce((sum, t) => sum + (t.profit || 0), 0))

      calculatedStats.profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0
    }

    return calculatedStats
  }, [trades])

  return { stats, isLoading, error, mutate, lastUpdate }
}

