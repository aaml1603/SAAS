"use client"

import React from "react"

import { cn } from "@/lib/utils"
import { X, Trash2, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { closeTrade, deleteTrade } from "@/actions/trade-actions"
import { useToast } from "@/hooks/use-toast"
import { useOpenTrades } from "@/hooks/use-trades"
import { useRouter } from "next/navigation"
import { closeTradeDirectly, deleteTradeDirectly } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface OpenPositionsProps {
  refreshData: () => void
}

export default function OpenPositions({ refreshData }: OpenPositionsProps) {
  // Add a function to calculate percentage gain
  const calculatePercentageGain = (entryPrice: number, exitPrice: number, contracts: number) => {
    // Entry price and exit price are already per share
    // Each contract is for 100 shares
    const invested = entryPrice * contracts * 100
    const profit = (exitPrice - entryPrice) * contracts * 100
    return invested > 0 ? (profit / invested) * 100 : 0
  }

  const { openTrades, isLoading, error, mutate } = useOpenTrades()
  const { toast } = useToast()
  const [closingTradeId, setClosingTradeId] = useState<string | null>(null)
  const [exitPrice, setExitPrice] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewingTradeId, setViewingTradeId] = useState<string | null>(null)
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null)
  const router = useRouter()
  const { user, refreshSession } = useAuth()
  const isMobile = useIsMobile()

  const handleClosePosition = async (tradeId: string) => {
    if (!exitPrice || isNaN(Number.parseFloat(exitPrice))) {
      toast({
        title: "Invalid exit price",
        description: "Please enter a valid exit price",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Refresh the session before submitting
      await refreshSession()

      const exitPriceNum = Number.parseFloat(exitPrice)
      console.log(`Client: 🔒 Closing position with ID: ${tradeId}, exit price: ${exitPriceNum}`)

      // Try server action first
      let result = await closeTrade(tradeId, exitPriceNum)
      console.log(`Client: 📊 Server action close result:`, result)

      // If server action fails, try direct Supabase client
      if (!result.success && user) {
        console.log("Client: ⚠️ Server action failed, trying direct Supabase client")
        result = await closeTradeDirectly(tradeId, exitPriceNum, user.id)
        console.log("Client: 📊 Direct Supabase close result:", result)
      }

      // If direct Supabase client fails, try API route
      if (!result.success) {
        console.log("Client: ⚠️ Direct Supabase failed, trying API route")
        const apiResponse = await fetch("/api/trades/close", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tradeId, exitPrice: exitPriceNum }),
        })

        const apiResult = await apiResponse.json()
        console.log("Client: 📊 API route close result:", apiResult)

        if (apiResult.success) {
          result = { success: true }
        } else {
          result = { success: false, error: apiResult.error }
        }
      }

      if (result.success) {
        // Calculate percentage gain for the toast message
        const trade = openTrades.find((t) => t.id === tradeId)
        if (trade) {
          const profit = (exitPriceNum - trade.entry_price) * trade.contracts * 100
          const percentageGain = calculatePercentageGain(trade.entry_price, exitPriceNum, trade.contracts)

          toast({
            title: "Position closed successfully",
            description: `P&L: $${profit.toFixed(2)} (${percentageGain.toFixed(2)}%)`,
            variant: "success",
          })
        }
        setClosingTradeId(null)
        setExitPrice("")

        // Force refresh the data
        mutate()

        // Force a refresh of the page to update analytics
        router.refresh()

        // Call the parent's refreshData function
        refreshData()

        // Add a small delay and refresh again to ensure all components update
        setTimeout(() => {
          console.log("Client: 🔄 Performing secondary refresh after closing position")
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
            title: "Error closing position",
            description: result.error,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Client: ❌ Error closing position:", error)
      toast({
        title: "Error closing position",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTrade = async (tradeId: string) => {
    if (!confirm("Are you sure you want to delete this trade?")) {
      return
    }

    try {
      console.log(`Client: 🗑️ Deleting trade with ID: ${tradeId}`)

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
            description: result.error,
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        <span className="ml-3 text-sm text-gray-400">Loading positions...</span>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-900/30 text-red-400 p-4 rounded-lg">Error loading open positions: {error}</div>
  }

  if (openTrades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400">
        <p>No open positions</p>
        <button
          onClick={() => mutate()}
          className="mt-4 px-4 py-2 bg-[#1F1F23] hover:bg-[#2B2B30] rounded-md text-sm transition-colors"
        >
          Refresh Data
        </button>
      </div>
    )
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="w-full space-y-3">
        {openTrades.map((trade) => (
          <div key={trade.id} className="bg-[#1A1A1E] rounded-lg border border-[#2B2B30] overflow-hidden">
            <div
              className="p-3 flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpandTrade(trade.id)}
            >
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">${trade.strike_price}</span>
                {expandedTradeId === trade.id ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
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
                        <p className="text-xs text-gray-400">Entry Price</p>
                        <p className="text-sm text-white">${trade.entry_price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Expiry Date</p>
                        <p className="text-sm text-white">{trade.expiry_date}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mb-3">
                      <div>
                        <p className="text-xs text-gray-400">Strategy</p>
                        <p className="text-sm text-white">{trade.strategy}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Contracts</p>
                        <p className="text-sm text-white">{trade.contracts}</p>
                      </div>
                    </div>

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

                    <div className="flex flex-col gap-2">
                      {closingTradeId === trade.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Exit price"
                            value={exitPrice}
                            onChange={(e) => setExitPrice(e.target.value)}
                            className="flex-1 px-2 py-1.5 bg-[#2B2B30] border border-[#3F3F46] rounded text-white text-sm"
                            step="0.01"
                            min="0"
                            autoFocus
                          />
                          <Button
                            onClick={() => handleClosePosition(trade.id)}
                            disabled={isSubmitting}
                            size="sm"
                            className="px-3"
                          >
                            {isSubmitting ? "..." : "Close"}
                          </Button>
                          <button
                            onClick={() => setClosingTradeId(null)}
                            className="p-1.5 text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Button onClick={() => setClosingTradeId(trade.id)} variant="secondary" className="w-full">
                            Close Position
                          </Button>
                          <Button onClick={() => handleDeleteTrade(trade.id)} variant="destructive" className="w-full">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Trade
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    )
  }

  // Desktop view
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#2B2B30]">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Symbol</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Type</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Strike</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Expiry</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Entry</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {openTrades.map((trade) => (
              <React.Fragment key={trade.id}>
                <tr className="border-b border-[#2B2B30] hover:bg-[#1F1F23] transition-colors">
                  <td className="py-3 px-4 text-sm text-white">{trade.symbol}</td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        trade.option_type === "call" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400",
                      )}
                    >
                      {trade.option_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">${trade.strike_price}</td>
                  <td className="py-3 px-4 text-sm text-gray-300">{trade.expiry_date}</td>
                  <td className="py-3 px-4 text-sm text-gray-300">${trade.entry_price}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {closingTradeId === trade.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            placeholder="Exit price"
                            value={exitPrice}
                            onChange={(e) => setExitPrice(e.target.value)}
                            className="w-24 px-2 py-1 bg-[#2B2B30] border border-[#3F3F46] rounded text-white text-sm"
                            step="0.01"
                            min="0"
                            autoFocus
                          />
                          <Button onClick={() => handleClosePosition(trade.id)} disabled={isSubmitting} size="sm">
                            {isSubmitting ? "..." : "Close"}
                          </Button>
                          <button
                            onClick={() => setClosingTradeId(null)}
                            className="p-1 text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Button onClick={() => setClosingTradeId(trade.id)} variant="secondary" size="sm">
                            Close Position
                          </Button>
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
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                {viewingTradeId === trade.id && (
                  <tr className="bg-[#1A1A1E]">
                    <td colSpan={6} className="p-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-400">Strategy</h4>
                            <p className="text-sm text-white">{trade.strategy}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-400">Contracts</h4>
                            <p className="text-sm text-white">{trade.contracts}</p>
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
    </div>
  )
}

