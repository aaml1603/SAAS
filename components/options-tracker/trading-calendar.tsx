"use client"

import { useState, useEffect } from "react"
import { useCalendarTrades } from "@/hooks/use-calendar-trades"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/animations"
import { useRouter } from "next/navigation"
import MonthView from "./calendar/month-view"
import YearView from "./calendar/year-view"

export default function TradingCalendar() {
  const { dailyStats, isLoading, error, mutate } = useCalendarTrades()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "year">("month")
  const router = useRouter()
  const [key, setKey] = useState(Date.now()) // Force remount key

  // Get current year and month
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Handle day selection
  const handleDayClick = (date: string) => {
    if (date) {
      setSelectedDate(date === selectedDate ? null : date)
    }
  }

  // Auto-select today if it has trades
  useEffect(() => {
    if (!isLoading && !error) {
      const today = new Date().toISOString().split("T")[0]
      if (dailyStats[today]) {
        setSelectedDate(today)
      }
    }
  }, [isLoading, error, dailyStats])

  // Handle view mode change
  const handleViewModeChange = (mode: "month" | "year") => {
    setViewMode(mode)
    // Force remount by changing the key
    setKey(Date.now())
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"
        />
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-900/30 text-red-400 p-4 rounded-lg">Error loading trade data: {error}</div>
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-4 md:space-y-6 w-full px-2 md:px-0 max-w-full md:max-w-5xl mx-auto"
    >
      {/* P&L Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">P&L Calendar</h2>
        </div>
      </div>

      {/* View Mode Selector and Date Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-md overflow-hidden bg-[#0F0F12] border border-[#1F1F23]">
          <button
            onClick={() => handleViewModeChange("month")}
            className={cn(
              "px-6 py-2 text-sm font-medium",
              viewMode === "month" ? "bg-[#1F1F23] text-white" : "text-gray-400 hover:text-white",
            )}
          >
            Month
          </button>
          <button
            onClick={() => handleViewModeChange("year")}
            className={cn(
              "px-6 py-2 text-sm font-medium",
              viewMode === "year" ? "bg-[#1F1F23] text-white" : "text-gray-400 hover:text-white",
            )}
          >
            Year
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            {viewMode === "month" ? (
              <select
                value={`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`}
                onChange={(e) => {
                  const [year, month] = e.target.value.split("-").map(Number)
                  setCurrentDate(new Date(year, month - 1, 1))
                }}
                className="appearance-none bg-[#0F0F12] border border-[#1F1F23] rounded-md py-2 pl-4 pr-10 text-white focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const date = new Date()
                  date.setMonth(date.getMonth() - 12 + i)
                  const year = date.getFullYear()
                  const month = date.getMonth() + 1
                  const label = date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
                  return (
                    <option key={`${year}-${month}`} value={`${year}-${String(month).padStart(2, "0")}`}>
                      {label}
                    </option>
                  )
                })}
              </select>
            ) : (
              <select
                value={currentYear}
                onChange={(e) => {
                  const year = Number.parseInt(e.target.value)
                  setCurrentDate(new Date(year, 0, 1))
                }}
                className="appearance-none bg-[#0F0F12] border border-[#1F1F23] rounded-md py-2 pl-4 pr-10 text-white focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                })}
              </select>
            )}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
              <ChevronRight className="h-4 w-4 rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div key={key}>
        {viewMode === "month" ? (
          <MonthView
            currentYear={currentYear}
            currentMonth={currentMonth}
            dailyStats={dailyStats}
            selectedDate={selectedDate}
            onDayClick={handleDayClick}
          />
        ) : (
          <YearView currentYear={currentYear} dailyStats={dailyStats} />
        )}
      </div>
    </motion.div>
  )
}

