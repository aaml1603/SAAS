"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoIcon as InfoCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useClosedTrades } from "@/hooks/use-trades"
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export function DailyPLChart() {
  const { closedTrades, isLoading } = useClosedTrades()

  const chartData = useMemo(() => {
    if (!closedTrades.length) return []

    // Group trades by exit date and calculate daily P&L
    const dailyPL = closedTrades.reduce(
      (acc, trade) => {
        if (!trade.exit_date) return acc
        const date = trade.exit_date
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += trade.profit || 0
        return acc
      },
      {} as Record<string, number>,
    )

    // Convert to array and sort by date
    return Object.entries(dailyPL)
      .map(([date, value]) => ({
        date: new Date(date).toLocaleDateString(),
        value,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [closedTrades])

  if (isLoading) {
    return (
      <Card className="bg-[#0F0F12] border-[#1F1F23]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold text-white">Net Daily P&L</CardTitle>
          <InfoCircle className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-[300px]">
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

  return (
    <Card className="bg-[#0F0F12] border-[#1F1F23]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-white">Net Daily P&L</CardTitle>
        <InfoCircle className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  backgroundColor: "#1F1F23",
                  borderColor: "#2B2B30",
                  borderRadius: "0.5rem",
                }}
                labelStyle={{ color: "#9CA3AF" }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "P&L"]}
              />
              <Bar
                dataKey="value"
                fill={(data: any) => (data.value >= 0 ? "#10B981" : "#EF4444")}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

