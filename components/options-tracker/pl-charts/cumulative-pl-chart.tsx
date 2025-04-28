"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

interface CumulativePLChartProps {
  userId?: string
}

export function CumulativePLChart({ userId }: CumulativePLChartProps) {
  const { user } = useAuth()
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true)
      try {
        const targetUserId = userId || user?.id
        if (!targetUserId) return

        const { data: trades, error } = await supabase
          .from("trades")
          .select("*")
          .eq("user_id", targetUserId)
          .eq("status", "closed")
          .order("exit_date", { ascending: true })

        if (error) {
          console.error("Error fetching trades for chart:", error)
          return
        }

        if (!trades || trades.length === 0) {
          setChartData([])
          return
        }

        // Process trades to create cumulative P&L data
        let cumulativeProfit = 0
        const processedData = trades.map((trade) => {
          cumulativeProfit += trade.profit || 0
          return {
            date: new Date(trade.exit_date).toLocaleDateString(),
            profit: trade.profit,
            cumulativeProfit: cumulativeProfit,
          }
        })

        setChartData(processedData)
      } catch (err) {
        console.error("Error processing chart data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChartData()
  }, [user, userId])

  const formatYAxis = (value: number) => {
    return `$${value.toFixed(0)}`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1F1F23] p-3 border border-[#2B2B30] rounded-md shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-green-500">Cumulative P&L: ${payload[0].value.toFixed(2)}</p>
          {payload[1] && (
            <p className={payload[1].value >= 0 ? "text-green-500" : "text-red-500"}>
              Trade P&L: ${payload[1].value.toFixed(2)}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-[#0F0F12] border-[#1F1F23]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-white">Cumulative P&L</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-gray-400">No closed trades to display</div>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 5,
                  left: 5,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2B2B30" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9CA3AF" }}
                  tickLine={{ stroke: "#2B2B30" }}
                  axisLine={{ stroke: "#2B2B30" }}
                  tickMargin={5}
                  minTickGap={20}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  tick={{ fill: "#9CA3AF" }}
                  tickLine={{ stroke: "#2B2B30" }}
                  axisLine={{ stroke: "#2B2B30" }}
                  tickMargin={5}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="cumulativeProfit"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: "#10B981", stroke: "#0F0F12" }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="rgba(16, 185, 129, 0.3)"
                  strokeWidth={1}
                  dot={false}
                  activeDot={{ r: 4, fill: "#10B981", stroke: "#0F0F12" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

