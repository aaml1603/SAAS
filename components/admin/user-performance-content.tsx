"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { fadeIn } from "@/utils/motion"
import { CumulativePLChart } from "@/components/options-tracker/pl-charts/cumulative-pl-chart"
import { TrackerScore } from "@/components/options-tracker/tracker-score/tracker-score"
import type { Database } from "@/lib/database.types"

type Trade = Database["public"]["Tables"]["trades"]["Row"]

interface UserPerformanceContentProps {
  trades: Trade[]
  isLoading: boolean
  userId: string
}

export default function UserPerformanceContent({ trades, isLoading, userId }: UserPerformanceContentProps) {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          variants={fadeIn("up", "spring", 0 * 0.1, 0.75)}
          initial="hidden"
          animate="show"
          className="col-span-1"
        >
          <Card className="bg-[#0F0F12] border-[#1F1F23]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-white">Total Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalTrades}</div>
              <div className="text-sm text-gray-400 mt-1">
                {stats.openTrades} open, {stats.closedTrades} closed
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={fadeIn("up", "spring", 1 * 0.1, 0.75)}
          initial="hidden"
          animate="show"
          className="col-span-1"
        >
          <Card className="bg-[#0F0F12] border-[#1F1F23]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-white">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-400 mt-1">
                {stats.winningTrades} wins, {stats.losingTrades} losses
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={fadeIn("up", "spring", 2 * 0.1, 0.75)}
          initial="hidden"
          animate="show"
          className="col-span-1"
        >
          <Card className="bg-[#0F0F12] border-[#1F1F23]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-white">Total P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${
                  stats.totalProfit > 0 ? "text-green-500" : stats.totalProfit < 0 ? "text-red-500" : "text-white"
                }`}
              >
                ${stats.totalProfit.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Avg Win: ${stats.averageProfit.toFixed(2)} | Avg Loss: ${stats.averageLoss.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={fadeIn("up", "spring", 3 * 0.1, 0.75)}
          initial="hidden"
          animate="show"
          className="col-span-1"
        >
          <Card className="bg-[#0F0F12] border-[#1F1F23]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-white">Profit Factor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.profitFactor.toFixed(2)}</div>
              <div className="text-sm text-gray-400 mt-1">Largest Gain: ${stats.largestGain.toFixed(2)}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={fadeIn("up", "spring", 0.4, 0.75)} initial="hidden" animate="show" className="col-span-1">
          <TrackerScore userId={userId} />
        </motion.div>

        <motion.div variants={fadeIn("up", "spring", 0.5, 0.75)} initial="hidden" animate="show" className="col-span-1">
          <CumulativePLChart userId={userId} />
        </motion.div>
      </div>

      <motion.div variants={fadeIn("up", "spring", 0.6, 0.75)} initial="hidden" animate="show">
        <Card className="bg-[#0F0F12] border-[#1F1F23]">
          <CardHeader>
            <CardTitle className="text-xl text-white">Trade History</CardTitle>
            <CardDescription>View all trades for this user</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="all">All Trades</TabsTrigger>
                <TabsTrigger value="open">Open Positions</TabsTrigger>
                <TabsTrigger value="closed">Closed Trades</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <TradeTable trades={trades} />
              </TabsContent>

              <TabsContent value="open">
                <TradeTable trades={trades.filter((t) => t.status === "open")} />
              </TabsContent>

              <TabsContent value="closed">
                <TradeTable trades={trades.filter((t) => t.status === "closed")} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function TradeTable({ trades }: { trades: Trade[] }) {
  if (trades.length === 0) {
    return <div className="text-center py-8 text-gray-400">No trades found</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#2B2B30]">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Symbol</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Strategy</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Type</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Direction</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Entry Date</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Exit Date</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400">P&L</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400">Status</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id} className="border-b border-[#2B2B30] hover:bg-[#1F1F23] transition-colors">
              <td className="py-3 px-4 text-sm text-white">{trade.symbol}</td>
              <td className="py-3 px-4 text-sm text-gray-300">{trade.strategy}</td>
              <td className="py-3 px-4 text-sm text-gray-300">{trade.option_type}</td>
              <td className="py-3 px-4 text-sm text-gray-300">{trade.direction}</td>
              <td className="py-3 px-4 text-sm text-gray-300">{new Date(trade.entry_date).toLocaleDateString()}</td>
              <td className="py-3 px-4 text-sm text-gray-300">
                {trade.exit_date ? new Date(trade.exit_date).toLocaleDateString() : "-"}
              </td>
              <td
                className={`py-3 px-4 text-sm text-right ${
                  trade.profit > 0 ? "text-green-500" : trade.profit < 0 ? "text-red-500" : "text-gray-300"
                }`}
              >
                {trade.profit !== null ? `$${trade.profit.toFixed(2)}` : "-"}
              </td>
              <td className="py-3 px-4 text-sm text-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    trade.status === "open" ? "bg-blue-900/30 text-blue-400" : "bg-green-900/30 text-green-400"
                  }`}
                >
                  {trade.status === "open" ? "Open" : "Closed"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

