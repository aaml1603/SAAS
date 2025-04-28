"use client"

import { useMemo, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { fadeInUp } from "@/lib/animations"
import DailyTradeDetails from "./daily-trade-details"
import type { DailyTradeStats } from "@/hooks/use-calendar-trades"

interface MonthViewProps {
  currentYear: number
  currentMonth: number
  dailyStats: Record<string, DailyTradeStats>
  selectedDate: string | null
  onDayClick: (date: string) => void
}

export default function MonthView({ currentYear, currentMonth, dailyStats, selectedDate, onDayClick }: MonthViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Calculate first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: 0, date: "", isEmpty: true })
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const dateStr = date.toISOString().split("T")[0]
      const hasTrades = !!dailyStats[dateStr]

      days.push({
        day,
        date: dateStr,
        isEmpty: false,
        hasTrades,
        stats: hasTrades ? dailyStats[dateStr] : null,
      })
    }

    return days
  }, [currentYear, currentMonth, daysInMonth, firstDayOfMonth, dailyStats])

  // Force layout recalculation when component mounts
  useEffect(() => {
    if (containerRef.current) {
      // Force a layout recalculation
      const height = containerRef.current.offsetHeight
      console.log("Month view container height:", height)
    }
  }, [])

  return (
    <>
      <div
        ref={containerRef}
        className="bg-[#0F0F12] border border-[#1F1F23] rounded-lg overflow-hidden"
        style={{ minHeight: "300px" }} // Ensure minimum height
      >
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#1F1F23]">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, index) => (
            <div key={index} className="text-center py-2 text-xs font-medium text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((dayInfo, index) => (
            <motion.div
              key={`${dayInfo.date || index}`}
              variants={fadeInUp}
              custom={index}
              transition={{ delay: index * 0.01 }}
              className={cn(
                "h-14 md:h-16 p-0.5 border-b border-r border-[#1F1F23]",
                dayInfo.isEmpty ? "pointer-events-none bg-[#0A0A0D]" : "cursor-pointer",
              )}
              onClick={() => !dayInfo.isEmpty && onDayClick(dayInfo.date)}
            >
              {!dayInfo.isEmpty && (
                <div
                  className={cn(
                    "h-full w-full p-1.5 flex flex-col rounded-md",
                    dayInfo.hasTrades && dayInfo.stats?.totalProfit > 0 ? "bg-green-900/20" : "",
                    dayInfo.hasTrades && dayInfo.stats?.totalProfit < 0 ? "bg-red-900/20" : "",
                    !dayInfo.hasTrades ? "bg-[#0F0F12]" : "",
                    selectedDate === dayInfo.date ? "ring-1 ring-green-500" : "",
                  )}
                >
                  <div className="text-xs font-medium text-gray-300">{dayInfo.day}</div>

                  {dayInfo.hasTrades && dayInfo.stats && (
                    <div className="mt-auto text-center">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          dayInfo.stats.totalProfit > 0 ? "text-green-400" : "text-red-400",
                        )}
                      >
                        {dayInfo.stats.totalProfit > 0 ? "+" : ""}
                        {dayInfo.stats.totalProfit.toFixed(0)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selected Day Details */}
      <AnimatePresence>
        {selectedDate && dailyStats[selectedDate] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#0F0F12] border border-[#1F1F23] rounded-lg overflow-hidden mt-4"
          >
            <DailyTradeDetails stats={dailyStats[selectedDate]} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

