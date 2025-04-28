"use client"

import { useMemo } from "react"
import { useCalendarTrades } from "@/hooks/use-calendar-trades"
import { cn } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, Calendar, TrendingUp, DollarSign } from "lucide-react"
import { motion } from "framer-motion"
import { fadeInUp, staggerContainer } from "@/lib/animations"

export default function CalendarSummary() {
  const { dailyStats, isLoading, error } = useCalendarTrades()

  const summary = useMemo(() => {
    if (isLoading || error) return null

    const dates = Object.keys(dailyStats).sort()
    if (dates.length === 0) return null

    // Calculate overall stats
    const totalTradingDays = dates.length
    const profitableDays = dates.filter((date) => dailyStats[date].totalProfit > 0).length
    const unprofitableDays = dates.filter((date) => dailyStats[date].totalProfit < 0).length

    const totalProfit = dates.reduce((sum, date) => sum + dailyStats[date].totalProfit, 0)
    const totalInvested = dates.reduce((sum, date) => sum + dailyStats[date].totalInvested, 0)
    const overallPercentageGain = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0

    // Find best and worst days
    let bestDay = dates[0]
    let worstDay = dates[0]

    dates.forEach((date) => {
      if (dailyStats[date].totalProfit > dailyStats[bestDay].totalProfit) {
        bestDay = date
      }
      if (dailyStats[date].totalProfit < dailyStats[worstDay].totalProfit) {
        worstDay = date
      }
    })

    return {
      totalTradingDays,
      profitableDays,
      unprofitableDays,
      winRate: totalTradingDays > 0 ? (profitableDays / totalTradingDays) * 100 : 0,
      totalProfit,
      overallPercentageGain,
      bestDay: {
        date: bestDay,
        profit: dailyStats[bestDay].totalProfit,
        percentageGain: dailyStats[bestDay].percentageGain,
      },
      worstDay: {
        date: worstDay,
        profit: dailyStats[worstDay].totalProfit,
        percentageGain: dailyStats[worstDay].percentageGain,
      },
    }
  }, [dailyStats, isLoading, error])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"
        />
      </div>
    )
  }

  if (error || !summary) {
    return null
  }

  const metrics = [
    {
      title: "Trading Days",
      value: summary.totalTradingDays.toString(),
      icon: Calendar,
      iconClass: "bg-blue-900/30 text-blue-400",
    },
    {
      title: "Win Rate",
      value: `${summary.winRate.toFixed(1)}%`,
      icon: TrendingUp,
      iconClass: "bg-green-900/30 text-green-400",
    },
    {
      title: "Total P&L",
      value: `$${summary.totalProfit.toLocaleString()}`,
      trend: summary.totalProfit > 0 ? "up" : "down",
      icon: DollarSign,
      iconClass: summary.totalProfit > 0 ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400",
    },
    {
      title: "Overall % Gain",
      value: `${summary.overallPercentageGain.toFixed(2)}%`,
      trend: summary.overallPercentageGain > 0 ? "up" : "down",
      icon: TrendingUp,
      iconClass: summary.overallPercentageGain > 0 ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400",
    },
  ]

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
    >
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          variants={fadeInUp}
          custom={index}
          className="bg-[#0F0F12] border border-[#1F1F23] rounded-xl p-4 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className={cn("p-2 rounded-lg", metric.iconClass)}>
              <metric.icon className="w-4 h-4" />
            </div>
            {metric.trend && (
              <div
                className={cn("flex items-center text-xs", metric.trend === "up" ? "text-green-500" : "text-red-500")}
              >
                {metric.trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
              </div>
            )}
          </div>
          <div className="mt-3">
            <h3 className="text-sm text-gray-400">{metric.title}</h3>
            <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

