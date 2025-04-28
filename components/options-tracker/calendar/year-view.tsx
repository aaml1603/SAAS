"use client"

import { cn } from "@/lib/utils"
import type { DailyTradeStats } from "@/hooks/use-calendar-trades"

interface YearViewProps {
  currentYear: number
  dailyStats: Record<string, DailyTradeStats>
}

export default function YearView({ currentYear, dailyStats }: YearViewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
      {Array.from({ length: 12 }, (_, monthIndex) => {
        const monthDate = new Date(currentYear, monthIndex, 1)
        const monthName = monthDate.toLocaleString("default", { month: "long" })

        // Filter trades for this month
        const monthTrades = Object.entries(dailyStats).filter(([date]) => {
          const tradeDate = new Date(date)
          return tradeDate.getFullYear() === currentYear && tradeDate.getMonth() === monthIndex
        })

        // Calculate monthly stats
        const monthlyProfit = monthTrades.reduce((sum, [_, stats]) => sum + stats.totalProfit, 0)
        const winningDays = monthTrades.filter(([_, stats]) => stats.totalProfit > 0).length
        const losingDays = monthTrades.filter(([_, stats]) => stats.totalProfit < 0).length
        const tradingDays = monthTrades.length
        const winRate = tradingDays > 0 ? (winningDays / tradingDays) * 100 : 0

        return (
          <div
            key={monthIndex}
            className={cn(
              "bg-[#0F0F12] border border-[#1F1F23] rounded-lg p-3",
              "hover:border-[#2B2B30] transition-colors",
            )}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-white">{monthName}</h3>
              <span
                className={cn(
                  "text-sm font-medium",
                  monthlyProfit > 0 ? "text-green-400" : monthlyProfit < 0 ? "text-red-400" : "text-gray-400",
                )}
              >
                {monthlyProfit > 0 && "+"}${monthlyProfit.toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-400">Trading Days</p>
                <p className="text-white font-medium">{tradingDays}</p>
              </div>
              <div>
                <p className="text-gray-400">Win Rate</p>
                <p className="text-white font-medium">{winRate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-400">Winning Days</p>
                <p className="text-green-400 font-medium">{winningDays}</p>
              </div>
              <div>
                <p className="text-gray-400">Losing Days</p>
                <p className="text-red-400 font-medium">{losingDays}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

