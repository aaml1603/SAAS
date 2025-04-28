"use client"

import { useMemo } from "react"
import { useTrades } from "./use-trades"
import type { Database } from "@/lib/database.types"

export type Trade = Database["public"]["Tables"]["trades"]["Row"]

export type DailyTradeStats = {
  date: string
  trades: Trade[]
  totalProfit: number
  totalInvested: number
  percentageGain: number
  hasWinningTrades: boolean
  hasLosingTrades: boolean
}

export function useCalendarTrades() {
  const { trades, isLoading, error } = useTrades()

  const tradesByDate = useMemo(() => {
    if (isLoading || error || !trades.length) {
      return {}
    }

    // Group trades by date (using exit_date for closed trades, entry_date for open trades)
    const grouped: Record<string, Trade[]> = {}

    trades.forEach((trade) => {
      // Use exit_date for closed trades, entry_date for open trades
      const date = trade.status === "closed" && trade.exit_date ? trade.exit_date : trade.entry_date

      if (!grouped[date]) {
        grouped[date] = []
      }

      grouped[date].push(trade)
    })

    return grouped
  }, [trades, isLoading, error])

  const dailyStats = useMemo(() => {
    const stats: Record<string, DailyTradeStats> = {}

    Object.entries(tradesByDate).forEach(([date, dailyTrades]) => {
      // Calculate total profit for the day
      const totalProfit = dailyTrades.reduce((sum, trade) => {
        return sum + (trade.profit || 0)
      }, 0)

      // Calculate total invested amount for the day
      const totalInvested = dailyTrades.reduce((sum, trade) => {
        return sum + trade.entry_price * trade.contracts * 100
      }, 0)

      // Calculate percentage gain
      const percentageGain = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0

      // Check if there are winning or losing trades
      const hasWinningTrades = dailyTrades.some((trade) => (trade.profit || 0) > 0)
      const hasLosingTrades = dailyTrades.some((trade) => (trade.profit || 0) < 0)

      stats[date] = {
        date,
        trades: dailyTrades,
        totalProfit,
        totalInvested,
        percentageGain,
        hasWinningTrades,
        hasLosingTrades,
      }
    })

    return stats
  }, [tradesByDate])

  return {
    dailyStats,
    isLoading,
    error,
  }
}

