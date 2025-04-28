"use client"

import { cn } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useIsMobile } from "@/hooks/use-is-mobile"
import type { DailyTradeStats } from "@/hooks/use-calendar-trades"

export default function DailyTradeDetails({ stats }: { stats: DailyTradeStats }) {
  const isMobile = useIsMobile()

  // Fix date handling to ensure consistency
  const parseDate = (dateString: string) => {
    // Parse the date string in YYYY-MM-DD format
    const [year, month, day] = dateString.split("-").map(Number)
    return new Date(year, month - 1, day)
  }

  const date = parseDate(stats.date)

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: isMobile ? "short" : "long",
    year: "numeric",
    month: isMobile ? "short" : "long",
    day: "numeric",
  })

  return (
    <div className="p-3 md:p-4 space-y-3 md:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h3 className="text-base md:text-lg font-bold text-white">{formattedDate}</h3>
        <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <div className="text-xs md:text-sm text-gray-400">Total P&L</div>
            <div
              className={cn(
                "text-base md:text-lg font-bold",
                stats.totalProfit > 0 ? "text-green-400" : stats.totalProfit < 0 ? "text-red-400" : "text-gray-400",
              )}
            >
              ${stats.totalProfit.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs md:text-sm text-gray-400">% Gain</div>
            <div
              className={cn(
                "text-base md:text-lg font-bold flex items-center justify-end",
                stats.percentageGain > 0
                  ? "text-green-400"
                  : stats.percentageGain < 0
                    ? "text-red-400"
                    : "text-gray-400",
              )}
            >
              {stats.percentageGain > 0 ? (
                <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              ) : stats.percentageGain < 0 ? (
                <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              ) : null}
              {stats.percentageGain.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="overflow-x-auto -mx-3 md:mx-0">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-[#1F1F23]">
              <thead>
                <tr className="border-b border-[#1F1F23]">
                  <th className="text-left py-2 px-2 md:px-4 text-xs font-semibold text-gray-400">Symbol</th>
                  <th className="text-left py-2 px-2 md:px-4 text-xs font-semibold text-gray-400">Type</th>
                  <th className="text-left py-2 px-2 md:px-4 text-xs font-semibold text-gray-400">Strike</th>
                  <th className="text-left py-2 px-2 md:px-4 text-xs font-semibold text-gray-400">Entry</th>
                  <th className="text-left py-2 px-2 md:px-4 text-xs font-semibold text-gray-400">Exit</th>
                  <th className="text-right py-2 px-2 md:px-4 text-xs font-semibold text-gray-400">P&L</th>
                  <th className="text-right py-2 px-2 md:px-4 text-xs font-semibold text-gray-400">% Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F23]">
                {stats.trades.map((trade) => {
                  // Calculate individual trade percentage gain
                  const invested = trade.entry_price * trade.contracts * 100
                  const percentGain = invested > 0 ? ((trade.profit || 0) / invested) * 100 : 0

                  return (
                    <tr key={trade.id} className="border-b border-[#1F1F23] hover:bg-[#1F1F23] transition-colors">
                      <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm text-white">{trade.symbol}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm">
                        <span
                          className={cn(
                            "px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs",
                            trade.option_type === "call"
                              ? "bg-green-900/30 text-green-400"
                              : "bg-red-900/30 text-red-400",
                          )}
                        >
                          {isMobile
                            ? trade.option_type.charAt(0).toUpperCase()
                            : `${trade.direction} ${trade.option_type}`}
                        </span>
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm text-gray-300">
                        ${trade.strike_price}
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm text-gray-300">
                        ${trade.entry_price}
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm text-gray-300">
                        ${trade.exit_price || "-"}
                      </td>
                      <td
                        className={cn(
                          "py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-right",
                          trade.profit === null
                            ? "text-gray-400"
                            : trade.profit > 0
                              ? "text-green-400"
                              : "text-red-400",
                        )}
                      >
                        {trade.profit !== null ? (
                          <div className="flex items-center justify-end">
                            {trade.profit > 0 ? (
                              <ArrowUpRight className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                            )}
                            ${Math.abs(trade.profit).toLocaleString()}
                          </div>
                        ) : (
                          "Open"
                        )}
                      </td>
                      <td
                        className={cn(
                          "py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-right",
                          trade.profit === null ? "text-gray-400" : percentGain > 0 ? "text-green-400" : "text-red-400",
                        )}
                      >
                        {trade.profit !== null ? (
                          <div className="flex items-center justify-end">
                            {percentGain > 0 ? (
                              <ArrowUpRight className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                            )}
                            {percentGain.toFixed(2)}%
                          </div>
                        ) : (
                          "Open"
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

