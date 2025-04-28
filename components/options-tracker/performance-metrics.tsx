"use client"

import { cn } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, Percent, DollarSign, TrendingUp, Calendar } from "lucide-react"
import { useTradeStats } from "@/hooks/use-trades"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { staggerContainer, fadeInUp, cardHover } from "@/lib/animations"
import { useIsMobile } from "@/hooks/use-is-mobile"

interface PerformanceMetricsProps {
  refreshData: () => void
}

export default function PerformanceMetrics({ refreshData }: PerformanceMetricsProps) {
  const { stats, isLoading, error } = useTradeStats()
  const [localStats, setLocalStats] = useState(stats)
  const isMobile = useIsMobile()

  // Update local stats whenever the source stats change
  useEffect(() => {
    console.log("Client: 📊 Updating performance metrics with new stats")
    setLocalStats(stats)
  }, [stats])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#0F0F12] border border-[#1F1F23] rounded-xl p-3 sm:p-4 shadow-sm animate-pulse">
            <div className="h-8 w-8 bg-[#1F1F23] rounded-lg mb-3"></div>
            <div className="h-4 w-24 bg-[#1F1F23] rounded mb-2"></div>
            <div className="h-6 w-16 bg-[#1F1F23] rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-900/30 text-red-400 p-4 rounded-lg mb-4"
      >
        Error loading performance metrics: {error}
      </motion.div>
    )
  }

  const metrics = [
    {
      title: "Win Rate",
      value: `${localStats.winRate.toFixed(1)}%`,
      change: "",
      trend: "neutral",
      icon: Percent,
      iconClass: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    },
    {
      title: "Total P&L",
      value: `$${localStats.totalProfit.toLocaleString()}`,
      change: localStats.totalProfit > 0 ? "+" : "",
      trend: localStats.totalProfit > 0 ? "up" : "down",
      icon: DollarSign,
      iconClass:
        localStats.totalProfit > 0
          ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    },
    {
      title: "Avg. Win",
      value: `$${localStats.averageProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      change: "",
      trend: "neutral",
      icon: TrendingUp,
      iconClass: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    },
    {
      title: "Open Positions",
      value: localStats.openTrades.toString(),
      change: "",
      trend: "neutral",
      icon: Calendar,
      iconClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
  ]

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
    >
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          variants={fadeInUp}
          custom={index}
          whileHover="hover"
          initial="rest"
          variants={cardHover}
          className="bg-[#0F0F12] border border-[#1F1F23] rounded-xl p-3 sm:p-4 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={cn("p-2 rounded-lg", metric.iconClass)}
            >
              <metric.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </motion.div>
            {metric.trend !== "neutral" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={cn("flex items-center text-xs", metric.trend === "up" ? "text-green-500" : "text-red-500")}
              >
                {metric.trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                <span>{metric.change}</span>
              </motion.div>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="mt-2 sm:mt-3"
          >
            <h3 className="text-xs sm:text-sm text-gray-400">{metric.title}</h3>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.5 + index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className={cn("font-bold text-white mt-1", isMobile ? "text-lg" : "text-2xl")}
            >
              {metric.value}
            </motion.p>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  )
}

