"use client"

import { BarChart2, TrendingUp, RefreshCw, PieChart, Calendar } from "lucide-react"
import { useTradeStats } from "@/hooks/use-trades"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function PerformanceContent() {
  const { stats, isLoading, error } = useTradeStats()
  const [timeframe, setTimeframe] = useState<"all" | "month" | "quarter" | "year">("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-900/30 text-red-400 p-4 rounded-lg">Error loading performance data: {error}</div>
  }

  const handleRefresh = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      // Use the same refresh method as after adding a trade
      router.refresh()
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setTimeout(() => {
        setIsRefreshing(false)
      }, 500) // Add a small delay so the spinner is visible
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Performance Analytics</h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center p-1.5 text-gray-400 hover:text-white hover:bg-[#1F1F23] rounded-md transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="bg-[#1F1F23] border border-[#2B2B30] rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="all">All Time</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0F0F12] rounded-xl p-6 border border-[#1F1F23]">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-green-900/30 text-green-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Performance Summary</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Total P&L</p>
              <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                ${stats.totalProfit.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Win Rate</p>
              <p className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Trades</p>
              <p className="text-2xl font-bold text-white">{stats.totalTrades}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0F0F12] rounded-xl p-6 border border-[#1F1F23]">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-blue-900/30 text-blue-400">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Trade Metrics</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Winning Trades</p>
              <p className="text-2xl font-bold text-green-400">{stats.winningTrades}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Losing Trades</p>
              <p className="text-2xl font-bold text-red-400">{stats.losingTrades}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Average Win</p>
              <p className="text-2xl font-bold text-green-400">
                ${stats.averageProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#0F0F12] rounded-xl p-6 border border-[#1F1F23]">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-purple-900/30 text-purple-400">
              <PieChart className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Profit Factor</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Profit/Loss Ratio</p>
              <p className="text-2xl font-bold text-white">{stats.profitFactor.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Description</p>
              <p className="text-sm text-gray-400">
                Ratio of gross profit to gross loss. Values above 1.5 indicate a profitable strategy.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#0F0F12] rounded-xl p-6 border border-[#1F1F23]">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-amber-900/30 text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Largest Gain</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Best Single Trade</p>
              <p className="text-2xl font-bold text-green-400">
                ${stats.largestGain.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Description</p>
              <p className="text-sm text-gray-400">
                Your biggest winning trade. Aim to replicate the strategy that led to this success.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

