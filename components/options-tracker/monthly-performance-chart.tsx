"use client"

import { useEffect, useRef } from "react"
import { useCalendarTrades } from "@/hooks/use-calendar-trades"
import { motion } from "framer-motion"
import { useIsMobile } from "@/hooks/use-is-mobile"

export default function MonthlyPerformanceChart({ month, year }: { month: number; year: number }) {
  const { dailyStats, isLoading, error } = useCalendarTrades()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!canvasRef.current || isLoading || error) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Filter trades for the selected month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const dataPoints = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split("T")[0]

      if (dailyStats[dateStr]) {
        dataPoints.push({
          day,
          profit: dailyStats[dateStr].totalProfit,
          percentGain: dailyStats[dateStr].percentageGain,
        })
      }
    }

    if (dataPoints.length === 0) {
      // Draw "No data available" message
      ctx.fillStyle = "#9CA3AF"
      ctx.font = isMobile ? "12px sans-serif" : "14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("No trade data available for this month", rect.width / 2, rect.height / 2)
      return
    }

    // Calculate min and max values for scaling
    const minProfit = Math.min(0, ...dataPoints.map((point) => point.profit))
    const maxProfit = Math.max(...dataPoints.map((point) => point.profit))
    const profitRange = maxProfit - minProfit

    // Calculate chart dimensions
    const padding = isMobile
      ? { top: 15, right: 10, bottom: 25, left: 40 }
      : { top: 20, right: 20, bottom: 30, left: 60 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom

    // Draw axes
    ctx.strokeStyle = "#1F1F23"
    ctx.lineWidth = 1

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, rect.height - padding.bottom)
    ctx.stroke()

    // X-axis
    ctx.beginPath()
    ctx.moveTo(padding.left, rect.height - padding.bottom)
    ctx.lineTo(rect.width - padding.right, rect.height - padding.bottom)
    ctx.stroke()

    // Draw horizontal grid lines
    const numGridLines = isMobile ? 3 : 5
    ctx.strokeStyle = "#1F1F23"
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])

    for (let i = 0; i <= numGridLines; i++) {
      const y = padding.top + (chartHeight / numGridLines) * i
      const value = maxProfit - (profitRange / numGridLines) * i

      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(rect.width - padding.right, y)
      ctx.stroke()

      // Draw y-axis labels
      ctx.fillStyle = "#9CA3AF"
      ctx.font = isMobile ? "8px sans-serif" : "10px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(`$${value.toFixed(0)}`, padding.left - 5, y + 3)
    }

    ctx.setLineDash([])

    // Draw zero line if it's within the range
    if (minProfit < 0 && maxProfit > 0) {
      const zeroY = padding.top + chartHeight * (maxProfit / profitRange)
      ctx.strokeStyle = "#1F1F23"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(padding.left, zeroY)
      ctx.lineTo(rect.width - padding.right, zeroY)
      ctx.stroke()
    }

    // Draw bars
    const barWidth = Math.min(isMobile ? 15 : 30, chartWidth / dataPoints.length - (isMobile ? 5 : 10))

    dataPoints.forEach((point, index) => {
      const x = padding.left + (chartWidth / daysInMonth) * point.day - barWidth / 2

      // Calculate bar height based on profit
      const barHeight = (Math.abs(point.profit) / profitRange) * chartHeight

      // Calculate y position based on whether profit is positive or negative
      const y =
        point.profit >= 0
          ? padding.top + (chartHeight * (maxProfit - point.profit)) / profitRange
          : padding.top + (chartHeight * maxProfit) / profitRange

      // Set bar color based on profit
      ctx.fillStyle = point.profit >= 0 ? "#10B981" : "#EF4444"

      // Draw the bar
      ctx.fillRect(x, y, barWidth, point.profit >= 0 ? barHeight : -barHeight)

      // Draw day label on x-axis (only for every 5th day on mobile)
      if (!isMobile || point.day % 5 === 0 || point.day === 1 || point.day === daysInMonth) {
        ctx.fillStyle = "#9CA3AF"
        ctx.font = isMobile ? "8px sans-serif" : "10px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(point.day.toString(), x + barWidth / 2, rect.height - padding.bottom + (isMobile ? 10 : 15))
      }
    })

    // Draw month total
    const monthlyTotal = dataPoints.reduce((sum, point) => sum + point.profit, 0)
    ctx.fillStyle = monthlyTotal >= 0 ? "#10B981" : "#EF4444"
    ctx.font = isMobile ? "bold 12px sans-serif" : "bold 14px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(`Monthly Total: $${monthlyTotal.toLocaleString()}`, rect.width - padding.right, padding.top - 5)
  }, [dailyStats, isLoading, error, month, year, isMobile])

  return (
    <div className="w-full h-[150px] md:h-[200px]">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="rounded-full h-6 w-6 md:h-8 md:w-8 border-t-2 border-b-2 border-green-500"
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          <canvas ref={canvasRef} className="w-full h-full" />
        </motion.div>
      )}
    </div>
  )
}

