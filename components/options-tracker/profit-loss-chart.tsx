"use client"

import { useMemo } from "react"
import { useClosedTrades } from "@/hooks/use-trades"
import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function ProfitLossChart() {
  const { closedTrades, isLoading, error } = useClosedTrades()

  // Transform trade data into chart format
  const chartData = useMemo(() => {
    if (!closedTrades.length) return []

    // Sort trades by exit date
    const sortedTrades = [...closedTrades]
      .filter((trade) => trade.exit_date)
      .sort((a, b) => new Date(a.exit_date!).getTime() - new Date(b.exit_date!).getTime())

    // Calculate cumulative P&L
    let cumulativePL = 0
    return sortedTrades.map((trade) => {
      cumulativePL += trade.profit || 0
      return {
        date: new Date(trade.exit_date!).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        profit: cumulativePL,
        rawDate: trade.exit_date,
      }
    })
  }, [closedTrades])

  // Calculate total profit/loss
  const totalPL = useMemo(() => {
    if (!chartData.length) return 0
    return chartData[chartData.length - 1].profit
  }, [chartData])

  // Calculate percentage change
  const percentageChange = useMemo(() => {
    if (!closedTrades.length) return 0

    const totalInvested = closedTrades.reduce((sum, trade) => {
      return sum + trade.entry_price * trade.contracts * 100
    }, 0)

    return totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0
  }, [closedTrades, totalPL])

  if (isLoading) {
    return (
      <Card className="bg-[#0F0F12] border-[#1F1F23]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-white">Profit/Loss Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-[250px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-[#0F0F12] border-[#1F1F23]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-white">Profit/Loss Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-900/30 text-red-400 p-4 rounded-lg">Error loading chart data: {error}</div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className="bg-[#0F0F12] border-[#1F1F23]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-white">Profit/Loss Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col justify-center items-center h-[250px] text-gray-400">
            <p>No closed trades data available</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#1F1F23] hover:bg-[#2B2B30] rounded-md text-sm transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Format date range for display
  const dateRange = `${new Date(chartData[0].rawDate!).toLocaleDateString("en-US", { month: "long" })} - ${new Date(chartData[chartData.length - 1].rawDate!).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`

  return (
    <Card className="bg-[#0F0F12] border-[#1F1F23]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-white">Profit/Loss Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d2d42" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
                tickMargin={8}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  borderColor: "#2d2d42",
                  borderRadius: "0.5rem",
                  color: "white",
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "P&L"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area type="monotone" dataKey="profit" stroke="#10B981" fillOpacity={1} fill="url(#profitGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex w-full items-start gap-2 text-sm mt-4">
          <div className="grid gap-2">
            <div
              className={cn(
                "flex items-center gap-2 font-medium leading-none",
                totalPL >= 0 ? "text-green-400" : "text-red-400",
              )}
            >
              {totalPL >= 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4" />${totalPL.toFixed(2)} ({percentageChange.toFixed(2)}%)
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4" />${Math.abs(totalPL).toFixed(2)} (
                  {Math.abs(percentageChange).toFixed(2)}%)
                </>
              )}
            </div>
            <div className="flex items-center gap-2 leading-none text-gray-400">{dateRange}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

