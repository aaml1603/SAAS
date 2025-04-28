"use client"

import React from "react"

import { cn } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, Search, Filter, Trash2, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useEffect } from "react"
import { deleteTrade } from "@/actions/trade-actions"
import { useToast } from "@/hooks/use-toast"
import { useTrades } from "@/hooks/use-trades"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { deleteTradeDirectly } from "@/lib/supabase"
import Image from "next/image"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface TradeHistoryProps {
  refreshData: () => void
}

export default function TradeHistory({ refreshData }: TradeHistoryProps) {
  // Add a function to calculate percentage gain
  const calculatePercentageGain = (entryPrice: number, exitPrice: number, contracts: number) => {
    // Entry price and exit price are already per share
    // Each contract is for 100 shares
    const invested = entryPrice * contracts * 100
    const profit = (exitPrice - entryPrice) * contracts * 100
    return invested > 0 ? (profit / invested) * 100 : 0
  }

  const { trades: hookTrades, isLoading, error, mutate } = useTrades()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "winning" | "losing" | "open" | "closed">("all")
  const [trades, setTrades] = useState<any[]>([])
  const [viewingTradeId, setViewingTradeId] = useState<string | null>(null)
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const isMobile = useIsMobile()

  useEffect(() => {
    setTrades(hookTrades)
  }, [hookTrades])

  const handleDeleteTrade = async (tradeId: string) => {
    if (!confirm("Are you sure you want to delete this trade?")) {
      return
    }

    try {
      console.log(`Client: 🗑️ Attempting to delete trade with ID: ${tradeId}`)

      // First try the server action
      let result = await deleteTrade(tradeId)
      console.log(`Client: 📊 Server action delete result:`, result)

      // If server action fails and we have a user, try direct Supabase client
      if (!result.success && user) {
        console.log("Client: ⚠️ Server action failed, trying direct Supabase client")
        const directResult = await deleteTradeDirectly(tradeId, user.id)
        console.log("Client: 📊 Direct Supabase delete result:", directResult)

        if (directResult.success) {
          result = { success: true }
        }
      }

      // If both methods fail, try the API route
      if (!result.success) {
        console.log("Client: ⚠️ Direct Supabase failed, trying API route")

        try {
          const apiResponse = await fetch(`/api/trades/${tradeId}`, {
            method: "DELETE",
          })

          const apiResult = await apiResponse.json()
          console.log("Client: 📊 API route delete result:", apiResult)

          if (apiResult.success) {
            result = { success: true }

            // Make sure we refresh even if using the API route
            setTimeout(() => {
              router.refresh()
            }, 300)
          }
        } catch (apiError) {
          console.error("Client: ❌ API route error:", apiError)
        }
      }

      if (result.success) {
        toast({
          title: "Trade deleted successfully",
          variant: "success",
        })

        // Remove the trade from the local state immediately for better UX
        setTrades((prevTrades) => prevTrades.filter((t) => t.id !== tradeId))

        // Force refresh the data
        mutate()

        // Force a refresh of the page to update analytics
        router.refresh()

        // Call the parent's refreshData function
        refreshData()

        // Add a small delay and refresh again to ensure all components update
        setTimeout(() => {
          console.log("Client: 🔄 Performing secondary refresh after deleting trade")
          mutate()
          router.refresh()
          refreshData()

          // Force reload the page as a last resort if needed
          window.location.reload()
        }, 500)
      } else {
        // Check if it's an authentication error
        if (result.authError) {
          toast({
            title: "Session expired",
            description: "Please log in again",
            variant: "destructive",
          })
          // Redirect to login page
          router.push("/login")
        } else {
          toast({
            title: "Error deleting trade",
            description: result.error || "Failed to delete trade",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Client: ❌ Error deleting trade:", error)
      toast({
        title: "Error deleting trade",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleViewTrade = (tradeId: string) => {
    setViewingTradeId(tradeId === viewingTradeId ? null : tradeId)
  }

  const toggleExpandTrade = (tradeId: string) => {
    setExpandedTradeId(expandedTradeId === tradeId ? null : tradeId)
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  // Handle error state with more details
  if (error) {
    return (
      <div className="bg-red-900/30 text-red-400 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Error loading trade history</h3>
        <p>{error}</p>
        <p className="mt-2 text-sm">
          Please check your network connection and ensure your Supabase configuration is correct.
        </p>
      </div>
    )
  }

  // If we have no trades but no error, show empty state
  if (trades.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No trades found</p>
        <p className="text-sm mt-2">Add your first trade to get started</p>
      </div>
    )
  }

  const filteredTrades = trades
    .filter(
      (trade) =>
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.strategy.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((trade) => {
      if (filter === "all") return true
      if (filter === "winning") return trade.profit !== null && trade.profit > 0
      if (filter === "losing") return trade.profit !== null && trade.profit <= 0
      if (filter === "open") return trade.status === "open"
      if (filter === "closed") return trade.status === "closed"
      return true
    })
    .sort((a, b) => {
      // Sort by date (most recent first)
      const dateA = a.exit_date || a.entry_date
      const dateB = b.exit_date || b.entry_date
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })

  return (
    <div className="w-full">
      <div className={cn("flex items-center mb-4 gap-3", isMobile ? "flex-col" : "flex-row justify-between")}>
        <div className={cn("flex items-center gap-2", isMobile ? "w-full" : "w-auto")}>
          <div className={cn("relative", isMobile ? "w-full" : "w-64")}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search trades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-[#1F1F23] border border-[#2B2B30] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>
        <div className={cn("flex items-center gap-2", isMobile ? "w-full" : "w-auto")}>
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className={cn(
              "bg-[#1F1F23] border border-[#2B2B30] rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500",
              isMobile && "flex-1",
            )}
          >
            <option value="all">All Trades</option>
            <option value="open">Open Trades</option>
            <option value="closed">Closed Trades</option>
            <option value="winning">Winning Trades</option>
            <option value="losing">Losing Trades</option>
          </select>
        </div>
      </div>

      {filteredTrades.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No trades found matching your criteria</div>
      ) : isMobile ? (
        // Mobile view
        <div className="space-y-3">
          {filteredTrades.map((trade) => (
            <div key={trade.id} className="bg-[#1A1A1E] rounded-lg border border-[#2B2B30] overflow-hidden">
              <div
                className="p-3 flex justify-between items-center cursor-pointer"
                onClick={() => toggleExpandTrade(trade.id)}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        trade.option_type === "call" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400",
                      )}
                    >
                      {trade.option_type}
                    </span>
                    <span className="font-medium text-white">{trade.symbol}</span>
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{trade.strategy}</span>
                </div>
                <div className="flex flex-col items-end">
                  {trade.profit !== null ? (
                    <div
                      className={cn(
                        "flex items-center text-sm font-medium",
                        trade.profit > 0 ? "text-green-400" : "text-red-400",
                      )}
                    >
                      {trade.profit > 0 ? (
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 mr-1" />
                      )}
                      ${Math.abs(trade.profit).toLocaleString()}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Open</span>
                  )}
                  {expandedTradeId === trade.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 mt-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 mt-1" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {expandedTradeId === trade.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 pt-0 border-t border-[#2B2B30]">
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <p className="text-xs text-gray-400">Entry Date</p>
                          <p className="text-sm text-white">{trade.entry_date}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Exit Date</p>
                          <p className="text-sm text-white">{trade.exit_date || "-"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <p className="text-xs text-gray-400">Entry Price</p>
                          <p className="text-sm text-white">${trade.entry_price}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Exit Price</p>
                          <p className="text-sm text-white">${trade.exit_price || "-"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <p className="text-xs text-gray-400">Strike Price</p>
                          <p className="text-sm text-white">${trade.strike_price}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Contracts</p>
                          <p className="text-sm text-white">{trade.contracts}</p>
                        </div>
                      </div>

                      {trade.profit !== null && trade.exit_price && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-400">% Gain</p>
                          <p
                            className={cn(
                              "text-sm font-medium flex items-center",
                              trade.profit > 0 ? "text-green-400" : "text-red-400",
                            )}
                          >
                            {trade.profit > 0 ? (
                              <ArrowUpRight className="w-3 h-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 mr-1" />
                            )}
                            {calculatePercentageGain(trade.entry_price, trade.exit_price, trade.contracts).toFixed(2)}%
                          </p>
                        </div>
                      )}

                      {trade.notes && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-400">Notes</p>
                          <p className="text-sm text-white whitespace-pre-wrap">{trade.notes}</p>
                        </div>
                      )}

                      {trade.image_url && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-400 mb-1">Trade Setup</p>
                          <div className="relative h-40 w-full rounded-lg overflow-hidden">
                            <Image
                              src={trade.image_url || "/placeholder.svg"}
                              alt="Trade setup"
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                      )}

                      <Button onClick={() => handleDeleteTrade(trade.id)} variant="destructive" className="w-full">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Trade
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      ) : (
        // Desktop view
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#2B2B30]">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Symbol</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Strategy</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Entry Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Exit Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Entry Price</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Exit Price</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400">P&L</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400">% Gain</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade) => (
                <React.Fragment key={trade.id}>
                  <tr className="border-b border-[#2B2B30] hover:bg-[#1F1F23] transition-colors">
                    <td className="py-3 px-4 text-sm text-white">{trade.symbol}</td>
                    <td className="py-3 px-4 text-sm text-white">{trade.strategy}</td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs",
                          trade.option_type === "call"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400",
                        )}
                      >
                        {trade.option_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">{trade.entry_date}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{trade.exit_date || "-"}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">${trade.entry_price}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">${trade.exit_price || "-"}</td>
                    <td
                      className={cn(
                        "py-3 px-4 text-sm font-medium text-right",
                        trade.profit === null ? "text-gray-400" : trade.profit > 0 ? "text-green-400" : "text-red-400",
                      )}
                    >
                      {trade.profit !== null ? (
                        <div className="flex items-center justify-end">
                          {trade.profit > 0 ? (
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 mr-1" />
                          )}
                          ${Math.abs(trade.profit).toLocaleString()}
                        </div>
                      ) : (
                        "Open"
                      )}
                    </td>
                    <td
                      className={cn(
                        "py-3 px-4 text-sm font-medium text-right",
                        trade.profit === null ? "text-gray-400" : trade.profit > 0 ? "text-green-400" : "text-red-400",
                      )}
                    >
                      {trade.profit !== null && trade.exit_price ? (
                        <div className="flex items-center justify-end">
                          {trade.profit > 0 ? (
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 mr-1" />
                          )}
                          {calculatePercentageGain(trade.entry_price, trade.exit_price, trade.contracts).toFixed(2)}%
                        </div>
                      ) : (
                        "Open"
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewTrade(trade.id)}
                          className="p-1 text-gray-400 hover:text-blue-400"
                          title="View Details"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrade(trade.id)}
                          className="p-1 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {viewingTradeId === trade.id && (
                    <tr className="bg-[#1A1A1E]">
                      <td colSpan={9} className="p-4">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-400">Contracts</h4>
                              <p className="text-sm text-white">{trade.contracts}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-400">Strike Price</h4>
                              <p className="text-sm text-white">${trade.strike_price}</p>
                            </div>
                          </div>

                          {trade.notes && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-400">Notes</h4>
                              <p className="text-sm text-white whitespace-pre-wrap">{trade.notes}</p>
                            </div>
                          )}

                          {trade.image_url && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Trade Setup</h4>
                              <div className="relative h-48 w-full rounded-lg overflow-hidden">
                                <Image
                                  src={trade.image_url || "/placeholder.svg"}
                                  alt="Trade setup"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

